const express = require("express");
const http = require('http');
const path = require("path");
const bodyparser = require("body-parser");
const exphbs = require("express-handlebars");
const methodOverride = require("method-override");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const crypto = require("crypto");
const helmet = require("helmet");
const compression = require('compression');
const { allowInsecurePrototypeAccess } = require("@handlebars/allow-prototype-access");
const Message = require('../models/Message');
const socketIO = require('socket.io');
const Visit = require("../models/Visit");

// Función para generar una clave secreta única
const generateRandomString = (length) => {
  return crypto.randomBytes(length).toString("hex");
};

// Generar una clave secreta única
const secretKey = generateRandomString(64); // Se recomienda una longitud de 64 caracteres

// Inicializaciones
const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// Limitar la cantidad de conexiones simultáneas
const maxConnections = 100; // Número máximo de conexiones permitidas
let activeConnections = 0;

// Usar el middleware de compresión
app.use(compression());

// Configuración de la base de datos y passport
require("../database/database");
require("../config/passport");
require('dotenv').config();

// Configuración para confiar en el proxy
app.set('trust proxy', 1);

// Settings
app.set("port", process.env.PORT || 3001);
app.set("views", path.join(__dirname, "../views"));

// Configuración del motor de plantillas para la plantilla principal "main.hbs"
const mainEngine = exphbs.create({
  defaultLayout: "main",
  layoutsDir: path.join(app.get("views"), "layouts"),
  partialsDir: path.join(app.get("views"), "partials"),
  extname: ".hbs",
  handlebars: allowInsecurePrototypeAccess(require("handlebars")),
});

// Establecer el motor de plantillas "mainEngine" para la plantilla principal "main.hbs"
app.engine(".hbs", mainEngine.engine);

// Configuración del motor de plantillas y extensión de las vistas
app.set("view engine", ".hbs");

// Configuración de bodyParser.json()
app.use(express.json());

// Middlewares
app.use(bodyparser.json());
app.use(express.urlencoded({ extended: false }));
app.use(methodOverride("_method"));
app.use(
  session({
    secret: secretKey,
    resave: true,
    saveUninitialized: true,
    cookie: {
      secure: false,
      httpOnly: true,
      maxAge: 30 * 60 * 1000,
      sameSite: 'lax',
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// Global Variables
app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  res.locals.user = req.user || null;
  next();
});

// Helmet Middlewares
app.use(helmet.hidePoweredBy());
app.use(helmet.hsts());
app.use(helmet.ieNoOpen());
app.use(helmet.noSniff());
app.use(helmet.frameguard());
app.use(helmet.xssFilter());

// Static Files
app.use(express.static(path.join(__dirname, "../public")));

// Función de throttle para limitar la frecuencia de las emisiones
const throttle = (func, limit) => {
  let lastFunc;
  let lastRan;
  return function(...args) {
    if (!lastRan) {
      func.apply(this, args);
      lastRan = Date.now();
    } else {
      clearTimeout(lastFunc);
      lastFunc = setTimeout(() => {
        if ((Date.now() - lastRan) >= limit) {
          func.apply(this, args);
          lastRan = Date.now();
        }
      }, limit - (Date.now() - lastRan));
    }
  };
};

// chat
app.get("/", async (req, res, next) => {
  try {
    // Registrar visita
    const visit = await Visit.findOneAndUpdate(
      { page: "home" },
      { $inc: { count: 1 } },
      { upsert: true, new: true }
    );

    // Renderizar vista con contador
    res.render("index", { visitCount: visit.count });
  } catch (error) {
    console.error("Error al contar visitas:", error);
    res.render("index", { visitCount: "N/A" });
  }
});

app.get('/messages', async (req, res) => {
  try {
      const messages = await Message.find({});
      res.send(messages);
  } catch (error) {
      res.status(500).send({ error: 'Internal Server Error' });
  }
});

app.get('/messages/:user', async (req, res) => {
  try {
      const user = req.params.user;
      const messages = await Message.find({ name: user });
      res.send(messages);
  } catch (error) {
      res.status(500).send({ error: 'Internal Server Error' });
  }
});

app.post('/messages', async (req, res) => {
  try {
      const message = new Message(req.body);
      const savedMessage = await message.save();

      const censored = await Message.findOne({ message: 'badword' });
      if (censored) {
          await Message.remove({ _id: censored.id });
      } else {
          const throttledEmit = throttle((msg) => {
            io.emit('message', msg); // Emitir el mensaje a través de Socket.IO
          }, 2000); // Emite el mensaje máximo cada 2 segundos
          throttledEmit(req.body);
      }

      res.sendStatus(200);
  } catch (error) {
      console.error('Error:', error);
      res.sendStatus(500);
  }
});

io.on('connection', (socket) => {
  if (activeConnections >= maxConnections) {
    socket.emit('error', 'Max connections limit reached');
    socket.disconnect();
    return;
  }

  activeConnections++;

  // Desconectar automáticamente usuarios inactivos
  const inactiveTimeout = 300000; // 5 minutos en milisegundos
  let timeout;

  const resetTimeout = () => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      socket.emit('error', 'You have been disconnected due to inactivity');
      socket.disconnect();
    }, inactiveTimeout);
  };

  resetTimeout();

  socket.on('message', resetTimeout);
  socket.on('someOtherEvent', resetTimeout);

  socket.on('disconnect', () => {
    clearTimeout(timeout);
    activeConnections--;
  });

  console.log('a user is connected');
});
// fin chat

// Routes
app.use(require("../routes/index"));
app.use(require("../routes/quienes_somos"));
app.use(require("../routes/historias"));
app.use(require("../routes/users"));
app.use(require("../routes/panel"));
app.use(require("../routes/contacto"));
app.use(require("../routes/sitemap"));
app.use(require("../routes/politicas"));
app.use(require("../routes/fotos"));

// Manejo de errores
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    res.status(400).json({ error: 'Invalid JSON payload' });
  } else {
    console.error("Error inesperado:", err);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = server;

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
const io = socketIO(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? ["https://www.radiotutuven.cl", "https://radiotutuven.cl"] 
      : "*",
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ['websocket', 'polling'],
  allowEIO3: true,
  pingTimeout: 60000,
  pingInterval: 25000,
  upgradeTimeout: 30000,
  maxHttpBufferSize: 1e6,
  // Debugging para producción
  logger: process.env.NODE_ENV === 'production' ? console : undefined
});

// Limitar la cantidad de conexiones simultáneas
const maxConnections = 100; // Número máximo de conexiones permitidas
let activeConnections = 0;

// Usar el middleware de compresión
app.use(compression());

// Middleware de logging para producción
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.url} - ${req.ip}`);
    next();
  });
}

// Configuración de la base de datos y passport
require("../database/database");
require("../config/passport");
require('dotenv').config();

// Configuración para confiar en el proxy
app.set('trust proxy', 1);

// Headers adicionales para mejorar compatibilidad
app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }
  next();
});

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
    resave: false,
    saveUninitialized: false,
    name: 'radiotutuven.sid',
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 horas
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      domain: process.env.NODE_ENV === 'production' ? '.radiotutuven.cl' : undefined
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

// Helmet Middlewares con configuración mejorada para producción
app.use(helmet.hidePoweredBy());
app.use(helmet.hsts({
  maxAge: 31536000, // 1 año
  includeSubDomains: true,
  preload: true
}));
app.use(helmet.ieNoOpen());
app.use(helmet.noSniff());
app.use(helmet.frameguard({ action: 'sameorigin' }));
app.use(helmet.xssFilter());
app.use(helmet.referrerPolicy({ policy: 'same-origin' }));

// Configurar CSP para permitir todos los recursos necesarios
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdnjs.cloudflare.com"],
    fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com"],
    scriptSrc: [
      "'self'", 
      "'unsafe-inline'", 
      "https://www.googletagmanager.com", 
      "https://www.google-analytics.com", 
      "https://googleads.g.doubleclick.net", 
      "https://pagead2.googlesyndication.com",
      "https://www.google.com",
      "https://www.gstatic.com",
      "https://code.jquery.com",
      "https://static.cloudflareinsights.com",
      "https://ep1.adtrafficquality.google",
      "https://ep2.adtrafficquality.google"
    ],
    mediaSrc: ["'self'", "https://stream.cloudmusic.cl", "data:"],
    connectSrc: [
      "'self'", 
      "wss://www.radiotutuven.cl:*",
      "wss://radiotutuven.cl:*",
      "https://www.radiotutuven.cl",
      "https://radiotutuven.cl",
      "https://stream.cloudmusic.cl", 
      "https://www.google-analytics.com",
      "https://ep1.adtrafficquality.google",
      "https://ep2.adtrafficquality.google",
      "https://googleads.g.doubleclick.net",
      "https://pagead2.googlesyndication.com"
    ],
    imgSrc: ["'self'", "data:", "https:", "http:"],
    frameSrc: [
      "'self'", 
      "https://googleads.g.doubleclick.net", 
      "https://tpc.googlesyndication.com",
      "https://www.google.com",
      "https://ep1.adtrafficquality.google",
      "https://ep2.adtrafficquality.google"
    ],
    frameAncestors: [
      "'self'",
      "https://www.google.com",
      "https://googleads.g.doubleclick.net", 
      "https://tpc.googlesyndication.com"
    ],
    objectSrc: ["'none'"],
    baseUri: ["'self'"],
    formAction: ["'self'"],
    upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : undefined,
  },
  reportOnly: false, // Siempre enforcar en producción
}));

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
    res.render("index", { visitCount: visit.count, recaptchaSiteKey: process.env.RECAPTCHA_SITE_KEY });
  } catch (error) {
    console.error("Error al contar visitas:", error);
    res.render("index", { visitCount: "N/A", recaptchaSiteKey: process.env.RECAPTCHA_SITE_KEY });
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
app.use(require("../routes/programacion"));
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

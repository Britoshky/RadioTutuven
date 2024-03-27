const express = require("express");
const http = require('http');
const path = require("path");
const exphbs = require("express-handlebars");
const methodOverride = require("method-override");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const crypto = require("crypto");
const helmet = require("helmet");
const compression = require('compression');
const { allowInsecurePrototypeAccess } = require("@handlebars/allow-prototype-access");
const WebSocket = require('ws');
const Chat = require('../models/Chat');

// Función para generar una clave secreta única
const generateRandomString = (length) => {
  return crypto.randomBytes(length).toString("hex");
};

// Generar una clave secreta única
const secretKey = generateRandomString(64); // Se recomienda una longitud de 64 caracteres

// Inicializaciones
const app = express();
const server = http.createServer(app);

// Configura WebSocket
const wss = new WebSocket.Server({ server, host: '0.0.0.0'});

wss.on('connection', ws => {
  console.log('Conexión WebSocket establecida');

  ws.on('message', async message => {
    try {
      const newChatMessage = new Chat({
        message: message,
        sender: 'Nombre del remitente'
      });
      console.log("Mensaje enviado");
      await newChatMessage.save();
    } catch (error) {
      console.error('Error al guardar el mensaje en la base de datos:', error);
      return;
    }

    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });
});

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

// Routes
app.use(require("../routes/index"));
app.use(require("../routes/quienes_somos"));
app.use(require("../routes/historias"));
app.use(require("../routes/users"));
app.use(require("../routes/panel"));
app.use(require("../routes/contacto"));
app.use(require("../routes/sitemap"));
app.use(require("../routes/politicas"));

// Manejo de errores
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    res.status(400).json({ error: 'Invalid JSON payload' });
  } else {
    console.error("Error inesperado:", err);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = { app, server, wss };

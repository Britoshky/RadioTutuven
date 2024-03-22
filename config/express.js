const express = require("express");
const path = require("path");
const exphbs = require("express-handlebars");
const methodOverride = require("method-override");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const cors = require("cors");
const crypto = require("crypto");
const helmet = require("helmet");
const compression = require('compression');
const { allowInsecurePrototypeAccess } = require("@handlebars/allow-prototype-access");
const Chat = require("../models/Chat");

const WebSocket = require('ws');

const wss = new WebSocket.Server({ port:8080 });

const generateRandomString = (length) => {
  return crypto.randomBytes(length).toString("hex");
};

// Generar una clave secreta única
const secretKey = generateRandomString(64); // Se recomienda una longitud de 64 caracteres



// Initializations
const app = express();


// Usar el middleware de compresión
app.use(compression());
require("../database/database");
require("../config/passport");
require('dotenv').config();



// Configuración para confiar en el proxy
app.set('trust proxy', 1);



// Middleware para verificar las solicitudes CORS
// app.use((req, res, next) => {
//   const origin = req.get('origin');
//   if (!origin) {
//     console.log(`Solicitud sin encabezado Origin desde la URL: ${req.url}`);
//   }
//   next();
// });

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

// Configuración del motor de plantillas para la plantilla principal "panel.hbs"
const panelEngine = exphbs.create({
  defaultLayout: "panel",
  layoutsDir: path.join(app.get("views"), "layouts"),
  partialsDir: path.join(app.get("views"), "partials"),
  extname: ".hbs",
  handlebars: allowInsecurePrototypeAccess(require("handlebars")),
});

// Establecer el motor de plantillas "mainEngine" para la plantilla principal "main.hbs"
app.engine(".hbs", mainEngine.engine);

// Establecer el motor de plantillas "panelEngine" para la plantilla principal "panel.hbs"
app.engine("panel.hbs", panelEngine.engine);

// Establecer la extensión de las vistas y el motor de renderizado por defecto
app.set("view engine", ".hbs");

// Configuración de Content Security Policy (CSP)


// Configuración de bodyParser.json()
app.use(express.json());
// Middlewares
app.use(express.urlencoded({ extended: false }));
app.use(methodOverride("_method"));
app.use(
  session({
    secret: secretKey,
    resave: true, // No vuelva a guardar la sesión si no ha cambiado
    saveUninitialized: true, // No guarde sesiones no modificadas
    cookie: {
      secure: true, // Cambiar a true si estás usando HTTPS
      httpOnly: true,
      maxAge: 30 * 60 * 1000, // 30 minutos
      sameSite: 'lax', // Configura 'strict' o 'none' según tus necesidades
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

// Manejo de conexiones WebSocket
wss.on('connection', ws => {

  ws.on('message', async message => {

    // Guardar el mensaje en la base de datos
    try {
      const newChatMessage = new Chat({
        message: message,
        sender: 'Nombre del remitente' // Puedes cambiar esto según sea necesario
      });
      await newChatMessage.save();
    } catch (error) {
      console.error('Error al guardar el mensaje en la base de datos:', error);
      return;
    }

    // Envía el mensaje a todos los clientes conectados
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });
});




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


module.exports = app;

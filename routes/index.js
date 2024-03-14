const express = require("express");
const router = express.Router();
const moment = require("moment");
const NodeCache = require("node-cache");

const nodemailer = require("nodemailer");
const verifyRecaptcha = require("../middleware/verifyRecaptcha");
const sitemapUpdateMiddleware = require('../middleware/sitemap');

// Tiempo de vida del caché en segundos (6 horas = 21600 segundos)
const cache = new NodeCache({ stdTTL: 21600 });


// Middleware para deshabilitar la caché
router.use((req, res, next) => {
  res.header("Cache-Control", "no-cache, private, no-store, must-revalidate");
  res.header("Expires", "-1");
  res.header("Pragma", "no-cache");
  next();
});


// Middleware para cachear las rutas
router.use((req, res, next) => {
  const key = req.originalUrl;
  const cachedData = cache.get(key);
  if (cachedData) {
    console.log(`Recuperando datos de la caché para la ruta: ${key}`);
    res.locals.cachedData = cachedData; // Almacena los datos en res.locals
  }
  next(); // Continúa con el siguiente middleware o ruta
});

// Ruta para mostrar los elementos en la página principal
router.get("/", async (req, res, next) => {
  //router.use(sitemapUpdateMiddleware);

  res.render("index");
});

// Ruta para manejar el envío del formulario
router.post("/send-email", verifyRecaptcha, async (req, res) => {
  const { name, email, message } = req.body;
  try {
    const transporter = nodemailer.createTransport({
      host: "email-smtp.us-east-1.amazonaws.com",
      port: 587,
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: "AKIAWNVMKJWXXOCAHO6D",
        pass: "BFGGhFtjX+FmbMLGKjZ2O6OackxUbtIHIuDzC6SHmq16",
      },
    });

    const mailOptions = {
      from: "contacto@chanquinafm.cl",
      to: "administrador@chanquinafm.cl",
      subject: "Nuevo mensaje de contacto",
      text: `Nombre: ${name}\nCorreo Electrónico: ${email}\nMensaje: ${message}`,
    };
    await transporter.sendMail(mailOptions);

    req.flash('success_msg', "Correo enviado correctamente, te contactaremos a la brevedad");
    res.render("index");
  } catch (error) {
    console.error("Error al enviar el correo electrónico:", error);
    res.render("index", { error_msg: "Error al enviar el mensaje" });
  }
});


// Añadir un middleware de manejo de errores al final de tu archivo
router.use((err, req, res, next) => {
  console.error("Error inesperado:", err);
  req.flash("error_msg", "Error inesperado");
  res.status(500).redirect("/");
});

module.exports = router;

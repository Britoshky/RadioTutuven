const express = require("express");
const router = express.Router();
const moment = require("moment");
const NodeCache = require("node-cache");



const nodemailer = require("nodemailer");
const verifyRecaptcha = require("../middleware/verifyRecaptcha");
const sitemapUpdateMiddleware = require('../middleware/sitemap');
const Visit = require("../models/Visit");

// Resto de la configuración de Express...



// Tiempo de vida del caché en segundos (6 horas = 21600 segundos)
const cache = new NodeCache({ stdTTL: 21600 });

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

// Ruta principal con contador de visitas


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
      from: "contacto@radiotutuven.cl",
      to: "radiotutuven@gmail.com",
      subject: "Nuevo mensaje de contacto",
      text: `Nombre: ${name}\nCorreo Electrónico: ${email}\nMensaje: ${message}`,
    };
    await transporter.sendMail(mailOptions);

    req.flash('success_msg', "Correo enviado correctamente, te contactaremos a la brevedad");
    const successFlash = req.flash('success_msg')[0]; // Accede al primer mensaje flash
    res.render("index", { successFlash });
  } catch (error) {
    req.flash('error_msg', "Error al enviar el mensaje de contacto");
    const errorFlash = req.flash('error_msg')[0]; // Accede al primer mensaje flash
    res.render("index", { errorFlash });
  }
});


// Añadir un middleware de manejo de errores al final de tu archivo
router.use((err, req, res, next) => {
  console.error("Error inesperado:", err);
  req.flash("error_msg", "Error inesperado");
  res.status(500).redirect("/");
});

module.exports = router;

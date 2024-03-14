// routes/contacto.js

const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
const verifyRecaptcha = require("../middleware/verifyRecaptcha");

// Middleware para deshabilitar la caché
router.use((req, res, next) => {
  res.header("Cache-Control", "no-cache, private, no-store, must-revalidate");
  res.header("Expires", "-1");
  res.header("Pragma", "no-cache");
  next();
});

// Ruta protegida que utiliza isAuthenticated
router.get("/contacto", async (req, res) => {
  const catpchakey = process.env.RECAPTCHA_SITE_KEY;
  res.render("contacto", { catpchakey });
});


// Ruta para manejar el envío del formulario
router.post("/contacto", verifyRecaptcha, async (req, res) => {
  const { contact_nombre, contact_email, contact_message } = req.body;
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
      text: `Nombre: ${contact_nombre}\nCorreo Electrónico: ${contact_email}\nMensaje: ${contact_message}`,
    };

    //await transporter.sendMail(mailOptions);

    console.log("mail enviado");
    req.flash('success_msg', "Correo enviado correctamente, te contactaremos a la brevedad");
    res.render("index");
  } catch (error) {
    console.error("Error al enviar el correo electrónico:", error);
    res.render("index", { error_msg: "Error al enviar el mensaje" });
  }
});

// Middleware de manejo de errores
router.use((err, req, res, next) => {
  console.error("Error inesperado:", err);
  req.flash("error_msg", "Error inesperado");
  res.status(500).redirect("/");
});

module.exports = router;

const express = require("express");
const router = express.Router();
const moment = require("moment");
const NodeCache = require("node-cache");

const nodemailer = require("nodemailer");
const verifyRecaptcha = require("../middleware/verifyRecaptcha");
const sitemapUpdateMiddleware = require('../middleware/sitemap');
const Visit = require("../models/Visit");
const { getAppSettings } = require("../helpers/appSettings");

const cache = new NodeCache({ stdTTL: 21600 });

router.use((req, res, next) => {
  const key = req.originalUrl;
  const cachedData = cache.get(key);
  if (cachedData) {
    console.log(`Recuperando datos de la caché para la ruta: ${key}`);
    res.locals.cachedData = cachedData;
  }
  next();
});

// Compat: POST /send-email usa la misma config SMTP de Mongo que /contacto
router.post("/send-email", verifyRecaptcha, async (req, res) => {
  const { name, email, message } = req.body;
  try {
    const { smtp } = await getAppSettings();
    if (!smtp.host || !smtp.user || !smtp.pass) {
      throw new Error("SMTP no configurado en MongoDB settings");
    }

    const transporter = nodemailer.createTransport({
      host: smtp.host,
      port: Number(smtp.port) || 465,
      secure: smtp.secure !== false,
      auth: {
        user: smtp.user,
        pass: smtp.pass,
      },
    });

    await transporter.sendMail({
      from: smtp.from || smtp.user,
      to: smtp.to || "radiotutuven@gmail.com",
      subject: "Nuevo mensaje de contacto",
      text: `Nombre: ${name}\nCorreo Electrónico: ${email}\nMensaje: ${message}`,
      replyTo: email,
    });

    req.flash('success_msg', "Correo enviado correctamente, te contactaremos a la brevedad");
    const successFlash = req.flash('success_msg')[0];
    res.render("index", { successFlash });
  } catch (error) {
    console.error("Error /send-email:", error);
    req.flash('error_msg', "Error al enviar el mensaje de contacto");
    const errorFlash = req.flash('error_msg')[0];
    res.render("index", { errorFlash });
  }
});

router.use((err, req, res, next) => {
  console.error("Error inesperado:", err);
  req.flash("error_msg", "Error inesperado");
  res.status(500).redirect("/");
});

module.exports = router;

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

const Visit = require("../models/Visit");

// Rate limiting simple en memoria para POST /contacto
const rateBuckets = new Map();
const WINDOW_MS = 10 * 60 * 1000; // 10 minutos
const MAX_REQUESTS = 5; // Máximo 5 envíos por ventana por IP

function contactRateLimiter(req, res, next) {
  const ip = (req.headers['x-forwarded-for'] || req.ip || req.connection?.remoteAddress || '').toString();
  const now = Date.now();
  let bucket = rateBuckets.get(ip);
  if (!bucket || now > bucket.reset) {
    bucket = { count: 0, reset: now + WINDOW_MS };
    rateBuckets.set(ip, bucket);
  }
  bucket.count += 1;
  if (bucket.count > MAX_REQUESTS) {
    // No incrementar visitas en POST; recuperar valor actual para mostrarlo
    return Visit.findOne({ page: 'contacto' }).lean().then(doc => {
      return res.status(429).render('contacto', {
        error_msg: 'Has enviado demasiados mensajes. Intenta nuevamente más tarde.',
        formData: req.body,
        visitCount: doc ? doc.count : undefined,
      });
    }).catch(() => {
      return res.status(429).render('contacto', {
        error_msg: 'Has enviado demasiados mensajes. Intenta nuevamente más tarde.',
        formData: req.body,
      });
    });
  }
  next();
}

// Ruta protegida que utiliza isAuthenticated
router.get("/contacto", async (req, res) => {
  const pageName = 'contacto';
  let visit = await Visit.findOne({ page: pageName });
  if (!visit) {
    visit = new Visit({ page: pageName, count: 1 });
  } else {
    visit.count += 1;
  }
  await visit.save();
  res.render("contacto", { visitCount: visit.count, recaptchaSiteKey: process.env.RECAPTCHA_SITE_KEY });
});


// Ruta para manejar el envío del formulario
router.post("/contacto", contactRateLimiter, verifyRecaptcha, async (req, res) => {
  const { name = "", email = "", message = "", website = "" } = req.body;
  const errors = [];

  // Validaciones básicas del lado del servidor
  const trimmedName = String(name).trim();
  const trimmedEmail = String(email).trim();
  const trimmedMessage = String(message).trim();

  if (!trimmedName || trimmedName.length < 2) {
    errors.push({ field: "name", msg: "El nombre es requerido y debe tener al menos 2 caracteres." });
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
    errors.push({ field: "email", msg: "Correo electrónico inválido." });
  }
  if (!trimmedMessage || trimmedMessage.length < 10) {
    errors.push({ field: "message", msg: "El mensaje debe tener al menos 10 caracteres." });
  }
  if (trimmedMessage.length > 2000) {
    errors.push({ field: "message", msg: "El mensaje no puede superar los 2000 caracteres." });
  }

  try {
    // Honeypot: si está llenado, asumir bot y responder éxito sin enviar correo
    const visitDocForHp = await Visit.findOne({ page: 'contacto' }).lean().catch(() => null);
    if (website && String(website).trim() !== '') {
      return res.render("contacto", {
        success_msg: "Gracias por tu mensaje, te contactaremos a la brevedad.",
        visitCount: visitDocForHp ? visitDocForHp.count : undefined,
      });
    }
    // Obtener el contador actual para no incrementarlo en POST
    const visitDoc = await Visit.findOne({ page: 'contacto' }).lean();
    const currentCount = visitDoc ? visitDoc.count : undefined;

    if (errors.length > 0) {
      return res.status(400).render("contacto", {
        errors,
        formData: { name: trimmedName, email: trimmedEmail, message: trimmedMessage },
        visitCount: currentCount,
      });
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 465,
      secure: String(process.env.SMTP_SECURE).toLowerCase() === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: process.env.SMTP_TO || "radiotutuven@gmail.com",
      subject: "Nuevo mensaje de contacto",
      text: `Nombre: ${trimmedName}\nCorreo Electrónico: ${trimmedEmail}\nMensaje: ${trimmedMessage}`,
      replyTo: trimmedEmail,
    };
    await transporter.sendMail(mailOptions);

    // Mostrar feedback inmediato sin redirigir
    return res.render("contacto", {
      success_msg: "Correo enviado correctamente, te contactaremos a la brevedad.",
      visitCount: currentCount,
    });
  } catch (error) {
    console.error("Error al enviar el correo electrónico:", error);
    // Intentar mostrar en la misma vista
    const visitDoc = await Visit.findOne({ page: 'contacto' }).lean().catch(() => null);
    return res.status(500).render("contacto", {
      error_msg: "Error al enviar el mensaje. Intenta nuevamente más tarde.",
      formData: { name, email, message },
      visitCount: visitDoc ? visitDoc.count : undefined,
    });
  }
});

// Middleware de manejo de errores
router.use((err, req, res, next) => {
  console.error("Error inesperado:", err);
  req.flash("error_msg", "Error inesperado");
  res.status(500).redirect("/");
});

module.exports = router;

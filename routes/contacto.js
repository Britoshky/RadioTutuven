// routes/contacto.js

const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
const verifyRecaptcha = require("../middleware/verifyRecaptcha");
const { getAppSettings } = require("../helpers/appSettings");

router.use((req, res, next) => {
  res.header("Cache-Control", "no-cache, private, no-store, must-revalidate");
  res.header("Expires", "-1");
  res.header("Pragma", "no-cache");
  next();
});

const Visit = require("../models/Visit");

const rateBuckets = new Map();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS = 5;

function contactRateLimiter(req, res, next) {
  const prefersJSON = req.xhr || req.get('X-Requested-With') === 'XMLHttpRequest' || (req.headers.accept || '').includes('application/json');
  const ip = (req.headers['x-forwarded-for'] || req.ip || req.connection?.remoteAddress || '').toString();
  const now = Date.now();
  let bucket = rateBuckets.get(ip);
  if (!bucket || now > bucket.reset) {
    bucket = { count: 0, reset: now + WINDOW_MS };
    rateBuckets.set(ip, bucket);
  }
  bucket.count += 1;
  if (bucket.count > MAX_REQUESTS) {
    if (prefersJSON) {
      return res.status(429).json({ ok: false, message: 'Has enviado demasiados mensajes. Intenta nuevamente más tarde.' });
    }
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

router.get("/contacto", async (req, res) => {
  const pageName = 'contacto';
  let visit = await Visit.findOne({ page: pageName });
  if (!visit) {
    visit = new Visit({ page: pageName, count: 1 });
  } else {
    visit.count += 1;
  }
  await visit.save();
  const { recaptcha } = await getAppSettings();
  res.render("contacto", { visitCount: visit.count, recaptchaSiteKey: recaptcha.siteKey });
});

router.post("/contacto", contactRateLimiter, verifyRecaptcha, async (req, res) => {
  const { name = "", email = "", message = "", website = "" } = req.body;
  const prefersJSON = req.xhr || req.get('X-Requested-With') === 'XMLHttpRequest' || (req.headers.accept || '').includes('application/json');
  const errors = [];

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
    const visitDocForHp = await Visit.findOne({ page: 'contacto' }).lean().catch(() => null);
    if (website && String(website).trim() !== '') {
      if (prefersJSON) return res.json({ ok: true, message: "Gracias por tu mensaje, te contactaremos a la brevedad." });
      return res.render("contacto", { success_msg: "Gracias por tu mensaje, te contactaremos a la brevedad.", visitCount: visitDocForHp ? visitDocForHp.count : undefined });
    }

    const visitDoc = await Visit.findOne({ page: 'contacto' }).lean();
    const currentCount = visitDoc ? visitDoc.count : undefined;

    if (errors.length > 0) {
      if (prefersJSON) return res.status(400).json({ ok: false, errors: errors.map(e => e.msg) });
      return res.status(400).render("contacto", { errors, formData: { name: trimmedName, email: trimmedEmail, message: trimmedMessage }, visitCount: currentCount });
    }

    const { smtp } = await getAppSettings();
    if (!smtp.host || !smtp.user || !smtp.pass) {
      throw new Error("SMTP no configurado en MongoDB settings");
    }

    const smtpPort = Number(smtp.port) || 465;
    const smtpSecure = typeof smtp.secure === 'boolean' ? smtp.secure : smtpPort === 465;

    const transporter = nodemailer.createTransport({
      host: smtp.host,
      port: smtpPort,
      secure: smtpSecure,
      auth: {
        user: smtp.user,
        pass: smtp.pass,
      },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 20000,
      logger: Boolean(smtp.debug),
      debug: Boolean(smtp.debug),
      tls: smtp.rejectUnauthorized === false ? { rejectUnauthorized: false } : undefined,
    });

    await transporter.sendMail({
      from: smtp.from || smtp.user,
      to: smtp.to || "radiotutuven@gmail.com",
      subject: "Nuevo mensaje de contacto",
      text: `Nombre: ${trimmedName}\nCorreo Electrónico: ${trimmedEmail}\nMensaje: ${trimmedMessage}`,
      replyTo: trimmedEmail,
    });

    if (prefersJSON) return res.json({ ok: true, message: "Correo enviado correctamente, te contactaremos a la brevedad." });
    return res.render("contacto", { success_msg: "Correo enviado correctamente, te contactaremos a la brevedad.", visitCount: currentCount });
  } catch (error) {
    console.error("Error al enviar el correo electrónico:", error);
    const visitDoc = await Visit.findOne({ page: 'contacto' }).lean().catch(() => null);
    if (prefersJSON) return res.status(500).json({ ok: false, message: "Error al enviar el mensaje. Intenta nuevamente más tarde.", code: error && (error.code || error.responseCode) });
    return res.status(500).render("contacto", { error_msg: "Error al enviar el mensaje. Intenta nuevamente más tarde.", formData: { name, email, message }, visitCount: visitDoc ? visitDoc.count : undefined });
  }
});

router.use((err, req, res, next) => {
  console.error("Error inesperado:", err);
  req.flash("error_msg", "Error inesperado");
  res.status(500).redirect("/");
});

module.exports = router;

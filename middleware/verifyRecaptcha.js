const fetch = require('node-fetch');
const { getAppSettings } = require('../helpers/appSettings');

// Verifica reCAPTCHA v2 Checkbox usando secret desde MongoDB
async function verifyRecaptcha(req, res, next) {
  const prefersJSON = req.xhr || req.get('X-Requested-With') === 'XMLHttpRequest' || (req.headers.accept || '').includes('application/json');
  try {
    const token = req.body['g-recaptcha-response'];
    const { recaptcha } = await getAppSettings();
    const secret = recaptcha.secretKey;

    if (!token) {
      if (prefersJSON) return res.status(400).json({ ok: false, message: 'Completa el reCAPTCHA antes de enviar.' });
      req.flash('error_msg', 'Completa el reCAPTCHA antes de enviar.');
      return res.redirect('/contacto');
    }

    if (!secret) {
      console.error('reCAPTCHA secret missing in Mongo settings');
      if (prefersJSON) return res.status(500).json({ ok: false, message: 'Captcha no configurado.' });
      req.flash('error_msg', 'Captcha no configurado.');
      return res.redirect('/contacto');
    }

    const params = new URLSearchParams();
    params.append('secret', secret);
    params.append('response', token);
    params.append('remoteip', req.ip);

    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params,
    });

    const data = await response.json();
    if (data.success) {
      return next();
    }

    console.error('reCAPTCHA verification failed:', data['error-codes']);
    if (prefersJSON) return res.status(400).json({ ok: false, message: 'Error al verificar reCAPTCHA.' });
    req.flash('error_msg', 'Error al verificar reCAPTCHA.');
    return res.redirect('/contacto');
  } catch (err) {
    console.error('reCAPTCHA verification error:', err);
    if (prefersJSON) return res.status(500).json({ ok: false, message: 'Error al verificar reCAPTCHA.' });
    req.flash('error_msg', 'Error al verificar reCAPTCHA.');
    return res.redirect('/contacto');
  }
}

module.exports = verifyRecaptcha;

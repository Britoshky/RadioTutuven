const fetch = require('node-fetch');

// Middleware para verificar reCAPTCHA v2 Checkbox
async function verifyRecaptcha(req, res, next) {
  const prefersJSON = req.xhr || req.get('X-Requested-With') === 'XMLHttpRequest' || (req.headers.accept || '').includes('application/json');
  try {
    const token = req.body['g-recaptcha-response'];
    const secret = process.env.RECAPTCHA_SECRET_KEY;

    if (!token) {
      if (prefersJSON) return res.status(400).json({ ok: false, message: 'Completa el reCAPTCHA antes de enviar.' });
      req.flash('error_msg', 'Completa el reCAPTCHA antes de enviar.');
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

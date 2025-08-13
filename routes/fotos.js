const express = require('express');
const router = express.Router();

router.get('/fotos', (req, res) => {
    res.render('fotos');
});

module.exports = router;

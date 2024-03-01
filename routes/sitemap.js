const express = require('express');
const router = express.Router();


router.get('/sitemap.xml', async (req, res, next) => {
    res.redirect("/sitemap.xml");
});

module.exports = router;

const express = require("express");
const router = express.Router();

router.get('/quienes_somos', (req, res) => {
    res.render('quienes_somos');
});


module.exports = router;

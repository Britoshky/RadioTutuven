const express = require("express");
const router = express.Router();

router.get('/historias', function (req, res){
    res.render('historias');
});

module.exports = router;

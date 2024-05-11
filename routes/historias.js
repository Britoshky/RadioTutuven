const express = require("express");
const router = express.Router();

router.get('/historias', function (req, res){
    res.render('historias/faro_carranza_chanco');
});

router.get('/faro_carranza_chanco', function (req, res){
    res.render('historias/faro_carranza_chanco');
});

router.get('/tranque_tutuven', function (req, res){
    res.render('historias/tranque_tutuven');
});

router.get('/cauquenes', function (req, res){
    res.render('historias/cauquenes');
});

router.get('/chanco', function (req, res){
    res.render('historias/chanco');
});

module.exports = router;

const express = require("express");
const router = express.Router();

// COMUNAS

router.get('/cauquenes', function (req, res){
    res.render('historias/cauquenes');
});

router.get('/chanco', function (req, res){
    res.render('historias/chanco');
});

router.get('/pelluhue', function (req, res){
    res.render('historias/pelluhue');
});

router.get('/curanipe', function (req, res){
    res.render('historias/curanipe');
});


// HISTORIAS

router.get('/historias', function (req, res){
    res.render('historias/faro_carranza_chanco');
});

router.get('/faro_carranza_chanco', function (req, res){
    res.render('historias/faro_carranza_chanco');
});

router.get('/tranque_tutuven', function (req, res){
    res.render('historias/tranque_tutuven');
});

router.get('/cienagas-de-name', function (req, res){
    res.render('historias/cienagas-de-name');
});


// RESERVAS NACIONALES

router.get('/reserva-nacional-federico-albert', function (req, res){
    res.render('historias/reserva-nacional-federico-albert');
});

router.get('/reserva-nacional-los-ruiles', function (req, res){
    res.render('historias/reserva-nacional-los-ruiles');
});






module.exports = router;

const express = require("express");
const router = express.Router();

// PERSONAJES

router.get('/guadalupe-del-carmen', function (req, res){
    res.render('historias/guadalupe-del-carmen');
});

router.get('/federico-albert-faupp', function (req, res){
    res.render('historias/federico-albert-faupp');
});

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



// HISTORIAS

router.get('/historias', function (req, res){
    res.render('historias/faro_carranza_chanco');
});

router.get('/curanipe', function (req, res){
    res.render('historias/curanipe');
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

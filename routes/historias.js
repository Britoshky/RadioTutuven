const express = require("express");
const router = express.Router();

// PERSONAJES
router.get('/antonio-varas-de-la-barra', function (req, res){
    res.render('historias/antonio-varas-de-la-barra');
});

router.get('/guadalupe-del-carmen', function (req, res){
    res.render('historias/guadalupe-del-carmen');
});

router.get('/federico-albert-faupp', function (req, res){
    res.render('historias/federico-albert-faupp');
});

router.get('/sotero-del-rio', function (req, res){
    res.render('historias/sotero-del-rio');
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

router.get('/coronel-de-maule', function (req, res){
    res.render('historias/coronel-de-maule');
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

router.get('/buscarril', function (req, res){
    res.render('historias/buscarril');
});

router.get('/el-obelisco', function (req, res){
    res.render('historias/el-obelisco');
});

router.get('/ramal-parra', function (req, res){
    res.render('historias/ramal-parra');
});

router.get('/regimiento-de-infanteria', function (req, res){
    res.render('historias/regimiento-de-infanteria');
});

// RESERVAS NACIONALES

router.get('/reserva-nacional-federico-albert', function (req, res){
    res.render('historias/reserva-nacional-federico-albert');
});

router.get('/reserva-nacional-los-ruiles', function (req, res){
    res.render('historias/reserva-nacional-los-ruiles');
});






module.exports = router;

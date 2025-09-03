const express = require("express");
const router = express.Router();
const Visit = require("../models/Visit");

// PERSONAJES
router.get('/antonio-varas-de-la-barra', async function (req, res){
    const pageName = 'antonio-varas-de-la-barra';
    let visit = await Visit.findOne({ page: pageName });
    if (!visit) {
        visit = new Visit({ page: pageName, count: 1 });
    } else {
        visit.count += 1;
    }
    await visit.save();
    res.render('historias/antonio-varas-de-la-barra', { visitCount: visit.count });
});

router.get('/guadalupe-del-carmen', async function (req, res){
    const pageName = 'guadalupe-del-carmen';
    let visit = await Visit.findOne({ page: pageName });
    if (!visit) {
        visit = new Visit({ page: pageName, count: 1 });
    } else {
        visit.count += 1;
    }
    await visit.save();
    res.render('historias/guadalupe-del-carmen', { visitCount: visit.count });
});

router.get('/federico-albert-faupp', async function (req, res){
    const pageName = 'federico-albert-faupp';
    let visit = await Visit.findOne({ page: pageName });
    if (!visit) {
        visit = new Visit({ page: pageName, count: 1 });
    } else {
        visit.count += 1;
    }
    await visit.save();
    res.render('historias/federico-albert-faupp', { visitCount: visit.count });
});

router.get('/sotero-del-rio', async function (req, res){
    const pageName = 'sotero-del-rio';
    let visit = await Visit.findOne({ page: pageName });
    if (!visit) {
        visit = new Visit({ page: pageName, count: 1 });
    } else {
        visit.count += 1;
    }
    await visit.save();
    res.render('historias/sotero-del-rio', { visitCount: visit.count });
});

// COMUNAS

router.get('/cauquenes', async function (req, res){
    const pageName = 'cauquenes';
    let visit = await Visit.findOne({ page: pageName });
    if (!visit) {
        visit = new Visit({ page: pageName, count: 1 });
    } else {
        visit.count += 1;
    }
    await visit.save();
    res.render('historias/cauquenes', { visitCount: visit.count });
});

router.get('/chanco', async function (req, res){
    const pageName = 'chanco';
    let visit = await Visit.findOne({ page: pageName });
    if (!visit) {
        visit = new Visit({ page: pageName, count: 1 });
    } else {
        visit.count += 1;
    }
    await visit.save();
    res.render('historias/chanco', { visitCount: visit.count });
});

router.get('/pelluhue', async function (req, res){
    const pageName = 'pelluhue';
    let visit = await Visit.findOne({ page: pageName });
    if (!visit) {
        visit = new Visit({ page: pageName, count: 1 });
    } else {
        visit.count += 1;
    }
    await visit.save();
    res.render('historias/pelluhue', { visitCount: visit.count });
});

router.get('/coronel-de-maule', async function (req, res){
    const pageName = 'coronel-de-maule';
    let visit = await Visit.findOne({ page: pageName });
    if (!visit) {
        visit = new Visit({ page: pageName, count: 1 });
    } else {
        visit.count += 1;
    }
    await visit.save();
    res.render('historias/coronel-de-maule', { visitCount: visit.count });
});

// HISTORIAS

router.get('/historias', async function (req, res){
    const pageName = 'faro_carranza_chanco';
    let visit = await Visit.findOne({ page: pageName });
    if (!visit) {
        visit = new Visit({ page: pageName, count: 1 });
    } else {
        visit.count += 1;
    }
    await visit.save();
    res.render('historias/faro_carranza_chanco', { visitCount: visit.count });
});

router.get('/curanipe', async function (req, res){
    const pageName = 'curanipe';
    let visit = await Visit.findOne({ page: pageName });
    if (!visit) {
        visit = new Visit({ page: pageName, count: 1 });
    } else {
        visit.count += 1;
    }
    await visit.save();
    res.render('historias/curanipe', { visitCount: visit.count });
});

router.get('/faro_carranza_chanco', async function (req, res){
    const pageName = 'faro_carranza_chanco';
    let visit = await Visit.findOne({ page: pageName });
    if (!visit) {
        visit = new Visit({ page: pageName, count: 1 });
    } else {
        visit.count += 1;
    }
    await visit.save();
    res.render('historias/faro_carranza_chanco', { visitCount: visit.count });
});

router.get('/tranque_tutuven', async function (req, res){
    const pageName = 'tranque_tutuven';
    let visit = await Visit.findOne({ page: pageName });
    if (!visit) {
        visit = new Visit({ page: pageName, count: 1 });
    } else {
        visit.count += 1;
    }
    await visit.save();
    res.render('historias/tranque_tutuven', { visitCount: visit.count });
});

router.get('/cienagas-de-name', async function (req, res){
    const pageName = 'cienagas-de-name';
    let visit = await Visit.findOne({ page: pageName });
    if (!visit) {
        visit = new Visit({ page: pageName, count: 1 });
    } else {
        visit.count += 1;
    }
    await visit.save();
    res.render('historias/cienagas-de-name', { visitCount: visit.count });
});

router.get('/buscarril', async function (req, res){
    const pageName = 'buscarril';
    let visit = await Visit.findOne({ page: pageName });
    if (!visit) {
        visit = new Visit({ page: pageName, count: 1 });
    } else {
        visit.count += 1;
    }
    await visit.save();
    res.render('historias/buscarril', { visitCount: visit.count });
});

router.get('/el-obelisco', async function (req, res){
    const pageName = 'el-obelisco';
    let visit = await Visit.findOne({ page: pageName });
    if (!visit) {
        visit = new Visit({ page: pageName, count: 1 });
    } else {
        visit.count += 1;
    }
    await visit.save();
    res.render('historias/el-obelisco', { visitCount: visit.count });
});

router.get('/ramal-parra', async function (req, res){
    const pageName = 'ramal-parra';
    let visit = await Visit.findOne({ page: pageName });
    if (!visit) {
        visit = new Visit({ page: pageName, count: 1 });
    } else {
        visit.count += 1;
    }
    await visit.save();
    res.render('historias/ramal-parra', { visitCount: visit.count });
});

router.get('/regimiento-de-infanteria', async function (req, res){
    const pageName = 'regimiento-de-infanteria';
    let visit = await Visit.findOne({ page: pageName });
    if (!visit) {
        visit = new Visit({ page: pageName, count: 1 });
    } else {
        visit.count += 1;
    }
    await visit.save();
    res.render('historias/regimiento-de-infanteria', { visitCount: visit.count });
});

// RESERVAS NACIONALES

router.get('/reserva-nacional-federico-albert', async function (req, res){
    const pageName = 'reserva-nacional-federico-albert';
    let visit = await Visit.findOne({ page: pageName });
    if (!visit) {
        visit = new Visit({ page: pageName, count: 1 });
    } else {
        visit.count += 1;
    }
    await visit.save();
    res.render('historias/reserva-nacional-federico-albert', { visitCount: visit.count });
});

router.get('/reserva-nacional-los-ruiles', async function (req, res){
    const pageName = 'reserva-nacional-los-ruiles';
    let visit = await Visit.findOne({ page: pageName });
    if (!visit) {
        visit = new Visit({ page: pageName, count: 1 });
    } else {
        visit.count += 1;
    }
    await visit.save();
    res.render('historias/reserva-nacional-los-ruiles', { visitCount: visit.count });
});






module.exports = router;

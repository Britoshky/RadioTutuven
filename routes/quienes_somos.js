const express = require("express");
const router = express.Router();

const Visit = require("../models/Visit");

router.get('/quienes_somos', async (req, res) => {
    const pageName = 'quienes_somos';
    let visit = await Visit.findOne({ page: pageName });
    if (!visit) {
        visit = new Visit({ page: pageName, count: 1 });
    } else {
        visit.count += 1;
    }
    await visit.save();
    res.render('quienes_somos', { visitCount: visit.count });
});


module.exports = router;

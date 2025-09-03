const express = require('express');
const router = express.Router();

const Visit = require("../models/Visit");

router.get('/fotos', async (req, res) => {
    const pageName = 'fotos';
    let visit = await Visit.findOne({ page: pageName });
    if (!visit) {
        visit = new Visit({ page: pageName, count: 1 });
    } else {
        visit.count += 1;
    }
    await visit.save();
    res.render('fotos', { visitCount: visit.count });
});

module.exports = router;

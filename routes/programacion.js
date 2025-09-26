const express = require("express");
const router = express.Router();
const Visit = require("../models/Visit");

// Página de Programación con contador de visitas individual
router.get("/programacion", async (req, res) => {
  try {
    const pageName = "programacion";
    let visit = await Visit.findOne({ page: pageName });
    if (!visit) {
      visit = new Visit({ page: pageName, count: 1 });
    } else {
      visit.count += 1;
    }
    await visit.save();
    res.render("programacion", { visitCount: visit.count });
  } catch (error) {
    console.error("Error al contar visitas en Programación:", error);
    res.render("programacion", { visitCount: "N/A" });
  }
});

module.exports = router;

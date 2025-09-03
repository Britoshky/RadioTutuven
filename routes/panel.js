const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { isAuthenticated } = require("../helpers/auth");


// Middleware para deshabilitar la caché
router.use((req, res, next) => {
  res.header("Cache-Control", "no-cache, private, no-store, must-revalidate");
  res.header("Expires", "-1");
  res.header("Pragma", "no-cache");
  next();
});

// ...

const Visit = require("../models/Visit");

// Ruta protegida que utiliza isAuthenticated
router.get("/panel", isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.user._id); // Buscar usuario por su ID
    const pageName = 'panel';
    let visit = await Visit.findOne({ page: pageName });
    if (!visit) {
      visit = new Visit({ page: pageName, count: 1 });
    } else {
      visit.count += 1;
    }
    await visit.save();
    res.render("panel/panel", { user, layout: "panel", visitCount: visit.count }); // Pasar el usuario y visitas a la vista
  } catch (error) {
    console.error(error);
    req.flash("error_msg", "Error al cargar la página");
    res.redirect("/users/signin"); // O redirigir a una página de error
  }
});

// ...
// Añadir un middleware de manejo de errores al final de tu archivo
router.use((err, req, res, next) => {
  console.error("Error inesperado:", err);
  req.flash("error_msg", "Error inesperado");
  res.status(500).redirect("/errors");
});


module.exports = router;

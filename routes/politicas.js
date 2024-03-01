const express = require("express");
const router = express.Router();


// Middleware para deshabilitar la caché
router.use((req, res, next) => {
    res.header("Cache-Control", "no-cache, private, no-store, must-revalidate");
    res.header("Expires", "-1");
    res.header("Pragma", "no-cache");
    next();
});

// ...

// Ruta a politicas
router.get("/politicas", async (req, res) => {
    try {
        const fecha = new Date().getFullYear().toString();
        res.render("politicas", { fecha });
    } catch (error) {
        console.error(error);
        req.flash("error_msg", "Error al cargar la página");
        res.redirect("/"); // O redirige a una página de error
    }
});

// ...
// Añadir un middleware de manejo de errores al final de tu archivo
router.use((err, req, res, next) => {
    console.error("Error inesperado:", err);
    req.flash("error_msg", "Error inesperado");
    res.status(500).redirect("/panel/panel");
});


module.exports = router;

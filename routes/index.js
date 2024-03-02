const express = require("express");
const router = express.Router();
const moment = require("moment");
const NodeCache = require("node-cache");
const sitemapUpdateMiddleware = require('../middleware/sitemap');


// Middleware para deshabilitar la caché
router.use((req, res, next) => {
  res.header("Cache-Control", "no-cache, private, no-store, must-revalidate");
  res.header("Expires", "-1");
  res.header("Pragma", "no-cache");
  next();
});

// Tiempo de vida del caché en segundos (6 horas = 21600 segundos)
const cache = new NodeCache({ stdTTL: 21600 });

// Middleware para cachear las rutas
router.use((req, res, next) => {
  const key = req.originalUrl;
  const cachedData = cache.get(key);
  if (cachedData) {
    console.log(`Recuperando datos de la caché para la ruta: ${key}`);
    res.locals.cachedData = cachedData; // Almacena los datos en res.locals
  }
  next(); // Continúa con el siguiente middleware o ruta
});

// Ruta para mostrar los elementos en la página principal
router.get("/", async (req, res, next) => {
  //router.use(sitemapUpdateMiddleware);

  res.render("index");
});

// Añadir un middleware de manejo de errores al final de tu archivo
router.use((err, req, res, next) => {
  console.error("Error inesperado:", err);
  req.flash("error_msg", "Error inesperado");
  res.status(500).redirect("/");
});

module.exports = router;

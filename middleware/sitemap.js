const express = require('express');
const router = express.Router();
const fs = require('fs');
const { create } = require('xmlbuilder2');
const moment = require('moment');


const SITEMAP_PATH = __dirname + '/../public/sitemap.xml';

function createSitemapXML(sitemapData) {
  const root = create({ version: '1.0', encoding: 'UTF-8' });
  const urlset = root.ele('urlset', {
    xmlns: 'http://www.sitemaps.org/schemas/sitemap/0.9',
    'xmlns:image': 'http://www.google.com/schemas/sitemap-image/1.1'
  });

  sitemapData.urls.forEach(url => {
    const urlElement = urlset.ele('url');
    urlElement.ele('loc').txt(url.loc);
    urlElement.ele('lastmod').txt(url.lastmod);
    if (url.changefreq) {
      urlElement.ele('changefreq').txt(url.changefreq);
    }
    if (url.priority) {
      urlElement.ele('priority').txt(url.priority);
    }

    if (url.image) {
      const imageElement = urlElement.ele('image:image');
      imageElement.ele('image:loc').txt(url.image.url);
      if (url.image.description) {
        imageElement.ele('image:caption').txt(url.image.description);
      }
    }
  });

  return root.end({ prettyPrint: true });
}

// Middleware para generar y actualizar el sitemap
router.use(async (req, res, next) => {
  try {


    // Crear la estructura del sitemap
    const sitemapData = {
      urls: [
        // Enlaces manuales sin imágenes
        {
          loc: 'https://www.radiotutuven.cl/quienes_somos',
          lastmod: moment().format('YYYY-MM-DD'),
          priority: 0.9 // Prioridad menor para enlaces manuales
        },
        {
          loc: 'https://www.radiotutuven.cl/contacto',
          lastmod: moment().format('YYYY-MM-DD'),
          priority: 0.7 // Prioridad menor para enlaces manuales
        }, {
          loc: 'https://www.radiotutuven.cl/politicas',
          lastmod: moment().format('YYYY-MM-DD'),
          priority: 0.7 // Prioridad menor para enlaces manuales
        }, {
          loc: 'https://www.radiotutuven.cl/',
          lastmod: moment().format('YYYY-MM-DD'),
          priority: 1.0 // Prioridad menor para enlaces manuales
        },

        // Puedes agregar más enlaces manuales aquí según sea necesario
      ]
    };

    // Convertir la estructura del sitemap a XML
    const sitemapXML = createSitemapXML(sitemapData);

    // Escribir el sitemap en el archivo de manera asincrónica
    fs.writeFile(SITEMAP_PATH, sitemapXML, (err) => {
      if (err) {
        console.error('Error al escribir el sitemap:', err);
        return next(err);
      }
      console.log('Sitemap actualizado correctamente.');
      next();
    });
  } catch (error) {
    console.error('Error al generar el sitemap:', error);
    next(error);
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const fs = require('fs');
const { create } = require('xmlbuilder2');
const moment = require('moment');
const Noticia = require('../models/Noticia');
const Comunicado = require('../models/Comunicado');
const Latino = require('../models/Latino');
const ArteyCultura = require('../models/ArteyCultura');


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
    // Leer todas las noticias de la base de datos
    const noticias = await Noticia.find().lean();
    const comunicados = await Comunicado.find().lean();
    const latinos = await Latino.find().lean();
    const arteycultura = await ArteyCultura.find().lean();


    // Crear la estructura del sitemap
    const sitemapData = {
      urls: [
        ...noticias.map(noticia => ({
          loc: `https://www.chanquinafm.cl/noticia/${noticia._id}`,
          lastmod: moment(noticia.date).format('YYYY-MM-DD'),
          priority: 1.0, // Prioridad alta para noticias
          image: {
            url: `https://www.chanquinafm.cl/img_noticiasPrincipales/${noticia.imagen}`,
            family_friendly: 'true', // Agrega esta propiedad si es familiar
            landing_page_loc: 'https://www.chanquinafm.cl/noticias', // Agrega la URL de la página de aterrizaje
            caption: noticias.description // Agrega la descripción de la imagen
          }
        })),
        ...comunicados.map(comunicado => ({
          loc: `https://www.chanquinafm.cl/comunicado/${comunicado._id}`,
          lastmod: moment(comunicado.date).format('YYYY-MM-DD'),
          priority: 1.0, // Prioridad alta para comunicados
          image: {
            url: `https://www.chanquinafm.cl/img_comunicados/${comunicado.imagen}`,
            caption: comunicado.description // Agrega la descripción de la imagen
          },
          family_friendly: 'true', // Agrega esta propiedad si es familiar
          landing_page_loc: 'https://www.chanquinafm.cl/comunicados' // Agrega la URL de la página de aterrizaje
        })),
        ...latinos.map(latino => ({
          loc: `https://www.chanquinafm.cl/latino/${latino._id}`,
          lastmod: moment(latino.date).format('YYYY-MM-DD'),
          priority: 1.0, // Prioridad alta para latinos
          image: {
            url: `https://www.chanquinafm.cl/img_latinos/${latino.imagen}`,
            caption: latino.description // Agrega la descripción de la imagen
          },
          family_friendly: 'true', // Agrega esta propiedad si es familiar
          landing_page_loc: 'https://www.chanquinafm.cl/latinos' // Agrega la URL de la página de aterrizaje
        })),
        ...arteycultura.map(arteycultura => ({
          loc: `https://www.chanquinafm.cl/arteycultura/${arteycultura._id}`,
          lastmod: moment(arteycultura.date).format('YYYY-MM-DD'),
          priority: 1.0, // Prioridad alta para arte y cultura
          image: {
            url: `https://www.chanquinafm.cl/img_arteycultura/${arteycultura.imagen}`,
            caption: arteycultura.description // Agrega la descripción de la imagen
          },
          family_friendly: 'true', // Agrega esta propiedad si es familiar
          landing_page_loc: 'https://www.chanquinafm.cl/arteycultura' // Agrega la URL de la página de aterrizaje
        })),
        // Enlaces manuales sin imágenes
        {
          loc: 'https://www.chanquinafm.cl/noticias',
          lastmod: moment().format('YYYY-MM-DD'),
          priority: 0.7 // Prioridad menor para enlaces manuales
        },
        {
          loc: 'https://www.chanquinafm.cl/comunicados',
          lastmod: moment().format('YYYY-MM-DD'),
          priority: 0.7 // Prioridad menor para enlaces manuales
        }, {
          loc: 'https://www.chanquinafm.cl/programacion',
          lastmod: moment().format('YYYY-MM-DD'),
          priority: 0.7 // Prioridad menor para enlaces manuales
        }, {
          loc: 'https://www.chanquinafm.cl/arteycultura',
          lastmod: moment().format('YYYY-MM-DD'),
          priority: 0.7 // Prioridad menor para enlaces manuales
        }, {
          loc: 'https://www.chanquinafm.cl/latinos',
          lastmod: moment().format('YYYY-MM-DD'),
          priority: 0.7 // Prioridad menor para enlaces manuales
        }, {
          loc: 'https://www.chanquinafm.cl/contacto',
          lastmod: moment().format('YYYY-MM-DD'),
          priority: 0.7 // Prioridad menor para enlaces manuales
        }, {
          loc: 'https://www.chanquinafm.cl/politicas',
          lastmod: moment().format('YYYY-MM-DD'),
          priority: 0.7 // Prioridad menor para enlaces manuales
        }, {
          loc: 'https://www.chanquinafm.cl/',
          lastmod: moment().format('YYYY-MM-DD'),
          priority: 1.0 // Prioridad menor para enlaces manuales
        }, {
          loc: 'https://www.chanquinafm.cl',
          lastmod: moment().format('YYYY-MM-DD'),
          image: {
            url: 'https://www.chanquinafm.cl/img/programas/logo-programa-BUEN-PASTOR.png',
            caption: 'Programas',
          },
          priority: 0.9 // Prioridad alta para programas
        }, {
          loc: 'https://www.chanquinafm.cl',
          lastmod: moment().format('YYYY-MM-DD'),
          image: {
            url: 'https://www.chanquinafm.cl/img/programas/logo-programa-CABALLERO.png',
            caption: 'Programas'
          },
          priority: 0.9 // Prioridad alta para programas
        }, {
          loc: 'https://www.chanquinafm.cl',
          lastmod: moment().format('YYYY-MM-DD'),
          image: {
            url: 'https://www.chanquinafm.cl/img/programas/logo-programa-COOPERATIVA.png',
            caption: 'Programas'
          },
          priority: 0.9 // Prioridad alta para programas
        }, {
          loc: 'https://www.chanquinafm.cl',
          lastmod: moment().format('YYYY-MM-DD'),
          image: {
            url: 'https://www.chanquinafm.cl/img/programas/logo-programa-CORRIDOS.png',
            caption: 'Programas'
          },
          priority: 0.9 // Prioridad alta para programas
        }, {
          loc: 'https://www.chanquinafm.cl',
          lastmod: moment().format('YYYY-MM-DD'),
          image: {
            url: 'https://www.chanquinafm.cl/img/programas/logo-programa-CUMBIAS-RANCHERAS.png',
            caption: 'Programas'
          },
          priority: 0.9 // Prioridad alta para programas
        }, {
          loc: 'https://www.chanquinafm.cl',
          lastmod: moment().format('YYYY-MM-DD'),
          image: {
            url: 'https://www.chanquinafm.cl/img/programas/logo-programa-CUMBIAS.png',
            caption: 'Programas'
          },
          priority: 0.9 // Prioridad alta para programas
        }, {
          loc: 'https://www.chanquinafm.cl',
          lastmod: moment().format('YYYY-MM-DD'),
          image: {
            url: 'https://www.chanquinafm.cl/img/programas/logo-programa-FOLCLORE.png',
            caption: 'Programas'
          },
          priority: 0.9 // Prioridad alta para programas
        }, {
          loc: 'https://www.chanquinafm.cl',
          lastmod: moment().format('YYYY-MM-DD'),
          image: {
            url: 'https://www.chanquinafm.cl/img/programas/logo-programa-JESUS.png',
          caption: 'Programas'
        },
          priority: 0.9 // Prioridad alta para programas
        }, {
          loc: 'https://www.chanquinafm.cl',
          lastmod: moment().format('YYYY-MM-DD'),
          image: {
            url: 'https://www.chanquinafm.cl/img/programas/logo-programa-LATINOS.png',
          caption: 'Programas'
        },
          priority: 0.9 // Prioridad alta para programas
        }, {
          loc: 'https://www.chanquinafm.cl',
          lastmod: moment().format('YYYY-MM-DD'),
          image: {
            url: 'https://www.chanquinafm.cl/img/programas/logo-programa-LUZ-ATARDECER.png',
          caption: 'Programas'
        },
          priority: 0.9 // Prioridad alta para programas
        }, {
          loc: 'https://www.chanquinafm.cl',
          lastmod: moment().format('YYYY-MM-DD'),
          image: {
            url: 'https://www.chanquinafm.cl/img/programas/logo-programa-MEZCLADOS.png',
          caption: 'Programas'
        },
          priority: 0.9 // Prioridad alta para programas
        }, {
          loc: 'https://www.chanquinafm.cl',
          lastmod: moment().format('YYYY-MM-DD'),
          image: {
            url: 'https://www.chanquinafm.cl/img/programas/logo-programa-MI-FORTALEZA.png',
          caption: 'Programas'
        },
          priority: 0.9 // Prioridad alta para programas
        }, {
          loc: 'https://www.chanquinafm.cl',
          lastmod: moment().format('YYYY-MM-DD'),
          image: {
            url: 'https://www.chanquinafm.cl/img/programas/logo-programa-MISCELANEOS.png',
          caption: 'Programas'
        },
          priority: 0.9 // Prioridad alta para programas
        }, {
          loc: 'https://www.chanquinafm.cl',
          lastmod: moment().format('YYYY-MM-DD'),
          image: {
            url: 'https://www.chanquinafm.cl/img/programas/logo-programa-OCHENTERO.png',
          caption: 'Programas'
        },
          priority: 0.9 // Prioridad alta para programas
        }, {
          loc: 'https://www.chanquinafm.cl',
          lastmod: moment().format('YYYY-MM-DD'),
          image: {
            url: 'https://www.chanquinafm.cl/img/programas/logo-programa-OLLA.png',
          caption: 'Programas'
        },
          priority: 0.9 // Prioridad alta para programas
        }, {
          loc: 'https://www.chanquinafm.cl',
          lastmod: moment().format('YYYY-MM-DD'),
          image: {
            url: 'https://www.chanquinafm.cl/img/programas/logo-programa-RECUERDOS.png',
          caption: 'Programas'
        },
          priority: 0.9 // Prioridad alta para programas
        }, {
          loc: 'https://www.chanquinafm.cl',
          lastmod: moment().format('YYYY-MM-DD'),
          image: {
            url: 'https://www.chanquinafm.cl/img/programas/logo-programa-ROMÁNTICOS.png',
          caption: 'Programas'
        },
          priority: 0.9 // Prioridad alta para programas
        }, {
          loc: 'https://www.chanquinafm.cl',
          lastmod: moment().format('YYYY-MM-DD'),
          image: {
            url:'https://www.chanquinafm.cl/img/programas/logo-programa-TARDE-MEXICANA.png',
          caption: 'Programas'
        },
          priority: 0.9 // Prioridad alta para programas
        }, {
          loc: 'https://www.chanquinafm.cl',
          lastmod: moment().format('YYYY-MM-DD'),
          image: {
            url: 'https://www.chanquinafm.cl/img/programas/logo-programa-TRAS-LOS-PASOS.png',
          caption: 'Programas'
        },
          priority: 0.9 // Prioridad alta para programas
        }, {
          loc: 'https://www.chanquinafm.cl',
          lastmod: moment().format('YYYY-MM-DD'),
          image: {
            url: 'https://www.chanquinafm.cl/img/programas/logo-programa-TRASNOCHE.png',
            caption: 'Programas'
          },
          priority: 0.9 // Prioridad alta para programas
        }, {
          loc: 'https://www.chanquinafm.cl',
          lastmod: moment().format('YYYY-MM-DD'),
          image: {
            url: 'https://www.chanquinafm.cl/img/programas/logo-programa-WILLIAMS.png',
            caption: 'Programas'
          },
          priority: 0.9 // Prioridad alta para programas
        }, {
          loc: 'https://www.chanquinafm.cl',
          lastmod: moment().format('YYYY-MM-DD'),
          image: {
            url: 'https://www.chanquinafm.cl/img/logo-player/logo.png',
            caption: 'Logo player'
          },
          priority: 1.0 // Prioridad alta para programas
        }, {
          loc: 'https://www.chanquinafm.cl',
          lastmod: moment().format('YYYY-MM-DD'),
          image: {
            url: 'https://www.chanquinafm.cl/img/logo-player/logo.webp',
            caption: 'Logo'
          },
          priority: 1.0 // Prioridad alta para programas
        }, {
          loc: 'https://www.chanquinafm.cl',
          lastmod: moment().format('YYYY-MM-DD'),
          image: {
            url: 'https://www.chanquinafm.cl/img/favicon.ico',
            caption: 'favicon'
          },
          priority: 1.0 // Prioridad alta para programas
        }, {
          loc: 'https://www.chanquinafm.cl',
          lastmod: moment().format('YYYY-MM-DD'),
          image: {
            url: 'https://www.chanquinafm.cl/img/logo.png',
            caption: 'Logo'
          },
          priority: 1.0 // Prioridad alta para programas
        }, {
          loc: 'https://www.chanquinafm.cl',
          lastmod: moment().format('YYYY-MM-DD'),
          image: {
            url: 'https://www.chanquinafm.cl/img/mantencion.png',
            caption: 'Mantencion'
          },
          priority: 0.7 // Prioridad alta para programas
        }, {
          loc: 'https://www.chanquinafm.cl',
          lastmod: moment().format('YYYY-MM-DD'),
          image: {
            url: 'https://www.chanquinafm.cl/img_rss/facebook.png',
            caption: 'Facebook'
          },
          priority: 0.7 // Prioridad alta para programas
        }, {
          loc: 'https://www.chanquinafm.cl',
          lastmod: moment().format('YYYY-MM-DD'),
          image: {
            url: 'https://www.chanquinafm.cl/img_rss/whatsapp.png',
            caption: 'Whatsapp'
          },
          priority: 0.7 // Prioridad alta para programas
        }, {
          loc: 'https://www.chanquinafm.cl',
          lastmod: moment().format('YYYY-MM-DD'),
          image: {
            url: 'https://www.chanquinafm.cl/img_rss/celular.png',
            caption: 'Celular'
          },
          priority: 0.7 // Prioridad alta para programas
        }, {
          loc: 'https://www.chanquinafm.cl',
          lastmod: moment().format('YYYY-MM-DD'),
          image: {
            url: 'https://www.chanquinafm.cl/img_rss/instagram.png',
            caption: 'Instagram'
          },
          priority: 0.7 // Prioridad alta para programas
        }, {
          loc: 'https://www.chanquinafm.cl',
          lastmod: moment().format('YYYY-MM-DD'),
          image: {
            url: 'https://www.chanquinafm.cl/img_rss/ubicacion.png',
            caption: 'Ubicacion'
          },
          priority: 0.7 // Prioridad alta para programas
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

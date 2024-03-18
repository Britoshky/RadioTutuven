const multer = require("multer");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const compression = require("compression");
const sharp = require("sharp");
const fs = require("fs");

const configureUploadMiddleware = (uploadFolder) => {
  const storage = multer.memoryStorage();

  const uploadMiddleware = multer({
    storage,
    limits: { fileSize: 50000000000 },
    fileFilter: (req, file, cb) => {
      const fileTypes = /jpeg|jpg|png|gif/;
      const mimetype = fileTypes.test(file.mimetype);
      const extname = fileTypes.test(path.extname(file.originalname));

      if (mimetype && extname) {
        return cb(null, true);
      } else {
        cb("Error: Archivo no permitido");
      }
    },
  }).single("imagen");

  const compressAndSaveMiddleware = async (req, res, next) => {
    try {
      if (!req.file) {
        return next();
      }

      const compressedImageBuffer = await sharp(req.file.buffer)
        .webp({ quality: 80 })
        .toBuffer();

      const filename = uuidv4() + ".webp";
      const filepath = path.join(__dirname, `../public/${uploadFolder}`, filename);

      await fs.promises.writeFile(filepath, compressedImageBuffer);

      // Guardar el nombre de la imagen comprimida en la solicitud
      req.compressedImageFilename = filename;

      req.uploadSuccess = true;
      next();
    } catch (error) {
      next(error);
    }
  };

  const compressImagesMiddleware = compression({
    filter: (req, res) => {
      return (/image/).test(res.getHeader('Content-Type'));
    },
    threshold: 500,
  });

  return [uploadMiddleware, compressAndSaveMiddleware, compressImagesMiddleware];
};

module.exports = configureUploadMiddleware;

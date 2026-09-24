const multer = require("multer");
const path = require("path");
const { randomUUID } = require("crypto");
const compression = require("compression");
const sharp = require("sharp");
const fs = require("fs");

const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // 10 MB — imágenes del panel
const ALLOWED_IMAGE = /^(image\/(jpeg|jpg|png|gif|webp))$/i;
const ALLOWED_EXT = /^\.(jpe?g|png|gif|webp)$/i;

const configureUploadMiddleware = (uploadFolder) => {
  const storage = multer.memoryStorage();

  const uploadMiddleware = multer({
    storage,
    limits: { fileSize: MAX_IMAGE_BYTES, files: 1 },
    fileFilter: (req, file, cb) => {
      const mimetypeOk = ALLOWED_IMAGE.test(file.mimetype);
      const extOk = ALLOWED_EXT.test(path.extname(file.originalname || ""));

      if (mimetypeOk && extOk) {
        return cb(null, true);
      }
      return cb(new Error("Archivo no permitido: solo JPEG, PNG, GIF o WebP"));
    },
  }).single("imagen");

  const compressAndSaveMiddleware = async (req, res, next) => {
    try {
      if (!req.file) {
        return next();
      }

      const compressedImageBuffer = await sharp(req.file.buffer)
        .rotate()
        .webp({ quality: 80 })
        .toBuffer();

      const filename = `${randomUUID()}.webp`;
      const filepath = path.join(__dirname, `../public/${uploadFolder}`, filename);

      await fs.promises.mkdir(path.dirname(filepath), { recursive: true });
      await fs.promises.writeFile(filepath, compressedImageBuffer);

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

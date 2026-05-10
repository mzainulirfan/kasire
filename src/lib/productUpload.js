const fs = require("fs");
const path = require("path");
const multer = require("multer");

const PRODUCT_UPLOAD_DIR = path.join(__dirname, "..", "..", "public", "uploads", "products");
const MAX_PRODUCT_IMAGES = 4;

function ensureProductUploadDir() {
  if (!fs.existsSync(PRODUCT_UPLOAD_DIR)) {
    fs.mkdirSync(PRODUCT_UPLOAD_DIR, { recursive: true });
  }
}

function createSafeFileName(originalName) {
  const ext = path.extname(originalName || "").toLowerCase() || ".jpg";
  return `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
}

const storage = multer.diskStorage({
  destination(req, file, cb) {
    ensureProductUploadDir();
    cb(null, PRODUCT_UPLOAD_DIR);
  },
  filename(req, file, cb) {
    cb(null, createSafeFileName(file.originalname));
  }
});

function imageFileFilter(req, file, cb) {
  if (file.mimetype && file.mimetype.startsWith("image/")) {
    cb(null, true);
    return;
  }

  cb(new Error("Hanya file gambar yang diperbolehkan."));
}

const upload = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: {
    files: MAX_PRODUCT_IMAGES,
    fileSize: 5 * 1024 * 1024
  }
});

function handleProductImagesUpload(req, res, next) {
  upload.array("images", MAX_PRODUCT_IMAGES)(req, res, (error) => {
    if (error) {
      if (error.code === "LIMIT_FILE_SIZE") {
        return res.status(413).json({
          message: "Ukuran foto terlalu besar. Maksimal 5 MB per foto."
        });
      }

      if (error.code === "LIMIT_FILE_COUNT") {
        return res.status(400).json({
          message: `Maksimal ${MAX_PRODUCT_IMAGES} foto product.`
        });
      }

      return res.status(400).json({
        message: error.message || "Gagal mengunggah foto product."
      });
    }

    return next();
  });
}

function deleteUploadedProductFiles(files = []) {
  files.forEach((file) => {
    if (!file || !file.path) {
      return;
    }

    try {
      fs.unlinkSync(file.path);
    } catch (error) {
      // Ignore cleanup failures.
    }
  });
}

module.exports = {
  PRODUCT_UPLOAD_DIR,
  MAX_PRODUCT_IMAGES,
  ensureProductUploadDir,
  handleProductImagesUpload,
  deleteUploadedProductFiles
};

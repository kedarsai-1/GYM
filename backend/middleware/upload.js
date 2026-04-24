const multer = require("multer");
const fs = require("fs");
const path = require("path");

const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (
      file.fieldname === "memberImage" ||
      file.fieldname === "beforeImage" ||
      file.fieldname === "afterImage"
    ) {
      const memberDir = path.join("uploads", "members");
      ensureDir(memberDir);
      cb(null, memberDir);
    } else if (file.fieldname === "upiScreenshot") {
      const paymentDir = path.join("uploads", "payments");
      ensureDir(paymentDir);
      cb(null, paymentDir);
    } else {
      cb(new Error("Invalid upload field"));
    }
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({ storage });

/** In-memory upload for bulk CSV/XLSX import (not persisted as a single file). */
const uploadImport = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 },
});

module.exports = upload;
module.exports.uploadImport = uploadImport;
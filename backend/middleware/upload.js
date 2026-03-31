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
    if (file.fieldname === "memberImage") {
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

module.exports = multer({ storage });
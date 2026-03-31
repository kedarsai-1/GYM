const express = require("express");
const router = express.Router();
const adminController = require("../controller/adminController");

router.post("/register", adminController.registerAdmin);
router.post("/login", adminController.loginAdmin);
router.post("/seed", adminController.seedAdmin);

module.exports = router;
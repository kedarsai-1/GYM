const Admin = require("../models/Admin");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.registerAdmin = async (req, res) => {
  try {
    const totalAdmins = await Admin.countDocuments();
    if (totalAdmins >= 1) {
      return res.status(403).json({ message: "Only one admin account is allowed" });
    }

    if (!req.body.username || !req.body.password) {
      return res.status(400).json({ message: "Username and password are required" });
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const admin = new Admin({
      username: req.body.username,
      password: hashedPassword
    });

    await admin.save();
    res.status(201).json({ message: "Admin Registered" });
  } catch (error) {
    res.status(500).json({ message: "Failed to register admin", error: error.message });
  }
};

exports.loginAdmin = async (req, res) => {
  try {
    const admin = await Admin.findOne({ username: req.body.username });
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    const valid = await bcrypt.compare(req.body.password, admin.password);
    if (!valid) {
      return res.status(401).json({ message: "Invalid password" });
    }

    const token = jwt.sign(
      { id: admin._id, username: admin.username },
      process.env.JWT_SECRET || "secretkey",
      { expiresIn: "1d" }
    );

    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: "Login failed", error: error.message });
  }
};

exports.seedAdmin = async (req, res) => {
  try {
    const totalAdmins = await Admin.countDocuments();
    if (totalAdmins >= 1) {
      return res.status(403).json({
        message:
          "Admin already exists. Remove the admin document from the database to seed again.",
      });
    }

    const username = req.body.username || process.env.ADMIN_USERNAME || "admin";
    const password = req.body.password || process.env.ADMIN_PASSWORD || "admin123";
    const hashedPassword = await bcrypt.hash(password, 10);

    await Admin.create({ username, password: hashedPassword });

    res.status(201).json({
      message: "Admin seeded successfully",
      username,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to seed admin", error: error.message });
  }
};
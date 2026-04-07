/**
 * Creates the first admin if none exists.
 * Uses MONGODB_URI from .env (same as the app).
 *
 * Optional env:
 *   ADMIN_USERNAME (default: admin)
 *   ADMIN_PASSWORD (default: admin123) — change in production
 *
 * Run from backend folder: npm run seed:admin
 */

const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const connectDB = require("../config/db");
const Admin = require("../models/Admin");

async function run() {
  await connectDB();

  try {
    const total = await Admin.countDocuments();
    if (total >= 1) {
      console.log(
        `Found ${total} admin document(s). Seed skipped (only one admin allowed). Delete admins in the "admins" collection to seed again.`
      );
      return;
    }

    const username = (process.env.ADMIN_USERNAME || "admin").trim() || "admin";
    const password = process.env.ADMIN_PASSWORD || "admin123";
    const hashedPassword = await bcrypt.hash(password, 10);

    await Admin.create({ username, password: hashedPassword });

    console.log("Admin seeded successfully.");
    console.log("  Username:", username);
    console.log(
      "  Password: value from ADMIN_PASSWORD in .env, or default `admin123` if unset."
    );
    console.log("  Change the password after first login in production.");
  } finally {
    await mongoose.disconnect();
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

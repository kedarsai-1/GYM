const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./config/db");

const app = express();
const PORT = process.env.PORT || 5001;
const allowedOrigins = (process.env.CORS_ORIGIN ||
  "http://localhost:3000,https://spiffy-puffpuff-3a0f5d.netlify.app")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(express.json());
app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
);
app.use("/uploads", express.static("uploads"));

app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/members", require("./routes/memberRoutes"));
app.use("/api/export", require("./routes/exportRoutes"));

async function start() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

start().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});

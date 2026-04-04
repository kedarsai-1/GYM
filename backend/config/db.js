const mongoose = require("mongoose");

/**
 * Atlas / Render: set MONGODB_URI (or MONGO_URI) in the host environment.
 * Atlas → Network Access: allow 0.0.0.0/0 so Render can connect.
 */

function resolveMongoUri() {
  const raw =
    process.env.MONGODB_URI ||
    process.env.MONGO_URI ||
    process.env.DATABASE_URL ||
    "";
  const trimmed = typeof raw === "string" ? raw.trim() : "";
  if (trimmed.length > 0) {
    return trimmed;
  }

  // Render sets at least one of these (value is often "true" but not guaranteed to match === "true")
  const onRender =
    Boolean(process.env.RENDER) ||
    Boolean(process.env.RENDER_SERVICE_ID) ||
    Boolean(process.env.RENDER_EXTERNAL_URL);

  if (onRender) {
    return null;
  }

  if (process.env.NODE_ENV === "production") {
    return null;
  }

  return "mongodb://127.0.0.1:27017/gym";
}

const connectDB = async () => {
  const uri = resolveMongoUri();

  if (typeof uri !== "string" || uri.length === 0) {
    console.error(
      "FATAL: No MongoDB URI. Set MONGODB_URI in Render → Environment with your Atlas connection string."
    );
    process.exit(1);
  }

  mongoose.set("strictQuery", false);

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 20_000,
      maxPoolSize: 10,
    });
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;

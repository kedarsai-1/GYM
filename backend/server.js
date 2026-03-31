const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./config/db");

const app = express();
const PORT = process.env.PORT || 5001;

connectDB();

app.use(express.json());
app.use(cors({origin: "http://localhost:3000"}));
app.use("/uploads", express.static("uploads"));

app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/members", require("./routes/memberRoutes"));
app.use("/api/export", require("./routes/exportRoutes"));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect("mongodb+srv://kedar:Zero%401234@cluster0.pygiv.mongodb.net/e-commerce?retryWrites=true&w=majority");
    console.log("MongoDB Connected");
  } catch (error) {
    console.log(error);
  }
};

module.exports = connectDB;
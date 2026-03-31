const mongoose = require("mongoose");

const memberSchema = new mongoose.Schema({
  name: String,
  age: {
    type: Number,
    min: 0,
  },
  gender: String,
  phone: String,
  height: Number,
  weight: Number,
  goal: String,

  memberImage: String,

  membership: {
    startDate: Date,
    endDate: Date,
    plan: String
  },

  payment: {
    type: {
      type: String,
      enum: ["Cash", "UPI"]
    },
    amount: Number,
    upiScreenshot: String,
    paymentDate: Date
  },

  dietPlan: {
    morning: String,
    breakfast: String,
    lunch: String,
    snacks: String,
    dinner: String
  },

  workoutPlan: {
    monday: String,
    tuesday: String,
    wednesday: String,
    thursday: String,
    friday: String,
    saturday: String
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Member", memberSchema);
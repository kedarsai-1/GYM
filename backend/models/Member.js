const mongoose = require("mongoose");

const memberSchema = new mongoose.Schema({
  name: String,
  age: {
    type: Number,
    min: 0,
  },
  gender: String,
  phone: String,
  address: { type: String, default: "" },
  height: Number,
  weight: Number,
  joiningWeight: Number,
  joiningWeightDate: Date,
  updatedWeight: Number,
  weightUpdateDate: Date,
  goal: String,
  workoutType: { type: String, default: "" },
  tenureMonths: Number,
  /** Fraction of day (0–1), e.g. 0.75 ≈ 18:00 — matches Excel time columns */
  preferredTimeFraction: Number,

  memberCategory: {
    type: String,
    enum: ["General Member", "Senior Citizen", "Gold Member", "Student Member", ""],
    default: "General Member",
  },
  pendingBalance: { type: Number, default: 0 },
  /** e.g. "No", "Yes(₹1,000)" */
  pendingStatus: { type: String, default: "No" },
  remarks: { type: String, default: "" },

  memberImage: String,
  beforeImage: String,
  afterImage: String,

  membership: {
    startDate: Date,
    endDate: Date,
    plan: String
  },

  payment: {
    type: {
      type: String,
      enum: ["Cash", "UPI", "PhonePe"]
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
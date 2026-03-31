const Member = require("../models/Member");

exports.addMember = async (req, res) => {
  try {
    const files = req.files || {};
    const age = Number(req.body.age);
    if (!Number.isNaN(age) && age < 0) {
      return res.status(400).json({ message: "Age cannot be negative" });
    }
    const member = new Member({
      name: req.body.name,
      age: req.body.age,
      gender: req.body.gender,
      phone: req.body.phone,
      height: req.body.height,
      weight: req.body.weight,
      goal: req.body.goal,

      membership: {
        startDate: req.body.startDate,
        endDate: req.body.endDate,
        plan: req.body.plan
      },

      memberImage: files.memberImage
        ? files.memberImage[0].filename
        : null,

      payment: {
        type: req.body.paymentType,
        amount: req.body.amount,
        upiScreenshot: files.upiScreenshot
          ? files.upiScreenshot[0].filename
          : null,
        paymentDate: new Date()
      }
    });

    await member.save();
    res.json("Member Added");
  } catch (error) {
    res.status(500).json({
      message: "Failed to add member",
      error: error.message
    });
  }
};

exports.getMembers = async (req, res) => {
  const members = await Member.find();
  res.json(members);
};

exports.getMemberById = async (req, res) => {
  const member = await Member.findById(req.params.id);
  res.json(member);
};

exports.updateMember = async (req, res) => {
  const age = Number(req.body.age);
  if (!Number.isNaN(age) && age < 0) {
    return res.status(400).json({ message: "Age cannot be negative" });
  }

  const updateData = {
    name: req.body.name,
    phone: req.body.phone,
    age: req.body.age,
    gender: req.body.gender,
    goal: req.body.goal,
    membership: {
      startDate: req.body.startDate,
      endDate: req.body.endDate,
    },
    payment: {
      type: req.body.paymentType,
      amount: req.body.amount,
      paymentDate: new Date(),
    },
  };

  await Member.findByIdAndUpdate(req.params.id, updateData, { new: true });
  res.json("Member Updated");
};

exports.deleteMember = async (req, res) => {
  await Member.findByIdAndDelete(req.params.id);
  res.json("Member Deleted");
};

exports.updateDietPlan = async (req, res) => {
  try {
    await Member.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          dietPlan: {
            morning: req.body.morning || "",
            breakfast: req.body.breakfast || "",
            lunch: req.body.lunch || "",
            snacks: req.body.snacks || "",
            dinner: req.body.dinner || "",
          },
        },
      },
      { new: true }
    );
    res.json({ message: "Diet plan updated" });
  } catch (error) {
    res.status(500).json({ message: "Failed to update diet plan", error: error.message });
  }
};

exports.updateWorkoutPlan = async (req, res) => {
  try {
    await Member.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          workoutPlan: {
            monday: req.body.monday || "",
            tuesday: req.body.tuesday || "",
            wednesday: req.body.wednesday || "",
            thursday: req.body.thursday || "",
            friday: req.body.friday || "",
            saturday: req.body.saturday || "",
          },
        },
      },
      { new: true }
    );
    res.json({ message: "Workout plan updated" });
  } catch (error) {
    res.status(500).json({ message: "Failed to update workout plan", error: error.message });
  }
};

exports.expiringMembers = async (req, res) => {
    const today = new Date();
    const next3Days = new Date();
    next3Days.setDate(today.getDate() + 3);
  
    const members = await Member.find({
      "membership.endDate": { $lte: next3Days }
    });
  
    res.json(members);
  };
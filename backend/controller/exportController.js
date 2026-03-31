const Member = require("../models/Member");
const { Parser } = require("json2csv");
const XLSX = require("xlsx");

const toMemberExportRow = (m) => ({
  id: m._id?.toString() || "",
  name: m.name || "",
  phone: m.phone || "",
  age: m.age || "",
  gender: m.gender || "",
  goal: m.goal || "",
  membershipStartDate: m.membership?.startDate || "",
  membershipEndDate: m.membership?.endDate || "",
  membershipPlan: m.membership?.plan || "",
  paymentType: m.payment?.type || "",
  paymentAmount: m.payment?.amount || "",
  paymentDate: m.payment?.paymentDate || "",
  dietMorning: m.dietPlan?.morning || "",
  dietBreakfast: m.dietPlan?.breakfast || "",
  dietLunch: m.dietPlan?.lunch || "",
  dietSnacks: m.dietPlan?.snacks || "",
  dietDinner: m.dietPlan?.dinner || "",
  workoutMonday: m.workoutPlan?.monday || "",
  workoutTuesday: m.workoutPlan?.tuesday || "",
  workoutWednesday: m.workoutPlan?.wednesday || "",
  workoutThursday: m.workoutPlan?.thursday || "",
  workoutFriday: m.workoutPlan?.friday || "",
  workoutSaturday: m.workoutPlan?.saturday || "",
  createdAt: m.createdAt || "",
});

const toDietExportRow = (m) => ({
  id: m._id?.toString() || "",
  name: m.name || "",
  phone: m.phone || "",
  morning: m.dietPlan?.morning || "",
  breakfast: m.dietPlan?.breakfast || "",
  lunch: m.dietPlan?.lunch || "",
  snacks: m.dietPlan?.snacks || "",
  dinner: m.dietPlan?.dinner || "",
});

exports.exportCSV = async (req, res) => {
  try {
    const members = await Member.find().lean();
    const rows = members.map(toMemberExportRow);
    const parser = new Parser();
    const csv = parser.parse(rows);

    res.header("Content-Type", "text/csv");
    res.attachment("members.csv");
    return res.send(csv);
  } catch (error) {
    return res.status(500).json({ message: "Failed to export CSV", error: error.message });
  }
};

exports.exportExcel = async (req, res) => {
  try {
    const members = await Member.find().lean();
    const rows = members.map(toMemberExportRow);
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Members");

    const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "buffer" });
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", "attachment; filename=members.xlsx");
    res.send(buffer);
  } catch (error) {
    return res.status(500).json({ message: "Failed to export Excel", error: error.message });
  }
};

exports.exportMemberCSV = async (req, res) => {
  try {
    const member = await Member.findById(req.params.id).lean();
    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }
    const parser = new Parser();
    const csv = parser.parse([toMemberExportRow(member)]);
    res.header("Content-Type", "text/csv");
    res.attachment(`member-${req.params.id}.csv`);
    return res.send(csv);
  } catch (error) {
    return res.status(500).json({ message: "Failed to export member CSV", error: error.message });
  }
};

exports.exportMemberExcel = async (req, res) => {
  try {
    const member = await Member.findById(req.params.id).lean();
    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }
    const worksheet = XLSX.utils.json_to_sheet([toMemberExportRow(member)]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Member");

    const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "buffer" });
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", `attachment; filename=member-${req.params.id}.xlsx`);
    res.send(buffer);
  } catch (error) {
    return res.status(500).json({ message: "Failed to export member Excel", error: error.message });
  }
};

exports.exportDietCSV = async (req, res) => {
  try {
    const members = await Member.find().lean();
    const rows = members.map(toDietExportRow);
    const parser = new Parser();
    const csv = parser.parse(rows);
    res.header("Content-Type", "text/csv");
    res.attachment("diet-plans.csv");
    return res.send(csv);
  } catch (error) {
    return res.status(500).json({ message: "Failed to export diet CSV", error: error.message });
  }
};

exports.exportDietExcel = async (req, res) => {
  try {
    const members = await Member.find().lean();
    const rows = members.map(toDietExportRow);
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Diet Plans");
    const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "buffer" });
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", "attachment; filename=diet-plans.xlsx");
    res.send(buffer);
  } catch (error) {
    return res.status(500).json({ message: "Failed to export diet Excel", error: error.message });
  }
};

exports.exportMemberDietCSV = async (req, res) => {
  try {
    const member = await Member.findById(req.params.id).lean();
    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }
    const parser = new Parser();
    const csv = parser.parse([toDietExportRow(member)]);
    res.header("Content-Type", "text/csv");
    res.attachment(`member-diet-${req.params.id}.csv`);
    return res.send(csv);
  } catch (error) {
    return res.status(500).json({ message: "Failed to export member diet CSV", error: error.message });
  }
};

exports.exportMemberDietExcel = async (req, res) => {
  try {
    const member = await Member.findById(req.params.id).lean();
    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }
    const worksheet = XLSX.utils.json_to_sheet([toDietExportRow(member)]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Diet Plan");
    const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "buffer" });
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", `attachment; filename=member-diet-${req.params.id}.xlsx`);
    res.send(buffer);
  } catch (error) {
    return res.status(500).json({ message: "Failed to export member diet Excel", error: error.message });
  }
};
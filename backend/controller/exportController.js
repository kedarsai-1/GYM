const Member = require("../models/Member");
const { Parser } = require("json2csv");
const XLSX = require("xlsx");

function preferredTimeLabel(fraction) {
  if (fraction === undefined || fraction === null || fraction === "") return "";
  const f = Number(fraction);
  if (!Number.isFinite(f)) return "";
  const mins = Math.round(f * 24 * 60);
  const h = Math.floor(mins / 60) % 24;
  const m = mins % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** Aligns with Gym Client Details.xlsx columns */
const toMemberExportRow = (m) => ({
  id: m._id?.toString() || "",
  name: m.name || "",
  gender: m.gender || "",
  age: m.age ?? "",
  joiningWeightKg: m.joiningWeight ?? "",
  joiningWeightDate: m.joiningWeightDate || "",
  updatedWeightKg: m.updatedWeight ?? m.weight ?? "",
  weightUpdateDate: m.weightUpdateDate || "",
  amount: m.payment?.amount ?? "",
  paymentType: m.payment?.type || "",
  paymentDate: m.payment?.paymentDate || "",
  startDate: m.membership?.startDate || "",
  endDate: m.membership?.endDate || "",
  workoutType: m.workoutType || "",
  tenureMonths: m.tenureMonths ?? "",
  preferredTime: preferredTimeLabel(m.preferredTimeFraction),
  preferredTimeFraction: m.preferredTimeFraction ?? "",
  mobile: m.phone || "",
  address: m.address || "",
  memberCategory: m.memberCategory || "",
  pendingStatus: m.pendingStatus || "",
  pendingBalance: m.pendingBalance ?? "",
  remarks: m.remarks || "",
  goal: m.goal || "",
  height: m.height ?? "",
  membershipPlan: m.membership?.plan || "",
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

/** Header row for bulk import — matches `utils/importMember` column aliases */
const IMPORT_TEMPLATE_HEADERS = [
  "name",
  "gender",
  "age",
  "mobile",
  "address",
  "joiningWeightKg",
  "joiningWeightDate",
  "updatedWeightKg",
  "weightUpdateDate",
  "amount",
  "paymentType",
  "paymentDate",
  "startDate",
  "endDate",
  "workoutType",
  "tenureMonths",
  "preferredTime",
  "preferredTimeFraction",
  "memberCategory",
  "pendingStatus",
  "pendingBalance",
  "remarks",
  "goal",
  "height",
  "membershipPlan",
];

function pickImportCompatibleField(m, header) {
  switch (header) {
    case "name":
      return m.name || "";
    case "gender":
      return m.gender || "";
    case "age":
      return m.age ?? "";
    case "mobile":
      return m.phone || "";
    case "address":
      return m.address || "";
    case "joiningWeightKg":
      return m.joiningWeight ?? "";
    case "joiningWeightDate":
      return m.joiningWeightDate || "";
    case "updatedWeightKg":
      return m.updatedWeight ?? m.weight ?? "";
    case "weightUpdateDate":
      return m.weightUpdateDate || "";
    case "amount":
      return m.payment?.amount ?? "";
    case "paymentType":
      return m.payment?.type || "";
    case "paymentDate":
      return m.payment?.paymentDate || "";
    case "startDate":
      return m.membership?.startDate || "";
    case "endDate":
      return m.membership?.endDate || "";
    case "workoutType":
      return m.workoutType || "";
    case "tenureMonths":
      return m.tenureMonths ?? "";
    case "preferredTime":
      return preferredTimeLabel(m.preferredTimeFraction);
    case "preferredTimeFraction":
      return m.preferredTimeFraction ?? "";
    case "memberCategory":
      return m.memberCategory || "";
    case "pendingStatus":
      return m.pendingStatus || "";
    case "pendingBalance":
      return m.pendingBalance ?? "";
    case "remarks":
      return m.remarks || "";
    case "goal":
      return m.goal || "";
    case "height":
      return m.height ?? "";
    case "membershipPlan":
      return m.membership?.plan || "";
    default:
      return "";
  }
}

/** Same columns as the import template — safe to edit and bulk re-import */
function toImportCompatibleRow(m) {
  const row = {};
  for (const h of IMPORT_TEMPLATE_HEADERS) {
    row[h] = pickImportCompatibleField(m, h);
  }
  return row;
}

exports.exportImportCompatibleCSV = async (req, res) => {
  try {
    const members = await Member.find().lean();
    const rows = members.map(toImportCompatibleRow);
    const parser = new Parser({ fields: IMPORT_TEMPLATE_HEADERS });
    const csv = parser.parse(rows);
    res.header("Content-Type", "text/csv; charset=utf-8");
    res.attachment("members-import-compatible.csv");
    return res.send(csv);
  } catch (error) {
    return res.status(500).json({ message: "Failed to export CSV", error: error.message });
  }
};

exports.exportImportCompatibleExcel = async (req, res) => {
  try {
    const members = await Member.find().lean();
    const rows = members.map(toImportCompatibleRow);
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Members");
    const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "buffer" });
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=members-import-compatible.xlsx"
    );
    res.send(buffer);
  } catch (error) {
    return res.status(500).json({ message: "Failed to export Excel", error: error.message });
  }
};

exports.exportMemberImportCompatibleCSV = async (req, res) => {
  try {
    const member = await Member.findById(req.params.id).lean();
    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }
    const parser = new Parser({ fields: IMPORT_TEMPLATE_HEADERS });
    const csv = parser.parse([toImportCompatibleRow(member)]);
    res.header("Content-Type", "text/csv; charset=utf-8");
    res.attachment(`member-import-compatible-${req.params.id}.csv`);
    return res.send(csv);
  } catch (error) {
    return res.status(500).json({ message: "Failed to export member CSV", error: error.message });
  }
};

exports.exportMemberImportCompatibleExcel = async (req, res) => {
  try {
    const member = await Member.findById(req.params.id).lean();
    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }
    const worksheet = XLSX.utils.json_to_sheet([toImportCompatibleRow(member)]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Member");
    const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "buffer" });
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=member-import-compatible-${req.params.id}.xlsx`
    );
    res.send(buffer);
  } catch (error) {
    return res.status(500).json({ message: "Failed to export member Excel", error: error.message });
  }
};

exports.exportImportTemplateExcel = (req, res) => {
  try {
    const sheet = XLSX.utils.aoa_to_sheet([IMPORT_TEMPLATE_HEADERS]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, sheet, "Members");
    const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "buffer" });
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=members-import-template.xlsx"
    );
    res.send(buffer);
  } catch (error) {
    return res.status(500).json({ message: "Failed to build template", error: error.message });
  }
};

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
const Member = require("../models/Member");
const { Parser } = require("json2csv");
const XLSX = require("xlsx");
const {
  GYM_CLIENT_DETAILS_HEADERS,
  toGymClientDetailsRow,
} = require("./gymClientExport");

async function fetchMembersSorted() {
  return Member.find().sort({ createdAt: 1 }).lean();
}

exports.exportImportCompatibleCSV = async (req, res) => {
  try {
    const members = await fetchMembersSorted();
    const rows = members.map((m, i) => toGymClientDetailsRow(m, i + 1));
    const parser = new Parser({ fields: GYM_CLIENT_DETAILS_HEADERS });
    const csv = parser.parse(rows);
    res.header("Content-Type", "text/csv; charset=utf-8");
    res.attachment("gym-client-details.csv");
    return res.send(csv);
  } catch (error) {
    return res.status(500).json({ message: "Failed to export CSV", error: error.message });
  }
};

exports.exportImportCompatibleExcel = async (req, res) => {
  try {
    const members = await fetchMembersSorted();
    const rows = members.map((m, i) => toGymClientDetailsRow(m, i + 1));
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
    const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "buffer" });
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", "attachment; filename=gym-client-details.xlsx");
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
    const parser = new Parser({ fields: GYM_CLIENT_DETAILS_HEADERS });
    const csv = parser.parse([toGymClientDetailsRow(member, 1)]);
    res.header("Content-Type", "text/csv; charset=utf-8");
    res.attachment(`gym-client-details-member-${req.params.id}.csv`);
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
    const worksheet = XLSX.utils.json_to_sheet([toGymClientDetailsRow(member, 1)]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
    const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "buffer" });
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=gym-client-details-member-${req.params.id}.xlsx`
    );
    res.send(buffer);
  } catch (error) {
    return res.status(500).json({ message: "Failed to export member Excel", error: error.message });
  }
};

exports.exportImportTemplateExcel = (req, res) => {
  try {
    const sheet = XLSX.utils.aoa_to_sheet([GYM_CLIENT_DETAILS_HEADERS]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, sheet, "Sheet1");
    const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "buffer" });
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=gym-client-details-template.xlsx"
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

/** Gym Client Details layout (same as original spreadsheet) */
exports.exportCSV = exports.exportImportCompatibleCSV;
exports.exportExcel = exports.exportImportCompatibleExcel;
exports.exportMemberCSV = exports.exportMemberImportCompatibleCSV;
exports.exportMemberExcel = exports.exportMemberImportCompatibleExcel;

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

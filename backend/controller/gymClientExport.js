/**
 * Column layout matching the original "Gym Client Details.xlsx" sheet.
 * Used for CSV/Excel export, import template, and import-compatible downloads.
 */

function fmtDate(d) {
  if (!d) return "";
  const x = new Date(d);
  if (Number.isNaN(x.getTime())) return "";
  return x.toISOString().slice(0, 10);
}

function fmtAgeYears(age) {
  if (age === undefined || age === null || age === "") return "";
  const n = Number(age);
  if (!Number.isFinite(n)) return String(age);
  return `${n} years`;
}

function fmtWeightKg(w) {
  if (w === undefined || w === null || w === "") return "";
  const n = Number(w);
  if (!Number.isFinite(n)) return String(w);
  return `${n % 1 === 0 ? n : n.toFixed(1)} kg`;
}

/** Exact header order from Gym Client Details.xlsx */
const GYM_CLIENT_DETAILS_HEADERS = [
  "ID",
  "Name",
  "Gender",
  "Age",
  "Joining Weight (kg)",
  "Joining Weight Date",
  "Updated Weight (kg)",
  "Update Date",
  "Amount",
  "Payment Type",
  "Payment Date",
  "Start Date",
  "End Date",
  "Workout Type",
  "Tenure",
  "Preferred Time",
  "Mobile",
  "Address",
  "Status",
  "Pending Amount",
  "Pending Balance",
  "Remarks",
];

function gymClientDetailsValue(m, header, rowId) {
  switch (header) {
    case "ID":
      return rowId;
    case "Name":
      return m.name || "";
    case "Gender":
      return m.gender || "";
    case "Age":
      return fmtAgeYears(m.age);
    case "Joining Weight (kg)":
      return fmtWeightKg(m.joiningWeight);
    case "Joining Weight Date":
      return fmtDate(m.joiningWeightDate);
    case "Updated Weight (kg)": {
      const w = m.updatedWeight !== undefined && m.updatedWeight !== null ? m.updatedWeight : m.weight;
      return fmtWeightKg(w);
    }
    case "Update Date":
      return fmtDate(m.weightUpdateDate);
    case "Amount":
      return m.payment?.amount ?? "";
    case "Payment Type":
      return m.payment?.type || "";
    case "Payment Date":
      return fmtDate(m.payment?.paymentDate);
    case "Start Date":
      return fmtDate(m.membership?.startDate);
    case "End Date":
      return fmtDate(m.membership?.endDate);
    case "Workout Type":
      return m.workoutType || "";
    case "Tenure":
      return m.tenureMonths ?? "";
    case "Preferred Time": {
      const f = m.preferredTimeFraction;
      if (f === undefined || f === null || f === "") return "";
      const n = Number(f);
      return Number.isFinite(n) ? n : "";
    }
    case "Mobile":
      return m.phone || "";
    case "Address":
      return m.address || "";
    case "Status":
      return m.memberCategory || "";
    case "Pending Amount":
      return m.pendingStatus || "";
    case "Pending Balance":
      return m.pendingBalance ?? "";
    case "Remarks":
      return m.remarks || "";
    default:
      return "";
  }
}

function toGymClientDetailsRow(m, rowId) {
  const row = {};
  for (const h of GYM_CLIENT_DETAILS_HEADERS) {
    row[h] = gymClientDetailsValue(m, h, rowId);
  }
  return row;
}

module.exports = {
  GYM_CLIENT_DETAILS_HEADERS,
  toGymClientDetailsRow,
};

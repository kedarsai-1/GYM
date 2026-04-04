const { addMonths } = require("./memberDates");

function parseNum(v) {
  if (v === undefined || v === null || v === "") return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

function normalizeHeader(h) {
  return String(h).trim().toLowerCase().replace(/[^a-z0-9]+/g, "");
}

/** Excel / ISO / Date / serial number */
function parseFlexibleDate(val) {
  if (val === undefined || val === null || val === "") return undefined;
  if (val instanceof Date && !Number.isNaN(val.getTime())) return val;
  if (typeof val === "number") {
    if (val > 20000 && val < 60000) {
      const utc = (val - 25569) * 86400 * 1000;
      const d = new Date(utc);
      return Number.isNaN(d.getTime()) ? undefined : d;
    }
    return undefined;
  }
  const d = new Date(val);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

function parseAge(val) {
  if (val === undefined || val === null || val === "") return undefined;
  if (typeof val === "number" && Number.isFinite(val)) return Math.max(0, Math.floor(val));
  const s = String(val).replace(/years?/gi, "").trim();
  const n = parseInt(s, 10);
  return Number.isFinite(n) ? Math.max(0, n) : undefined;
}

function parseWeightKg(val) {
  if (val === undefined || val === null || val === "") return undefined;
  if (typeof val === "number" && Number.isFinite(val)) return val;
  const m = String(val).match(/(\d+\.?\d*)/);
  return m ? parseFloat(m[1]) : parseNum(val);
}

function normalizePaymentType(t) {
  if (!t) return "Cash";
  const s = String(t).trim();
  if (/phonepe/i.test(s)) return "PhonePe";
  if (/^upi$/i.test(s)) return "UPI";
  if (/^cash$/i.test(s)) return "Cash";
  return s;
}

function timeStringToFraction(timeStr) {
  if (!timeStr || typeof timeStr !== "string") return undefined;
  const m = timeStr.trim().match(/^(\d{1,2}):(\d{2})/);
  if (!m) return undefined;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (!Number.isFinite(h) || !Number.isFinite(min)) return undefined;
  return (h * 3600 + min * 60) / 86400;
}

/**
 * Maps normalized header -> internal field name.
 * Covers app export columns and common Gym Client Details.xlsx names.
 */
const ALIAS_TO_FIELD = (() => {
  const pairs = [
    ["name", "name"],
    ["fullname", "name"],
    ["mobile", "phone"],
    ["phone", "phone"],
    ["gender", "gender"],
    ["age", "age"],
    ["address", "address"],
    ["joiningweightkg", "joiningWeight"],
    ["joiningweight", "joiningWeight"],
    ["joiningweightdate", "joiningWeightDate"],
    ["updatedweightkg", "updatedWeight"],
    ["updatedweight", "updatedWeight"],
    ["weight", "updatedWeight"],
    ["weightupdatedate", "weightUpdateDate"],
    ["updatedate", "weightUpdateDate"],
    ["amount", "amount"],
    ["paymenttype", "paymentType"],
    ["paymentdate", "paymentDate"],
    ["startdate", "startDate"],
    ["enddate", "endDate"],
    ["workouttype", "workoutType"],
    ["tenuremonths", "tenureMonths"],
    ["tenure", "tenureMonths"],
    ["preferredtimefraction", "preferredTimeFraction"],
    ["preferredtime", "preferredTime"],
    ["membercategory", "memberCategory"],
    ["status", "memberCategory"],
    ["pendingstatus", "pendingStatus"],
    ["pendingamount", "pendingStatus"],
    ["pendingbalance", "pendingBalance"],
    ["remarks", "remarks"],
    ["goal", "goal"],
    ["height", "height"],
    ["membershipplan", "plan"],
    ["plan", "plan"],
  ];
  const map = {};
  for (const [alias, field] of pairs) {
    map[alias] = field;
  }
  return map;
})();

function rowToFlatFields(row) {
  const out = {};
  for (const key of Object.keys(row)) {
    const nk = normalizeHeader(key);
    if (nk === "id" || nk === "") continue;
    const field = ALIAS_TO_FIELD[nk];
    if (field) {
      const v = row[key];
      if (v !== undefined && v !== "" && out[field] === undefined) {
        out[field] = v;
      }
    }
  }
  return out;
}

function resolveEndDate(f) {
  const explicit = parseFlexibleDate(f.endDate);
  if (explicit) return explicit;
  const start = parseFlexibleDate(f.startDate);
  const tenure = parseNum(f.tenureMonths);
  if (start && tenure !== undefined && tenure > 0) {
    return addMonths(start, tenure);
  }
  return undefined;
}

/**
 * Build a Member document plain object from one import row (CSV/XLSX).
 */
function buildMemberFromImportRow(row) {
  const f = rowToFlatFields(row);

  const name = f.name != null ? String(f.name).trim() : "";
  if (!name) return null;

  const joiningWeight = parseWeightKg(f.joiningWeight);
  const updatedWeight = parseWeightKg(f.updatedWeight);
  const pendingBalance = parseNum(f.pendingBalance) ?? 0;
  let preferredTimeFraction = parseNum(f.preferredTimeFraction);
  if (
    (preferredTimeFraction === undefined || preferredTimeFraction === null) &&
    f.preferredTime
  ) {
    preferredTimeFraction = timeStringToFraction(String(f.preferredTime));
  }

  const startDate = parseFlexibleDate(f.startDate);
  const endDate = resolveEndDate(f);
  const paymentDate = parseFlexibleDate(f.paymentDate) || new Date();

  const ALLOWED_CAT = [
    "General Member",
    "Senior Citizen",
    "Gold Member",
    "Student Member",
    "",
  ];
  let memberCategory = f.memberCategory
    ? String(f.memberCategory).trim()
    : "General Member";
  if (!ALLOWED_CAT.includes(memberCategory)) {
    memberCategory = "General Member";
  }

  const payType = normalizePaymentType(f.paymentType);
  const paymentType = ["Cash", "UPI", "PhonePe"].includes(payType) ? payType : "Cash";

  const doc = {
    name,
    age: parseAge(f.age),
    gender: f.gender != null ? String(f.gender).trim() : "",
    phone: f.phone != null ? String(f.phone).trim() : "",
    address: f.address != null ? String(f.address).trim() : "",
    height: parseNum(f.height),
    weight: updatedWeight !== undefined ? updatedWeight : undefined,
    joiningWeight,
    joiningWeightDate: parseFlexibleDate(f.joiningWeightDate),
    updatedWeight,
    weightUpdateDate: parseFlexibleDate(f.weightUpdateDate),
    goal: f.goal != null ? String(f.goal).trim() : "",
    workoutType: f.workoutType != null ? String(f.workoutType).trim() : "",
    tenureMonths: parseNum(f.tenureMonths),
    preferredTimeFraction,
    memberCategory,
    pendingBalance,
    pendingStatus: f.pendingStatus != null ? String(f.pendingStatus).trim() : "No",
    remarks: f.remarks != null ? String(f.remarks).trim() : "",
    membership: {
      startDate,
      endDate,
      plan: f.plan != null ? String(f.plan).trim() : "",
    },
    memberImage: null,
    payment: {
      type: paymentType,
      amount: parseNum(f.amount),
      upiScreenshot: null,
      paymentDate,
    },
  };

  return doc;
}

module.exports = {
  buildMemberFromImportRow,
  normalizeHeader,
  rowToFlatFields,
};

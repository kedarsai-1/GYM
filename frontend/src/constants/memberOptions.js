export const WORKOUT_TYPES = ["strength + cardio", "personal training"];

export const MEMBER_CATEGORIES = [
  "General Member",
  "Senior Citizen",
  "Gold Member",
  "Student Member",
];

export function fractionToTimeString(fraction) {
  if (fraction === undefined || fraction === null || fraction === "") return "";
  const f = Number(fraction);
  if (!Number.isFinite(f)) return "";
  const mins = Math.round(f * 24 * 60);
  const h = Math.floor(mins / 60) % 24;
  const m = mins % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function timeStringToFraction(timeStr) {
  if (!timeStr || typeof timeStr !== "string") return undefined;
  const parts = timeStr.split(":");
  if (parts.length < 2) return undefined;
  const h = Number(parts[0]);
  const m = Number(parts[1]);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return undefined;
  return (h * 3600 + m * 60) / 86400;
}

/** End date from start (yyyy-mm-dd) + tenure months — matches backend addMonths */
export function computeEndDateIso(startDateStr, tenureMonths) {
  if (!startDateStr || !tenureMonths) return "";
  const months = Number(tenureMonths);
  if (!Number.isFinite(months) || months <= 0) return "";
  const start = new Date(`${startDateStr}T12:00:00`);
  if (Number.isNaN(start.getTime())) return "";
  const end = new Date(start);
  end.setMonth(end.getMonth() + Math.trunc(months));
  return end.toISOString().slice(0, 10);
}

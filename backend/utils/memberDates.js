/** Add calendar months to a date (for membership tenure). */
function addMonths(dateInput, months) {
  const d = new Date(dateInput);
  if (Number.isNaN(d.getTime())) return null;
  const n = Number(months);
  if (!Number.isFinite(n)) return null;
  const copy = new Date(d.getTime());
  copy.setMonth(copy.getMonth() + Math.trunc(n));
  return copy;
}

module.exports = { addMonths };

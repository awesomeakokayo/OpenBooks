const NIGERIA_TIME_ZONE = "Africa/Lagos";

function getNigeriaDateParts(date: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: NIGERIA_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return {
    year: Number(values.year),
    month: Number(values.month),
    day: Number(values.day),
  };
}

/**
 * Return the UTC instant corresponding to midnight in Nigeria (UTC+1).
 * Nigeria does not currently observe daylight saving time.
 */
function nigeriaMidnightUtc(year: number, month: number, day: number) {
  return new Date(Date.UTC(year, month - 1, day, 0, 0, 0) - 60 * 60 * 1000);
}

export function getNigeriaReportPeriods(now = new Date()) {
  const current = getNigeriaDateParts(now);
  const startOfDay = nigeriaMidnightUtc(current.year, current.month, current.day);

  const dateAtNoonUtc = new Date(Date.UTC(current.year, current.month - 1, current.day, 12, 0, 0));
  const weekday = dateAtNoonUtc.getUTCDay();
  const daysSinceMonday = weekday === 0 ? 6 : weekday - 1;
  const monday = new Date(dateAtNoonUtc);
  monday.setUTCDate(monday.getUTCDate() - daysSinceMonday);
  const startOfWeek = nigeriaMidnightUtc(
    monday.getUTCFullYear(),
    monday.getUTCMonth() + 1,
    monday.getUTCDate()
  );

  const startOfMonth = nigeriaMidnightUtc(current.year, current.month, 1);

  return { startOfDay, startOfWeek, startOfMonth };
}

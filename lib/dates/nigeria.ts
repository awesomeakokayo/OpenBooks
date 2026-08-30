const NIGERIA_OFFSET = "+01:00";

/**
 * Convert a date-only form value (YYYY-MM-DD) into the UTC instant for
 * midnight in Nigeria. Datetime strings with an explicit offset are parsed
 * normally.
 */
export function parseNigeriaDateInput(value: string): Date {
  const trimmed = value.trim();
  if (!trimmed) throw new Error("Date is required");

  const iso = /^\d{4}-\d{2}-\d{2}$/.test(trimmed)
    ? `${trimmed}T00:00:00${NIGERIA_OFFSET}`
    : trimmed;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) throw new Error("Invalid date");
  return date;
}

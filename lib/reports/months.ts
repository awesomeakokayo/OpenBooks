import { prisma } from "@/lib/db/prisma";

const NIGERIA_TIME_ZONE = "Africa/Lagos";

function getNigeriaDateParts(date: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: NIGERIA_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return { year: Number(values.year), month: Number(values.month) };
}

function nigeriaMidnightUtc(year: number, month: number, day: number) {
  return new Date(Date.UTC(year, month - 1, day, 0, 0, 0) - 60 * 60 * 1000);
}

export function getCurrentNigeriaMonthKey(now = new Date()) {
  const { year, month } = getNigeriaDateParts(now);
  return `${year}-${String(month).padStart(2, "0")}`;
}

export function getNigeriaMonthRange(monthKey: string, fallback = new Date()) {
  const match = /^(\d{4})-(\d{2})$/.exec(monthKey);
  if (!match) return getNigeriaMonthRange(getCurrentNigeriaMonthKey(fallback), fallback);

  const year = Number(match[1]);
  const month = Number(match[2]);
  if (month < 1 || month > 12 || year < 2000 || year > 2200) {
    return getNigeriaMonthRange(getCurrentNigeriaMonthKey(fallback), fallback);
  }

  const start = nigeriaMidnightUtc(year, month, 1);
  const nextMonth = month === 12 ? { year: year + 1, month: 1 } : { year, month: month + 1 };
  const end = nigeriaMidnightUtc(nextMonth.year, nextMonth.month, 1);
  return { start, end, key: `${year}-${String(month).padStart(2, "0")}` };
}

export function formatMonthKey(monthKey: string) {
  const match = /^(\d{4})-(\d{2})$/.exec(monthKey);
  const key = match ? monthKey : getCurrentNigeriaMonthKey();
  const [year, month] = key.split("-").map(Number);
  return new Intl.DateTimeFormat("en-NG", { month: "long", year: "numeric", timeZone: NIGERIA_TIME_ZONE }).format(
    new Date(Date.UTC(year, month - 1, 15, 12))
  );
}

function monthCursor(startKey: string, endKey: string) {
  const [startYear, startMonth] = startKey.split("-").map(Number);
  const [endYear, endMonth] = endKey.split("-").map(Number);
  const months: string[] = [];
  let year = endYear;
  let month = endMonth;

  while (year > startYear || (year === startYear && month >= startMonth)) {
    months.push(`${year}-${String(month).padStart(2, "0")}`);
    month -= 1;
    if (month === 0) {
      month = 12;
      year -= 1;
    }
  }
  return months;
}

export async function getBusinessMonthOptions(businessId: string, now = new Date()) {
  const currentKey = getCurrentNigeriaMonthKey(now);
  const [saleBounds, paymentBounds] = await Promise.all([
    prisma.sale.aggregate({ where: { businessId }, _min: { saleDate: true } }),
    prisma.payment.aggregate({ where: { businessId, status: "SUCCESS" }, _min: { createdAt: true } }),
  ]);

  const dates = [saleBounds._min.saleDate, paymentBounds._min.createdAt].filter((date): date is Date => Boolean(date));
  if (dates.length === 0) return [currentKey];

  const earliest = dates.reduce((oldest, date) => (date < oldest ? date : oldest), dates[0]);
  const earliestParts = getNigeriaDateParts(earliest);
  const earliestKey = `${earliestParts.year}-${String(earliestParts.month).padStart(2, "0")}`;
  return monthCursor(earliestKey, currentKey);
}

export function normalizeMonthSelection(monthKey: string | undefined, options: string[], now = new Date()) {
  const currentKey = getCurrentNigeriaMonthKey(now);
  if (!monthKey) return currentKey;
  return options.includes(monthKey) ? monthKey : currentKey;
}

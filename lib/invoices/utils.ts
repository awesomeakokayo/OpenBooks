import { randomBytes } from "crypto";

/**
 * Generate a cryptographically random public token for invoices.
 * 32 chars hex (16 bytes) — unpredictable, not sequential.
 */
export function generatePublicToken(): string {
  return randomBytes(16).toString("hex");
}

/** Convert a decimal amount to the smallest NGN unit (kobo) safely. */
export function nairaToKobo(naira: number): number {
  if (!Number.isFinite(naira)) return 0;
  return Math.round((naira + Number.EPSILON) * 100);
}

/** Convert kobo back to naira. */
export function koboToNaira(kobo: number): number {
  return kobo / 100;
}

/** Round a money value to exactly two decimal places without float drift. */
export function roundMoney(amount: number): number {
  if (!Number.isFinite(amount)) return 0;
  return nairaToKobo(amount) / 100;
}

/** Calculate one invoice line using kobo arithmetic, then return naira. */
export function calculateLineTotal(quantity: number, unitPrice: number): number {
  if (!Number.isFinite(quantity) || !Number.isFinite(unitPrice)) return 0;
  const lineKobo = Math.round((quantity * unitPrice + Number.EPSILON) * 100);
  return lineKobo / 100;
}

/**
 * Calculate invoice totals server-side — never trust client total.
 * Each line is rounded to kobo before subtotaling so values never drift by
 * fractions of a kobo when JavaScript floating-point arithmetic is involved.
 */
export function calculateInvoiceTotal(
  items: { quantity: number; unitPrice: number }[],
  discount = 0
): { subtotal: number; total: number } {
  const subtotalKobo = items.reduce(
    (sum, item) => sum + nairaToKobo(calculateLineTotal(item.quantity, item.unitPrice)),
    0
  );
  const discountKobo = nairaToKobo(discount);
  const totalKobo = Math.max(0, subtotalKobo - discountKobo);
  return { subtotal: subtotalKobo / 100, total: totalKobo / 100 };
}

export function formatNaira(amount: number | string): string {
  const n = roundMoney(typeof amount === "string" ? Number(amount) : amount);
  return `₦${n.toLocaleString("en-NG", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

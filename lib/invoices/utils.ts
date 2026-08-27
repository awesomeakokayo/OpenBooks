import { randomBytes } from "crypto";

/**
 * Generate a cryptographically random public token for invoices.
 * 32 chars hex (16 bytes) — unpredictable, not sequential.
 */
export function generatePublicToken(): string {
  return randomBytes(16).toString("hex");
}

/**
 * Calculate invoice totals server-side — never trust client total.
 */
export function calculateInvoiceTotal(
  items: { quantity: number; unitPrice: number }[],
  discount = 0
): { subtotal: number; total: number } {
  const subtotal = items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);
  const total = Math.max(0, subtotal - discount);
  return { subtotal, total };
}

export function nairaToKobo(naira: number): number {
  return Math.round(naira * 100);
}

export function koboToNaira(kobo: number): number {
  return kobo / 100;
}

export function formatNaira(amount: number | string): string {
  const n = typeof amount === "string" ? parseFloat(amount) : amount;
  return `₦${n.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

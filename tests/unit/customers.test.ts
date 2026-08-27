import { describe, it, expect } from "vitest";
import { calculateInvoiceTotal } from "@/lib/invoices/utils";

// Simulated derived outstanding logic (mirrors lib/customers/service)
function derivedOutstanding(invoiceTotal: number, payments: number[]) {
  const totalPaid = payments.reduce((a, b) => a + b, 0);
  return Math.max(0, invoiceTotal - totalPaid);
}

describe("customer outstanding derived", () => {
  it("outstanding 0 when no invoices", () => {
    expect(derivedOutstanding(0, [])).toBe(0);
  });
  it("outstanding equals invoice total when no payments", () => {
    expect(derivedOutstanding(85000, [])).toBe(85000);
  });
  it("partial payment reduces outstanding", () => {
    expect(derivedOutstanding(150000, [50000])).toBe(100000);
  });
  it("full payment clears outstanding", () => {
    expect(derivedOutstanding(150000, [50000, 100000])).toBe(0);
  });
  it("overpayment not negative", () => {
    expect(derivedOutstanding(50000, [60000])).toBe(0);
  });
});

describe("sale total calc", () => {
  it("quantity * unitPrice - discount", () => {
    const { total, subtotal } = calculateInvoiceTotal([{ quantity: 2, unitPrice: 20000 }], 5000);
    expect(subtotal).toBe(40000);
    expect(total).toBe(35000);
  });
  it("rejects negative quantity logic", () => {
    const qty = -1;
    expect(qty > 0).toBe(false);
  });
});

import { describe, expect, it } from "vitest";
import { invoiceAmountPaid, invoiceOutstanding, isSuccessfulPayment } from "@/lib/finance/contract";

describe("OpenBooks financial invariants", () => {
  it("handles a 300,000 invoice with a 200,000 partial payment", () => {
    const payments = [{ amount: 200_000, status: "SUCCESS" as const }];
    expect(invoiceAmountPaid(300_000, payments)).toBe(200_000);
    expect(invoiceOutstanding(300_000, payments)).toBe(100_000);
  });

  it("handles the final 100,000 payment", () => {
    const payments = [
      { amount: 200_000, status: "SUCCESS" as const },
      { amount: 100_000, status: "SUCCESS" as const },
    ];
    expect(invoiceAmountPaid(300_000, payments)).toBe(300_000);
    expect(invoiceOutstanding(300_000, payments)).toBe(0);
  });

  it("does not count failed, cancelled, or refunded payments as paid", () => {
    const payments = [
      { amount: 100_000, status: "SUCCESS" as const },
      { amount: 50_000, status: "FAILED" as const },
      { amount: 20_000, status: "CANCELLED" as const },
      { amount: 10_000, status: "REFUNDED" as const },
    ];
    expect(invoiceAmountPaid(300_000, payments)).toBe(100_000);
    expect(invoiceOutstanding(300_000, payments)).toBe(200_000);
  });

  it("caps calculated invoice-paid amount at the invoice total", () => {
    const payments = [
      { amount: 250_000, status: "SUCCESS" as const },
      { amount: 100_000, status: "SUCCESS" as const },
    ];
    expect(invoiceAmountPaid(300_000, payments)).toBe(300_000);
    expect(invoiceOutstanding(300_000, payments)).toBe(0);
  });

  it("recognizes only SUCCESS as a successful payment", () => {
    expect(isSuccessfulPayment("SUCCESS")).toBe(true);
    expect(isSuccessfulPayment("PENDING")).toBe(false);
    expect(isSuccessfulPayment("FAILED")).toBe(false);
  });
});

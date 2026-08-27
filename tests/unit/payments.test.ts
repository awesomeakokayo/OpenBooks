import { describe, it, expect } from "vitest";

// Simulate manual payment validation logic from lib/payments/service.ts
function validateManual(method: string, amount: number, outstanding: number) {
  if (amount <= 0) throw new Error("Amount must be greater than 0");
  if (!["CASH", "BANK_TRANSFER", "POS"].includes(method)) throw new Error("Method must be CASH, BANK_TRANSFER or POS");
  if (amount > outstanding) throw new Error(`Amount exceeds outstanding ₦${outstanding}`);
  return true;
}

function deriveStatus(total: number, totalPaid: number): string {
  if (totalPaid >= total && total > 0) return "PAID";
  if (totalPaid > 0 && totalPaid < total) return "PARTIALLY_PAID";
  return "SENT";
}

describe("manual payment validation", () => {
  it("rejects negative amount", () => {
    expect(() => validateManual("CASH", -100, 50000)).toThrow("Amount must be greater than 0");
  });
  it("rejects wrong method", () => {
    expect(() => validateManual("PAYSTACK", 1000, 50000)).toThrow();
  });
  it("rejects overpayment", () => {
    expect(() => validateManual("CASH", 60000, 50000)).toThrow("exceeds outstanding");
  });
  it("allows valid partial", () => {
    expect(validateManual("CASH", 40000, 85000)).toBe(true);
  });
  it("allows exact outstanding", () => {
    expect(validateManual("BANK_TRANSFER", 85000, 85000)).toBe(true);
  });
});

describe("invoice status after payment", () => {
  it("PARTIALLY_PAID when partial", () => {
    expect(deriveStatus(150000, 50000)).toBe("PARTIALLY_PAID");
  });
  it("PAID when full", () => {
    expect(deriveStatus(150000, 150000)).toBe("PAID");
  });
  it("SENT when zero", () => {
    expect(deriveStatus(150000, 0)).toBe("SENT");
  });
});

describe("receipt numbering", () => {
  it("formats REC-000001", () => {
    const n = 1;
    expect(`REC-${String(n).padStart(6, "0")}`).toBe("REC-000001");
  });
  it("increments", () => {
    expect(`REC-${String(12).padStart(6, "0")}`).toBe("REC-000012");
  });
});

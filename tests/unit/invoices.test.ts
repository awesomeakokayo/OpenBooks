import { describe, it, expect } from "vitest";
import {
  calculateInvoiceTotal,
  generatePublicToken,
  nairaToKobo,
  koboToNaira,
} from "@/lib/invoices/utils";
import { z } from "zod";
import { customerSchema } from "@/lib/validation/schemas";

describe("calculateInvoiceTotal", () => {
  it("sums line items", () => {
    const { subtotal, total } = calculateInvoiceTotal([
      { quantity: 2, unitPrice: 50000 },
      { quantity: 1, unitPrice: 30000 },
    ]);
    expect(subtotal).toBe(130000);
    expect(total).toBe(130000);
  });

  it("applies discount", () => {
    const { total } = calculateInvoiceTotal([{ quantity: 1, unitPrice: 85000 }], 5000);
    expect(total).toBe(80000);
  });

  it("never negative", () => {
    const { total } = calculateInvoiceTotal([{ quantity: 1, unitPrice: 1000 }], 5000);
    expect(total).toBe(0);
  });

  it("handles decimals correctly", () => {
    const { subtotal } = calculateInvoiceTotal([{ quantity: 1.5, unitPrice: 33333.33 }]);
    expect(subtotal).toBeCloseTo(49999.995);
  });
});

describe("generatePublicToken", () => {
  it("is 32 hex chars and unpredictable", () => {
    const a = generatePublicToken();
    const b = generatePublicToken();
    expect(a).toHaveLength(32);
    expect(a).not.toBe(b);
    expect(a).toMatch(/^[a-f0-9]{32}$/);
  });
});

describe("kobo conversion", () => {
  it("naira to kobo and back", () => {
    expect(nairaToKobo(85000)).toBe(8500000);
    expect(koboToNaira(8500000)).toBe(85000);
    expect(koboToNaira(nairaToKobo(123.45))).toBeCloseTo(123.45);
  });
});

describe("validation", () => {
  it("rejects negative amount via zod", () => {
    const schema = z.number().positive();
    expect(() => schema.parse(-100)).toThrow();
  });

  it("rejects invalid customer", () => {
    expect(() => customerSchema.parse({ name: "", phone: "" })).toThrow();
  });
});

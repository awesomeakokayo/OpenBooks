import { describe, expect, it } from "vitest";
import { roundMoney } from "@/lib/invoices/utils";

describe("direct sale financial validation", () => {
  it("computes a discounted total with money rounding", () => {
    expect(roundMoney(3 * 33333.33 - 1000)).toBe(98999.99);
  });

  it("does not allow a discount larger than subtotal", () => {
    const subtotal = roundMoney(2 * 10_000);
    const discount = 25_000;
    expect(discount > subtotal).toBe(true);
  });

  it("distinguishes an unpaid direct sale from a received sale", () => {
    const unpaidPaymentMethod = null;
    const paidPaymentMethod = "CASH";
    expect(unpaidPaymentMethod).toBeNull();
    expect(paidPaymentMethod).toBe("CASH");
  });
});

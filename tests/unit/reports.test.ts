import { describe, it, expect } from "vitest";

function net(sales: number, expenses: number) {
  return sales - expenses;
}

describe("reports net", () => {
  it("sales - expenses", () => {
    expect(net(184500, 50000)).toBe(134500);
  });
  it("negative net when expenses exceed", () => {
    expect(net(10000, 20000)).toBe(-10000);
  });
});

describe("expenses grouping", () => {
  it("sums by category", () => {
    const expenses = [
      { category: "TRANSPORT", amount: 5000 },
      { category: "TRANSPORT", amount: 3000 },
      { category: "DATA", amount: 2000 },
    ];
    const byCat = expenses.reduce((acc: Record<string, number>, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount;
      return acc;
    }, {});
    expect(byCat["TRANSPORT"]).toBe(8000);
    expect(byCat["DATA"]).toBe(2000);
  });
});

describe("payments breakdown", () => {
  it("groups by method", () => {
    const payments = [
      { method: "CASH", amount: 10000 },
      { method: "BANK_TRANSFER", amount: 20000 },
      { method: "CASH", amount: 5000 },
    ];
    const grouped = payments.reduce((acc: Record<string, number>, p) => {
      acc[p.method] = (acc[p.method] || 0) + p.amount;
      return acc;
    }, {});
    expect(grouped["CASH"]).toBe(15000);
    expect(grouped["BANK_TRANSFER"]).toBe(20000);
  });
});

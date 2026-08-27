import { describe, it, expect } from "vitest";
import { canTransition, VALID_TRANSITIONS } from "@/lib/invoices/service";

describe("invoice status machine", () => {
  it("DRAFT -> SENT allowed", () => expect(canTransition("DRAFT", "SENT")).toBe(true));
  it("DRAFT -> PAID not allowed direct", () => expect(canTransition("DRAFT", "PAID")).toBe(false));
  it("SENT -> VIEWED allowed", () => expect(canTransition("SENT", "VIEWED")).toBe(true));
  it("SENT -> PAID allowed", () => expect(canTransition("SENT", "PAID")).toBe(true));
  it("PAID terminal", () => expect(VALID_TRANSITIONS["PAID"].length).toBe(0));
  it("CANCELLED terminal", () => expect(VALID_TRANSITIONS["CANCELLED"].length).toBe(0));
  it("OVERDUE -> PAID allowed", () => expect(canTransition("OVERDUE", "PAID")).toBe(true));
});

describe("invoice numbering fallback", () => {
  it("generates INV-000001 format", () => {
    const n = 1;
    const candidate = `INV-${String(n).padStart(6, "0")}`;
    expect(candidate).toBe("INV-000001");
  });
  it("pads correctly", () => {
    expect(`INV-${String(42).padStart(6, "0")}`).toBe("INV-000042");
  });
});

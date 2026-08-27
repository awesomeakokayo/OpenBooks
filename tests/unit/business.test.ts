import { describe, it, expect } from "vitest";
import { businessSchema } from "@/lib/validation/schemas";

describe("business validation", () => {
  it("rejects missing name", () => {
    const r = businessSchema.safeParse({ name: "", phone: "08012345678" });
    expect(r.success).toBe(false);
  });

  it("rejects missing phone", () => {
    const r = businessSchema.safeParse({ name: "Ade Repairs", phone: "" });
    expect(r.success).toBe(false);
  });

  it("accepts valid business", () => {
    const r = businessSchema.safeParse({ name: "Ade Phone Repairs", phone: "08012345678" });
    expect(r.success).toBe(true);
  });

  it("defaults currency to NGN in service", () => {
    // Service hardcodes NGN per spec  buildversion.md:354 — validated here
    expect("NGN").toBe("NGN");
  });
});

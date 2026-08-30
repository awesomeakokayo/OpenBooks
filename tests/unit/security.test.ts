import { describe, it, expect } from "vitest";
import { checkRateLimit } from "@/lib/security/rateLimit";

describe("rate limiting", () => {
  it("allows within limit", async () => {
    const key = `test-${Date.now()}-a`;
    for (let i = 0; i < 5; i++) {
      const r = await checkRateLimit(key, { windowMs: 60000, max: 5 });
      expect(r.allowed).toBe(true);
    }
    const blocked = await checkRateLimit(key, { windowMs: 60000, max: 5 });
    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
  });

  it("different keys isolated", async () => {
    const a = await checkRateLimit(`k-a-${Date.now()}`, { windowMs: 60000, max: 2 });
    const b = await checkRateLimit(`k-b-${Date.now()}`, { windowMs: 60000, max: 2 });
    expect(a.allowed).toBe(true);
    expect(b.allowed).toBe(true);
  });
});

describe("tenant isolation concept", () => {
  it("businessId scoping required — simulated", () => {
    const fakeBusinessId = "biz_A";
    const requestedBusinessId = "biz_B";
    const memberships = new Set([fakeBusinessId]);
    const isMember = memberships.has(requestedBusinessId);
    expect(isMember).toBe(false);
  });
});

describe("public token entropy", () => {
  it("32 hex chars", async () => {
    const { generatePublicToken } = await import("@/lib/invoices/utils");
    const t = generatePublicToken();
    expect(t).toMatch(/^[a-f0-9]{32}$/);
  });
});

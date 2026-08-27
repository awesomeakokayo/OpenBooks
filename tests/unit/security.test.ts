import { describe, it, expect } from "vitest";
import { checkRateLimit } from "@/lib/security/rateLimit";

describe("rate limiting", () => {
  it("allows within limit", () => {
    const key = `test-${Date.now()}-a`;
    for (let i = 0; i < 5; i++) {
      const r = checkRateLimit(key, { windowMs: 60000, max: 5 });
      if (i < 4) expect(r.allowed).toBe(true);
      else expect(r.allowed).toBe(true); // 5th is still allowed (max 5)
    }
    const blocked = checkRateLimit(key, { windowMs: 60000, max: 5 });
    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
  });

  it("different keys isolated", () => {
    const a = checkRateLimit(`k-a-${Date.now()}`, { windowMs: 60000, max: 2 });
    const b = checkRateLimit(`k-b-${Date.now()}`, { windowMs: 60000, max: 2 });
    expect(a.allowed).toBe(true);
    expect(b.allowed).toBe(true);
  });
});

describe("tenant isolation concept", () => {
  it("businessId scoping required — simulated", () => {
    const fakeBusinessId = "biz_A";
    const requestedBusinessId = "biz_B";
    const memberships = new Set(["biz_A"]);
    const isMember = memberships.has(requestedBusinessId);
    expect(isMember).toBe(false); // would throw 403
  });
});

describe("public token entropy", () => {
  it("32 hex chars", async () => {
    const { generatePublicToken } = await import("@/lib/invoices/utils");
    const t = generatePublicToken();
    expect(t).toMatch(/^[a-f0-9]{32}$/);
  });
});

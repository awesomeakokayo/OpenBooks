import { describe, expect, it } from "vitest";
import { checkRateLimit, getRateLimitForPath, LIMITS } from "@/lib/security/rateLimit";

describe("OpenBooks rate limiting", () => {
  it("uses stricter limits for sensitive endpoints", () => {
    expect(getRateLimitForPath("/api/register")).toEqual(LIMITS.register);
    expect(getRateLimitForPath("/api/password-reset/request")).toEqual(LIMITS.passwordReset);
    expect(getRateLimitForPath("/api/verify-email")).toEqual(LIMITS.verifyEmail);
    expect(getRateLimitForPath("/api/auth/signin")).toEqual(LIMITS.auth);
    expect(getRateLimitForPath("/api/customers")).toEqual(LIMITS.api);
    expect(getRateLimitForPath("/invoice/abc123")).toEqual(LIMITS.publicInvoice);
  });

  it("blocks requests after the configured maximum in the local fallback", async () => {
    const key = `test-${Date.now()}-${Math.random()}`;
    const opts = { windowMs: 60_000, max: 2 } as const;

    const first = await checkRateLimit(key, opts);
    const second = await checkRateLimit(key, opts);
    const third = await checkRateLimit(key, opts);

    expect(first.allowed).toBe(true);
    expect(first.remaining).toBe(1);
    expect(second.allowed).toBe(true);
    expect(second.remaining).toBe(0);
    expect(third.allowed).toBe(false);
    expect(third.remaining).toBe(0);
  });
});

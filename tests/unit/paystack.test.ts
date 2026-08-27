import { describe, it, expect } from "vitest";
import crypto from "crypto";

// Mirror logic from lib/paystack/client verifyWebhookSignature
function verifySig(secret: string, body: string, sig: string | null) {
  if (!sig) return false;
  const hash = crypto.createHmac("sha512", secret).update(body).digest("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(sig));
  } catch {
    return false;
  }
}

function nairaToKobo(n: number) {
  return Math.round(n * 100);
}

describe("paystack signature", () => {
  it("valid signature passes", () => {
    const secret = "sk_test_123";
    const body = JSON.stringify({ event: "charge.success", data: { reference: "OB_123" } });
    const sig = crypto.createHmac("sha512", secret).update(body).digest("hex");
    expect(verifySig(secret, body, sig)).toBe(true);
  });
  it("tampered body fails", () => {
    const secret = "sk_test_123";
    const body = JSON.stringify({ event: "charge.success" });
    const sig = crypto.createHmac("sha512", secret).update(body).digest("hex");
    expect(verifySig(secret, body + "tampered", sig)).toBe(false);
  });
  it("null signature fails", () => {
    expect(verifySig("secret", "body", null)).toBe(false);
  });
});

describe("paystack amount kobo", () => {
  it("85000 -> 8500000", () => expect(nairaToKobo(85000)).toBe(8500000));
  it("50000.50 -> 5000050", () => expect(nairaToKobo(50000.5)).toBe(5000050));
});

describe("idempotency reference", () => {
  it("duplicate providerReference should be idempotent", () => {
    const seen = new Set<string>();
    function create(reference: string) {
      if (seen.has(reference)) return false; // idempotent ack
      seen.add(reference);
      return true;
    }
    expect(create("OB_123")).toBe(true);
    expect(create("OB_123")).toBe(false);
    expect(seen.size).toBe(1);
  });
});

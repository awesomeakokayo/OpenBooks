// Simple in-memory rate limiter — suitable for V1 serverless.
// For production scale, replace store with Upstash Redis / Vercel KV.

type Bucket = { count: number; resetAt: number };

const store = new Map<string, Bucket>();

export type RateLimitOpts = {
  windowMs: number; // e.g., 60_000 for 1 minute
  max: number; // max requests per window
};

export function checkRateLimit(key: string, opts: RateLimitOpts): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const bucket = store.get(key);
  if (!bucket || now > bucket.resetAt) {
    const resetAt = now + opts.windowMs;
    store.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: opts.max - 1, resetAt };
  }
  if (bucket.count >= opts.max) {
    return { allowed: false, remaining: 0, resetAt: bucket.resetAt };
  }
  bucket.count += 1;
  return { allowed: true, remaining: opts.max - bucket.count, resetAt: bucket.resetAt };
}

// Presets per implement.md Phase 8
export const LIMITS = {
  auth: { windowMs: 60_000, max: 10 }, // 10 logins/registers per minute per IP
  paystackInit: { windowMs: 60_000, max: 20 }, // 20 initializes per minute per IP/business
  webhook: { windowMs: 60_000, max: 100 }, // generous for Paystack retries
} as const;

export function rateLimitHeaders(remaining: number, resetAt: number): Record<string, string> {
  return {
    "X-RateLimit-Remaining": String(remaining),
    "X-RateLimit-Reset": String(Math.ceil(resetAt / 1000)),
  };
}

type Bucket = { count: number; resetAt: number };

type RedisRateLimitResult = {
  allowed: boolean;
  remaining: number;
  resetAt: number;
};

const memoryStore = new Map<string, Bucket>();

export type RateLimitOpts = {
  windowMs: number;
  max: number;
};

function checkMemoryRateLimit(key: string, opts: RateLimitOpts): RedisRateLimitResult {
  const now = Date.now();
  const bucket = memoryStore.get(key);

  if (!bucket || now >= bucket.resetAt) {
    const resetAt = now + opts.windowMs;
    memoryStore.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: Math.max(opts.max - 1, 0), resetAt };
  }

  if (bucket.count >= opts.max) {
    return { allowed: false, remaining: 0, resetAt: bucket.resetAt };
  }

  bucket.count += 1;
  return { allowed: true, remaining: Math.max(opts.max - bucket.count, 0), resetAt: bucket.resetAt };
}

function getRedisConfig() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  return url && token ? { url: url.replace(/\/$/, ""), token } : null;
}

async function checkRedisRateLimit(key: string, opts: RateLimitOpts): Promise<RedisRateLimitResult | null> {
  const redis = getRedisConfig();
  if (!redis) return null;

  const windowSeconds = Math.max(Math.ceil(opts.windowMs / 1000), 1);
  const windowId = Math.floor(Date.now() / opts.windowMs);
  const redisKey = `openbooks:ratelimit:${key}:${windowId}`;

  try {
    // Upstash transactions execute the increment and expiry atomically.
    // This keeps the counter shared across Vercel/Pxxl instances instead of
    // depending on one serverless instance's memory.
    const response = await fetch(`${redis.url}/multi-exec`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${redis.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify([
        ["INCR", redisKey],
        ["EXPIRE", redisKey, windowSeconds],
      ]),
      cache: "no-store",
    });

    if (!response.ok) return null;

    const result = (await response.json()) as Array<{ result?: number | string; error?: string }>;
    const count = Number(result?.[0]?.result);
    if (!Number.isFinite(count)) return null;

    const now = Date.now();
    const resetAt = (windowId + 1) * opts.windowMs;
    return {
      allowed: count <= opts.max,
      remaining: Math.max(opts.max - count, 0),
      resetAt: Math.max(resetAt, now + 1),
    };
  } catch {
    // Rate limiting must not take the application down if the limiter itself
    // is temporarily unavailable. Fall back to a local per-instance guard.
    return null;
  }
}

export async function checkRateLimit(key: string, opts: RateLimitOpts): Promise<RedisRateLimitResult> {
  const distributed = await checkRedisRateLimit(key, opts);
  return distributed ?? checkMemoryRateLimit(key, opts);
}

export const LIMITS = {
  api: { windowMs: 60_000, max: 120 },
  auth: { windowMs: 60_000, max: 30 },
  register: { windowMs: 10 * 60_000, max: 5 },
  verifyEmail: { windowMs: 15 * 60_000, max: 10 },
  passwordReset: { windowMs: 15 * 60_000, max: 5 },
  publicInvoice: { windowMs: 60_000, max: 60 },
  paystackInit: { windowMs: 60_000, max: 20 },
  webhook: { windowMs: 60_000, max: 100 },
} as const;

export function getClientIdentifier(request: { headers: Headers }): string {
  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;

  const cfIp = request.headers.get("cf-connecting-ip")?.trim();
  if (cfIp) return cfIp;

  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  if (forwarded) return forwarded;

  return "unknown";
}

export function getRateLimitForPath(pathname: string): RateLimitOpts | null {
  if (pathname === "/api/register" || pathname.startsWith("/api/register/")) return LIMITS.register;
  if (pathname === "/api/verify-email" || pathname.startsWith("/api/verify-email/")) return LIMITS.verifyEmail;
  if (pathname === "/api/password-reset" || pathname.startsWith("/api/password-reset/")) return LIMITS.passwordReset;
  if (pathname === "/api/auth" || pathname.startsWith("/api/auth/")) return LIMITS.auth;
  if (pathname.startsWith("/api/")) return LIMITS.api;
  if (pathname === "/invoice" || pathname.startsWith("/invoice/")) return LIMITS.publicInvoice;
  return null;
}

export function getRateLimitScope(pathname: string): string | null {
  if (pathname === "/api/register" || pathname.startsWith("/api/register/")) return "register";
  if (pathname === "/api/verify-email" || pathname.startsWith("/api/verify-email/")) return "verify-email";
  if (pathname === "/api/password-reset" || pathname.startsWith("/api/password-reset/")) return "password-reset";
  if (pathname === "/api/auth" || pathname.startsWith("/api/auth/")) return "auth";
  if (pathname.startsWith("/api/")) return "api";
  if (pathname === "/invoice" || pathname.startsWith("/invoice/")) return "public-invoice";
  return null;
}

export function rateLimitHeaders(remaining: number, resetAt: number): Record<string, string> {
  return {
    "X-RateLimit-Remaining": String(remaining),
    "X-RateLimit-Reset": String(Math.ceil(resetAt / 1000)),
    "RateLimit-Remaining": String(remaining),
    "RateLimit-Reset": String(Math.ceil(resetAt / 1000)),
  };
}

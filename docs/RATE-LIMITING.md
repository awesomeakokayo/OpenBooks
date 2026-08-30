# OpenBooks NG — Rate Limiting Strategy

## Why this exists

OpenBooks exposes authentication, recovery, public-invoice, and authenticated business APIs. These endpoints must not be allowed to receive unlimited automated traffic. Rate limiting reduces brute-force attempts, endpoint spam, accidental request storms, and the amount of application/database work a single client can cause.

## Current implementation

`lib/security/rateLimit.ts` contains the central limiter.

The limiter uses two layers:

1. **Distributed limiter — Upstash Redis**
   - Used when `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` are configured.
   - Counters live outside the application process, so limits are shared across serverless instances and across both Vercel and Pxxl deployments.
   - The counter increment and expiry are executed together with an Upstash Redis transaction.

2. **Local fallback — in-memory**
   - Used only when the Upstash variables are missing or the Redis request fails.
   - This keeps local development and a degraded production deployment usable.
   - It is **not** equivalent to distributed protection because separate serverless instances do not share memory.

Production deployments should therefore configure Upstash.

## Limits

| Scope | Limit | Purpose |
|---|---:|---|
| General `/api/*` | 120/minute | Protect normal API traffic |
| `/api/auth/*` | 30/minute | Authentication/provider flows |
| `/api/register` | 5/10 minutes | Reduce account-creation abuse |
| `/api/verify-email*` | 10/15 minutes | Protect verification attempts/resends |
| `/api/password-reset*` | 5/15 minutes | Reduce reset-email abuse |
| `/invoice/*` | 60/minute | Protect public invoice rendering |
| Future Paystack initialization | 20/minute | Reserved for future provider integration |
| Future webhook handling | 100/minute | Reserved for future provider retries |

The limits are intentionally conservative for V1 and can be tuned from the central preset without changing individual routes.

## Enforcement location

The current first line of enforcement is `proxy.ts`.

Traffic is classified by pathname before the corresponding application handler executes. Static assets are excluded. API traffic is limited by client IP when unauthenticated and by authenticated user ID when a session exists, with the IP still available as the request-level context.

When the limit is exceeded, OpenBooks returns:

- HTTP `429 Too Many Requests`
- `Retry-After`
- `X-RateLimit-Remaining`
- `X-RateLimit-Reset`
- equivalent `RateLimit-*` headers

## Important limitation

Rate limiting is a protection layer, not a complete denial-of-service solution. A large distributed attack can still overwhelm an application's provider/network before application-level middleware has a chance to run. At larger traffic levels, add the hosting provider's edge/WAF controls as a second layer.

## V1 operational setup

Both Vercel and Pxxl must receive the same two server-only Upstash variables:

```env
UPSTASH_REDIS_REST_URL="https://your-database.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your-upstash-rest-token"
```

Do not expose either variable to client-side code and do not prefix them with `NEXT_PUBLIC_`.

## Testing checklist

- Repeated registration requests eventually return 429.
- Repeated password-reset requests eventually return 429.
- Repeated verification requests eventually return 429.
- Normal authenticated API traffic remains usable below the configured ceiling.
- Limits reset after the window expires.
- Vercel and Pxxl share the same counters when connected to the same Upstash database.
- Removing the Upstash configuration still leaves the in-memory development fallback instead of crashing the application.

## Future hardening

- Add route-specific limits to high-cost handlers that become expensive as features grow.
- Add abuse monitoring/alerting for repeated 429 responses.
- Add hosting-layer WAF/bot controls on the production domains.
- Consider a sliding-window or token-bucket algorithm when traffic patterns require more precision than the V1 fixed-window implementation.

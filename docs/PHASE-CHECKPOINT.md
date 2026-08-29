# OpenBooks NG — Current Build Checkpoint

**Current phase:** Phase 1 — Identity and onboarding
**Implementation status:** Phase 1 implementation substantially complete; runtime exit tests pending operator configuration and local verification.

## Completed
- Authoritative V1 implementation plan added.
- Paystack marked as deferred from V1 in the implementation plan and environment contract.
- Resend email provider boundary added.
- Resend SDK dependency added.
- Email verification token generation and verification email template added.
- Credential registration creates a verification token and sends the verification email.
- Credential registration redirects the user to the verification screen instead of signing them in immediately.
- Verification result page and resend flow added.
- Verification endpoint has token expiry, token deletion, transaction-safe user verification, rate limiting, and non-sensitive error logging.
- Credentials sign-in requires `emailVerified` before authentication succeeds.
- Google and GitHub signup/sign-in controls are present in the auth UI.
- OAuth policy explicitly avoids automatic email-based account linking.
- OAuth authentication errors have a safe dedicated user-facing page.
- Forgot-password and password-reset flow implemented with expiring single-use tokens and session invalidation after reset.
- Business creation accepts V1 payment setup and persists business + membership + payment settings atomically.
- Business onboarding is a two-step flow: business identity, then payment methods.
- V1 payment onboarding supports Bank Transfer, Cash and POS only.
- Bank transfer onboarding requires bank name, account name and a 10-digit account number.
- Payment settings API validates V1 payment methods and forcibly keeps Paystack disabled.
- Business onboarding explains that bank details are displayed to customers and funds are never held by OpenBooks.
- Authentication/recovery/public-route protection was audited and `proxy.ts` now allows registration, verification, password recovery, auth errors and public invoice routes without authentication.
- Deferred Paystack public route exposure was removed from the public proxy allow-list.
- Phase 1 exit-test matrix added at `docs/PHASE-1-EXIT-TESTS.md`.
- Auth proxy now bypasses file-like static asset paths so public images, SVGs and other assets cannot be redirected to `/login`.
- Vercel build now runs `prisma generate && prisma db push` before `next build` so the production database is synchronized with the current Prisma schema, including Auth.js tables required for OAuth.

## Remaining before Phase 1 can be declared release-ready
- Configure and test Resend with a real verified sending domain/API key.
- Configure and test Google OAuth with the documented callback URL.
- Configure and test GitHub OAuth with the documented callback URL.
- Run all Phase 1 exit tests in `docs/PHASE-1-EXIT-TESTS.md`.
- Perform final accessibility/UX review of authentication and onboarding screens.
- Verify that protected business APIs consistently enforce tenant membership and do not leak records across businesses.
- Complete a focused manual-payment audit before Phase 2 relies on the payment model.

## Production issues addressed in this checkpoint
- Production previously failed with `TypeError: Invalid URL` because a production URL value lacked the `https://` protocol; the operator corrected `AUTH_URL`/`APP_URL` accordingly.
- Production Google/GitHub OAuth requests then failed because the Prisma adapter queried `public.accounts`, which did not exist in the production database. The Vercel build now synchronizes the Prisma schema before the Next.js build.
- The hero image was present in `public/openbooks-market-woman.webp`, but `proxy.ts` was intercepting the static asset request and redirecting it to `/login`; the proxy now explicitly bypasses static asset paths.

## Not started
- Customers and sales.
- Invoice engine.
- Manual payments and receipts.
- Expenses and reports.
- Production hardening.
- Paystack future integration.

## Known implementation note
Password-reset tokens currently reuse Auth.js's existing `VerificationToken` table with a dedicated `password-reset:` identifier namespace. This avoids a schema migration during the identity implementation. A dedicated password-reset token model may be introduced in a later schema cleanup if the identity system grows.

The repository still contains Paystack routes and Paystack-related Prisma fields/enums from earlier work. They are not part of the V1 feature surface. Do not expose or depend on them while implementing V1. The V1 payment-settings API explicitly forces `paystackEnabled` to false.

Business onboarding and payment setup are implemented in the existing `/create-business` flow. A duplicate standalone `/onboarding/payments` flow was removed.

## Next task
Redeploy the latest `main` branch, confirm the build completes successfully, then test the production hero asset and OAuth flow. After that, run the Phase 1 exit tests. Do not start Phase 2 until the identity/onboarding test matrix passes and the tenant/access-control audit is clean.

## Recovery rule
If later work diverges from the V1 implementation plan, stop feature work, compare the affected code with `docs/V1-IMPLEMENTATION-PLAN.md`, correct the deviation, test the corrected behaviour, and update this checkpoint before continuing.

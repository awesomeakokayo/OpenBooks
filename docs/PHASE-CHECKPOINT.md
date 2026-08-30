# OpenBooks NG — Current Build Checkpoint

**Current phase:** Phase 1 — Identity and onboarding
**Implementation status:** Phase 1 implementation substantially complete; runtime exit tests pending operator configuration and local verification.

## Completed
- Authoritative V1 implementation plan added.
- Paystack marked as deferred from V1 in the implementation plan and environment contract.
- Resend email provider boundary added.
- Email verification token generation and verification email template added.
- Credential registration creates a verification token and sends the verification email.
- Credential registration redirects the user to the verification screen instead of signing them in immediately.
- Registration requires a matching confirmation password at both client and server validation layers.
- If registration email delivery fails, the unverified account is retained so the user can use the resend verification flow instead of losing the account.
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
- Authentication/recovery/public-route protection was audited and `proxy.ts` allows registration, verification, password recovery, auth errors and public invoice routes without authentication.
- Deferred Paystack public route exposure was removed from the public proxy allow-list.
- Phase 1 exit-test matrix added at `docs/PHASE-1-EXIT-TESTS.md`.
- Auth proxy bypasses file-like static asset paths so public images, SVGs and other assets cannot be redirected to `/login`.
- Vercel build runs `prisma generate && prisma db push` before `next build` so the production database is synchronized with the current Prisma schema, including Auth.js tables required for OAuth.
- Shared authenticated workspace shell added so sidebar/header navigation persists across dashboard, customers, invoices, sales, payments, receipts, expenses, reports and business-settings routes.
- Workspace navigation determines active state from the current pathname and includes a complete mobile drawer.
- Workspace navigation now preserves its own scroll position between workspace route navigations so lower items such as Reports and Settings do not disappear after navigation.
- Workspace header spacing was increased and kept visible as part of the shared shell.
- Invoice creation supports inline customer creation without leaving the invoice workflow; the new customer is automatically added to the selector and selected for the invoice.
- Inline customer creation reuses the existing tenant-protected customer API and does not introduce a duplicate customer model or endpoint.
- Dashboard sales metrics include successful recorded payments as well as direct sales, including standalone payments not attached to an invoice.
- Dashboard invoice outstanding calculations use only invoice-linked payments, preventing standalone payments from incorrectly reducing invoice balances.
- Dashboard recent activity includes recorded payments and shows the payment method where applicable.
- Business profile information can now be edited from Business Settings through a tenant-protected PATCH endpoint and reusable form.
- V1 expense payment options no longer expose Paystack and the filled expense action buttons explicitly use readable white text.
- Guide navigation is account-aware for authenticated business users and directs them back to the dashboard instead of the public start flow.
- Authenticated users visiting the public landing page `/` are redirected to `/dashboard`; authenticated users visiting `/login` are also redirected to `/dashboard`, keeping the landing page as an entrance rather than the authenticated home.
- Public invoices display configured Bank Transfer details: bank name, account name and account number.
- Downloadable/printable invoice output includes the same Bank Transfer details when Bank Transfer is enabled.
- Public invoice and internal invoice payment-method rendering filters out deferred Paystack/online methods from the V1 user-facing surface.
- Manual payment records are used as the V1 source for dashboard sales, recent activity, sales history and reporting metrics.
- Sales history combines direct sales and successful recorded payments so View All reflects the same financial activity shown in the dashboard.
- Reports sales totals include successful recorded payments as well as direct sales.
- Invoice bank-detail rendering uses an explicit null-safe `bankDetails` object so strict TypeScript builds can compile on both Vercel and Pxxl when business payment settings are absent.
- Landing-page mobile navigation explicitly uses the Plum background and white text for all menu links and actions.

## Remaining before Phase 1 can be declared release-ready
- Configure and test Resend with a real verified sending domain/API key.
- Configure and test Google OAuth with the documented callback URL(s) for Vercel and Pxxl/custom production domain.
- Configure and test GitHub OAuth with the documented callback URL(s) for Vercel and Pxxl/custom production domain.
- Run all Phase 1 exit tests in `docs/PHASE-1-EXIT-TESTS.md`.
- Perform final accessibility/UX review of authentication and onboarding screens.
- Verify that protected business APIs consistently enforce tenant membership and do not leak records across businesses.
- Complete a focused manual-payment audit before Phase 2 relies on the payment model.
- Verify the shared workspace shell, dashboard payment metrics, reports payment metrics, editable business settings, invoice bank details, PDF output, registration flow, mobile landing navigation and landing-page authentication redirect in both Vercel and Pxxl deployments.

## Production issues addressed in this checkpoint
- Production previously failed with `TypeError: Invalid URL` because a production URL value lacked the `https://` protocol; the operator corrected `AUTH_URL`/`APP_URL` accordingly.
- Production Google/GitHub OAuth requests then failed because the Prisma adapter queried `public.accounts`, which did not exist in the production database. The Vercel build now synchronizes the Prisma schema before the Next.js build.
- The hero image was present in `public/openbooks-market-woman.webp`, but `proxy.ts` was intercepting the static asset request and redirecting it to `/login`; the proxy now explicitly bypasses static asset paths.
- The previous dashboard navigation lived only in `app/dashboard/layout.tsx`, so top-level business routes lost the workspace chrome. The shared workspace shell is now applied at each authenticated top-level route boundary.
- Pxxl previously attempted to build an older `main` snapshot where `setting` could still be narrowed as nullable inside JSX. The current invoice implementation derives a null-safe `bankDetails` object before rendering, eliminating the strict TypeScript `TS18047` error.

## Not started
- Customers and sales as a formally completed V1 phase.
- Invoice engine as a formally completed V1 phase.
- Manual payments and receipts as a formally completed V1 phase.
- Expenses and reports as a formally completed V1 phase.
- Production hardening.
- Offline/PWA implementation.
- Paystack future integration.

## Known implementation notes
- Password-reset tokens currently reuse Auth.js's existing `VerificationToken` table with a dedicated `password-reset:` identifier namespace. This avoids a schema migration during the identity implementation. A dedicated password-reset token model may be introduced in a later schema cleanup if the identity system grows.
- The repository still contains Paystack routes and Paystack-related Prisma fields/enums from earlier work. They are not part of the V1 feature surface. Do not expose or depend on them while implementing V1. The V1 payment-settings API explicitly forces `paystackEnabled` to false.
- Business onboarding and payment setup are implemented in the existing `/create-business` flow. A duplicate standalone `/onboarding/payments` flow was removed.
- The shared workspace shell is intentionally implemented through reusable components plus route-level layouts rather than moving every business page into a route group. This keeps the existing URL structure stable while giving all authenticated business sections a consistent shell.
- Dashboard "Sales" means recorded money received/recorded for the selected period: direct sales plus successful payments. Invoice outstanding is calculated separately from invoice-linked payments only.
- The V1 deployment target is provider-agnostic: the same `main` branch should build on Vercel and Pxxl. Do not introduce provider-specific application behavior unless explicitly documented and required.

## Next task
Finish the remaining Phase 1 runtime verification tasks. Do not start Phase 2 customers/sales until identity, onboarding, payment settings, dashboard payment accounting, authenticated navigation, and cross-host production builds have been exercised end-to-end and any regressions are corrected.

## Recovery rule
If later work diverges from the V1 implementation plan, stop feature work, compare the affected code with `docs/V1-IMPLEMENTATION-PLAN.md`, correct the deviation, test the corrected behaviour, and update this checkpoint before continuing.


# OpenBooks Troubleshooting

Use this before changing working code to fix a symptom. Most recurring problems fall into a small set of categories.

## Build fails after a dependency or Prisma change

Run:

~~~bash
npm install
npx prisma generate
npm run lint
npm run build
~~~

Then inspect the first real TypeScript/Next.js error rather than later cascading errors.

If the build complains about a missing Prisma export or stale generated client, regenerate Prisma before changing application code.

## Authentication fails locally

Check:

1. the local environment file exists and is loaded;
2. the database is reachable;
3. the user has a verified email for credentials login;
4. OAuth callback URLs match the local origin exactly;
5. Auth.js configuration in auth.ts and lib/auth/config.ts is consistent.

Do not paste secret values into an issue or commit.

## OAuth works locally but not in production

Check the provider dashboard first.

The production callback host/path must exactly match:

~~~text
https://www.openbooks.click/api/auth/callback/google
https://www.openbooks.click/api/auth/callback/github
~~~

Then check production deployment environment configuration and redeploy when necessary.

## Emails are not arriving

Check:

- provider/domain verification;
- sender configuration;
- server logs for the request ID;
- spam/junk mailbox;
- whether the relevant endpoint actually attempted delivery;
- whether the application has valid email configuration in the current environment.

Do not log or print verification/reset tokens.

## Payments/invoice balance looks wrong

Start from the financial contract rather than patching the page.

Read:

- docs/FINANCE.md;
- lib/finance/contract.ts;
- lib/payments/service.ts;
- lib/invoices/utils.ts.

The key rule is:

~~~text
successful invoice-linked payments
        ↓
invoice amount paid
        ↓
invoice outstanding
        ↓
invoice status
~~~

A direct Sale is independent from invoice settlement.

## Dashboard/report totals look inconsistent

Inspect:

lib/reports/months.ts

Then verify that the same reporting period and recorded-sales definition are used across the dashboard and reports.

Test Nigeria month boundaries when a mismatch appears near month-end.

## Public invoice exposes too much

Inspect:

app/api/invoice/route.ts

and the public invoice page.

Public invoice responses must contain recipient-facing information only.

Also verify that internal IDs and disabled payment details are not being returned.

## Unexpected 401/403

Check the layers in this order:

~~~text
session
  ↓
public/private route rule
  ↓
business membership
  ↓
role permission
  ↓
business-scoped query
~~~

For tenant issues, inspect:

lib/security/tenant.ts

Do not solve an authorization failure by removing the authorization check.

## Unexpected 429

Inspect:

lib/security/rateLimit.ts

Determine:

- which route bucket matched;
- whether the identifier is IP-based or user-based;
- whether distributed rate limiting is configured;
- whether a proxy/CDN is changing IP headers.

Do not simply raise the limit without understanding the traffic pattern.

## Overdue invoices are not updating

Check:

1. the Vercel cron exists;
2. the schedule in vercel.json is deployed;
3. the cron secret is configured;
4. the endpoint is receiving the expected bearer header;
5. the invoice due date is actually before the current time;
6. the invoice status is one of the eligible states.

The endpoint should fail closed when the cron secret is missing.

## SEO page is not appearing in search

Check:

- the route is included in the central public path registry;
- canonical metadata is correct;
- robots.txt is not blocking the page;
- noindex is not present;
- the page contains useful visible content;
- the sitemap contains the URL;
- important internal links point to the page.

See SEO.md.

## Git conflict or codebase drift

Before choosing a merge direction:

1. inspect current main;
2. read PHASE-CHECKPOINT.md;
3. inspect V1-IMPLEMENTATION-PLAN.md;
4. compare affected files;
5. preserve the latest verified invariants;
6. rerun tests/build.

Never assume an old branch still represents the current architecture.

## Production incident

Preserve evidence first:

- deployment identifier;
- failing URL/route;
- request ID;
- timestamp;
- error class/message;
- database migration state;
- recent commit.

Do not copy secrets, auth headers or private customer records into incident notes.

Then choose the smallest safe remediation and update this document when a recurring failure mode is discovered.

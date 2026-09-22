
# OpenBooks Deployment

## Production platform

OpenBooks is configured for Vercel.

Canonical production site:

https://www.openbooks.click

Build configuration is defined in:

- vercel.json
- package.json
- next.config.ts

## Build

The configured build command is:

~~~text
prisma generate && next build
~~~

The application uses Next.js with the App Router.

## Release flow

A safe release should follow this sequence:

~~~text
change
  ↓
tests/lint
  ↓
production build
  ↓
review diff
  ↓
merge to main
  ↓
Vercel deployment
  ↓
smoke test production
~~~

## Pre-release checklist

### Code

- unit/security tests pass;
- production build passes;
- no debug logging or temporary bypasses remain;
- no real secrets were added to the repository;
- database changes include the required migration work;
- auth/authorization changes have regression coverage.

### Authentication

Verify:

- credentials login;
- email verification;
- password recovery;
- Google OAuth when configured;
- GitHub OAuth when configured;
- logout/session behavior.

Production OAuth callbacks are:

~~~text
Google:
https://www.openbooks.click/api/auth/callback/google

GitHub:
https://www.openbooks.click/api/auth/callback/github
~~~

Provider dashboards must use the exact configured callback path and canonical host.

### Financial workflows

Smoke test:

1. create/select a business;
2. create a customer;
3. create an invoice;
4. record no payment;
5. record a partial payment;
6. record the final payment;
7. inspect invoice status;
8. inspect receipt;
9. inspect customer outstanding;
10. inspect dashboard/report totals;
11. test a direct sale separately.

### Public invoice

Verify that a public invoice:

- opens without an authenticated workspace session;
- does not expose internal IDs unnecessarily;
- shows only enabled payment methods/details;
- reflects payment status correctly;
- does not become publicly indexable.

### SEO surface

Verify:

- /robots.txt;
- /sitemap.xml;
- canonical URLs;
- public route metadata;
- important public pages render without authentication.

See SEO.md.

## Cron

Vercel invokes:

GET /api/cron/overdue

Schedule:

0 2 * * *

The route requires its configured bearer secret and fails closed when that configuration is missing.

The job marks eligible overdue invoices as OVERDUE.

## Environment configuration

Production secrets are configured in the deployment platform, not in Git.

See ENVIRONMENT.md.

## Domain/host rules

The canonical production origin is the www hostname.

When integrating OAuth, email callbacks, webhooks or external redirects:

- use the canonical production host;
- do not silently mix temporary deployment URLs into provider configuration;
- keep localhost callbacks for local testing separate from production callbacks.

## Deployment verification

After a deployment:

~~~text
HTTP response
  ↓
homepage/public pages
  ↓
auth
  ↓
business onboarding
  ↓
customer
  ↓
invoice
  ↓
payment
  ↓
receipt
  ↓
reports
~~~

For a financial application, a green deployment build alone is not a sufficient release signal.

## Rollback

Use the deployment platform's previous known-good deployment when a release introduces a production regression.

Then:

1. preserve the failing release reference;
2. identify whether the problem is code, schema, environment, or provider configuration;
3. restore/revert the smallest necessary change;
4. verify the financial/auth flows again;
5. update TROUBLESHOOTING.md when the failure mode is likely to recur.

Never roll back application code blindly across an irreversible database migration.

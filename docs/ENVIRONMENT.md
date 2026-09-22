
# OpenBooks Environment Configuration

This document explains how environment configuration is managed without publishing secret values.

## Security rule

Environment variable names may be referenced by source code and the safe .env.example template. Real values must never be committed to Git or written into documentation.

Never place these in the repository:

- real database connection strings;
- auth/session secrets;
- OAuth client secrets;
- payment-provider secret keys;
- email API keys;
- Redis tokens;
- cron secrets;
- private admin allowlists;
- deployment tokens.

The public .env.example contains placeholders only. Copy it locally and fill in real values in .env.local.

## Configuration sources

### Local development

~~~bash
cp .env.example .env.local
~~~

Then edit .env.local on your machine.

### Deployment

Production values belong in the deployment platform's encrypted environment-variable store.

OpenBooks is deployed on Vercel. Configure values separately for the appropriate environment according to the feature being tested.

## Configuration groups

| Group | Used for |
| --- | --- |
| Database | Prisma/PostgreSQL connection |
| Authentication | Auth.js session secret and OAuth providers |
| Email | verification and password-reset delivery |
| Rate limiting | optional distributed limiter |
| Application URL | canonical/local application origin where needed |
| Analytics | optional client measurement |
| Administration | restricted internal analytics access |
| Cron | scheduled-job authentication |
| Storage | optional file/blob storage |
| Payments | reserved for future provider integrations |

The exact variable names and safe placeholder formats are maintained in .env.example.

## Local setup checklist

1. Copy .env.example.
2. Set database connectivity.
3. Set the application/auth configuration required for credentials login.
4. Configure email when testing verification or password reset.
5. Configure OAuth credentials and provider callback URLs when testing Google/GitHub.
6. Configure optional infrastructure only when the feature is enabled.
7. Run:

~~~bash
npx prisma generate
npx prisma migrate dev
npm run dev
~~~

## Production setup checklist

Before a production release:

- verify all required production values exist in the deployment environment;
- verify production values are not present in repository files;
- verify the canonical domain matches OAuth callback configuration;
- verify cron authentication is configured;
- verify email sender/domain configuration;
- verify optional distributed rate limiting is configured when required by scale;
- redeploy after changing deployment environment values when the platform requires a new build/runtime.

## Secret rotation

When a secret may have been exposed:

1. rotate the secret at the provider;
2. update the deployment environment;
3. invalidate/revoke the old credential where applicable;
4. inspect Git history if the secret may have been committed;
5. remove the exposed value from future repository state;
6. document the incident without publishing the secret itself.

Deleting a secret from the latest file is not sufficient if it entered Git history.

## Safe examples

~~~text
your-database-url
your-oauth-client-id
your-oauth-client-secret
your-api-key
generate-a-random-secret
~~~

Do not use strings copied from production dashboards, screenshots, logs or email.

## Environment review when adding a feature

Before adding a new environment dependency, ask:

- Is the value actually necessary?
- Does it need to be server-only?
- Could a public/browser variable accidentally expose a secret?
- Is a safe placeholder included in .env.example?
- Does the deployment configuration need to be updated?
- Is the new dependency documented?

The safest environment variable is the one the application does not need.

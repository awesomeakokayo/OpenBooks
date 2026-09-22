
# OpenBooks Documentation

This directory is the engineering documentation for OpenBooks. It is written to answer two questions quickly:

1. How does OpenBooks work?
2. Where do I change something safely?

The repository is the source of truth for implementation. Documentation explains the implementation and the constraints around it. When code and documentation disagree, verify the code, correct the documentation, and record the architectural change when it matters.

## Start here

| Need | Read |
| --- | --- |
| Understand the codebase | [CODEBASE-MAP.md](./CODEBASE-MAP.md) |
| Understand system design | [ARCHITECTURE.md](./ARCHITECTURE.md) |
| Set up a development machine | [CONTRIBUTING.md](../CONTRIBUTING.md) |
| Configure local/production secrets | [ENVIRONMENT.md](./ENVIRONMENT.md) |
| Understand the Prisma data model | [DATABASE.md](./DATABASE.md) |
| Deploy the application | [DEPLOYMENT.md](./DEPLOYMENT.md) |
| Understand integrations | [INTEGRATIONS.md](./INTEGRATIONS.md) |
| Run the test/release checks | [TESTING.md](./TESTING.md) |
| Fix a common problem | [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) |
| Understand SEO implementation | [SEO.md](./SEO.md) |
| Understand financial rules | [FINANCE.md](./FINANCE.md) |
| Work with authentication | [AUTHENTICATION.md](./AUTHENTICATION.md) |
| Work safely with an AI coding agent | [AI-DEVELOPER-GUIDE.md](./AI-DEVELOPER-GUIDE.md) |
| See the current implementation stage | [PHASE-CHECKPOINT.md](./PHASE-CHECKPOINT.md) |
| Understand the original V1 plan | [V1-IMPLEMENTATION-PLAN.md](./V1-IMPLEMENTATION-PLAN.md) |

## Existing reference documents

- [SECURITY.md](../SECURITY.md) — security model and vulnerability reporting.
- [CONTRIBUTING.md](../CONTRIBUTING.md) — contribution rules.
- [RATE-LIMITING.md](./RATE-LIMITING.md) — request-limiting implementation.
- [backup.md](./backup.md) — database backup/recovery notes.
- [paystack-settlement.md](./paystack-settlement.md) — future Paystack settlement design; Paystack is currently deferred from V1.
- [FULL-AUDIT-AND-REMEDIATION-PLAN.md](./FULL-AUDIT-AND-REMEDIATION-PLAN.md) — audit/remediation history.
- [PHASE-1-EXIT-TESTS.md](./PHASE-1-EXIT-TESTS.md) — V1 identity/onboarding test checklist.

## Documentation rules

### Never document secrets

Never put a real database URL or password, authentication secret, OAuth client secret, API key, webhook signing secret, access token, private deployment credential, private customer data, or private bank data in Markdown, source comments, screenshots, commit messages, tests, fixtures, or examples.

Use placeholder values only. The public .env.example file is the reference for environment-variable names and placeholder formats. Secret values belong in the local secret store or deployment platform.

### Keep change locations explicit

When introducing a feature, update the relevant documentation with:

- the user-facing entry point;
- the route/API entry point;
- the service/helper that owns the business logic;
- the database entities involved;
- the tests covering the behavior;
- deployment or provider configuration when applicable.

### Keep current state separate from future plans

A future design is not a current feature. For example, Paystack settlement documentation is retained as future design reference, while V1 currently uses manual payment methods.

### Prefer durable links

Use repository paths and route paths instead of links to local machines, temporary deployment URLs, or personal accounts.

## Documentation maintenance

Every meaningful change should update the smallest relevant document.

Examples:

- database field or relation → DATABASE.md and the Prisma schema;
- financial calculation → FINANCE.md and related tests;
- auth flow → AUTHENTICATION.md and SECURITY.md;
- new public SEO route → SEO.md and the central SEO path list;
- deployment behavior → DEPLOYMENT.md;
- recurring production bug → TROUBLESHOOTING.md;
- architectural decision → add a dated entry to the relevant decision section and keep the implementation source of truth in code.

For historical detail, use Git history rather than turning this directory into a copy of commit messages.

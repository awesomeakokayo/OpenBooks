
# OpenBooks Repository Guidance

This file is a compact entry point for AI coding agents and other automated development tools.

## Read before editing

1. README.md
2. docs/CODEBASE-MAP.md
3. docs/PHASE-CHECKPOINT.md
4. the relevant architecture/finance/auth/database document
5. the owning implementation
6. the relevant tests

## Core rules

- Treat the repository as the source of truth.
- Do not invent a new source of truth when an existing service/helper already owns the rule.
- Preserve tenant isolation.
- Keep financial calculations authoritative on the server.
- Do not let direct sales settle invoices.
- Keep secrets and private data out of source control and tool prompts.
- Update documentation when behavior or architecture changes.
- Prefer focused changes over broad rewrites.
- Run the relevant tests and production build before considering a meaningful change complete.

## Financial work

Read docs/FINANCE.md before changing:

- invoices;
- payments;
- receipts;
- sales;
- expenses;
- dashboard/report totals.

Protect the invariants described there.

## Security work

Read SECURITY.md and docs/AUTHENTICATION.md before changing:

- authentication;
- authorization;
- public invoice access;
- request protection;
- rate limiting;
- provider callbacks.

## Database work

Read docs/DATABASE.md before changing prisma/schema.prisma.

Consider:

- tenant ownership;
- indexes;
- delete behavior;
- migration safety;
- financial history;
- backup/recovery.

## SEO work

Read docs/SEO.md before adding public search-facing routes.

A page should have a deliberate search intent, useful content, correct metadata, internal links and an intentional indexability decision.

## Verification

Use at least:

~~~bash
npm run lint
npm run test
npm run build
~~~

For core user journeys, run the relevant E2E tests.

## Never expose secrets

Do not read, print, paste or commit production secret values.

Use .env.example for safe variable-name/placeholder reference and .env.local or the deployment secret store for real values.

## Recovery

When the implementation and documentation disagree:

1. inspect current code;
2. identify the actual behavior;
3. preserve the intended invariant;
4. update code or docs as appropriate;
5. add regression coverage;
6. continue only after verification.

Do not reconstruct project rules from an old chat transcript when the repository already documents them.

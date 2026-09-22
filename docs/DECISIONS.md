
# OpenBooks Architecture Decisions

This is a compact decision record. Detailed implementation belongs in the relevant code and documentation.

## Decision 1 — Next.js App Router

**Decision:** Keep the product on Next.js App Router.

**Reason:** The existing application combines public marketing/search pages, authenticated workspace pages and API routes in one deployable full-stack application.

**Implication:** Route behavior belongs under app/, reusable business logic under lib/, and shared UI under components/.

## Decision 2 — Business as tenant boundary

**Decision:** Treat Business + BusinessMember as the authorization boundary.

**Reason:** A user must be able to work with business-owned data without gaining access to another business.

**Implication:** Business-scoped handlers must verify membership before data access.

## Decision 3 — Server-side financial truth

**Decision:** Financial totals and invoice settlement rules are authoritative on the server.

**Reason:** Client-controlled totals can be stale or malicious.

**Implication:** Recalculate invoices server-side and derive outstanding/status from successful invoice-linked payments.

## Decision 4 — Decimal money persistence

**Decision:** Persist financial amounts using Prisma Decimal(12,2).

**Reason:** Financial data must not depend on binary floating-point persistence.

**Implication:** Financial utilities must preserve two-decimal/kobo-safe arithmetic.

## Decision 5 — Manual payments in V1

**Decision:** V1 supports Cash, Bank Transfer and POS as user-facing manual payment methods.

**Reason:** The core cashbook/invoice workflow should not depend on a payment provider.

**Implication:** Paystack is isolated as a future provider boundary and is not active in V1.

## Decision 6 — Public invoice token

**Decision:** Public invoice access uses a cryptographically random token rather than sequential internal IDs.

**Reason:** Customer-facing invoice links should not make internal identifiers guessable.

**Implication:** Public invoice routes must also minimize returned data and remain outside the authenticated workspace.

## Decision 7 — Nigeria local reporting time

**Decision:** Financial reporting periods use Africa/Lagos.

**Reason:** OpenBooks is Nigeria-first and business reporting should match the user's local business day/month.

**Implication:** Do not use server timezone defaults for date-only reporting logic.

## Decision 8 — Central SEO route registry

**Decision:** Maintain indexable public paths centrally.

**Reason:** Sitemap generation, crawl policy and SEO review should operate from a controlled route list.

**Implication:** A search-facing page is not automatically considered indexable just because a route exists.

## Decision 9 — Documentation as repository state

**Decision:** Documentation is versioned with the code.

**Reason:** Engineers and AI coding tools must be able to recover the current architecture from the repository, not from private conversations.

**Implication:** Meaningful architecture, data, security, deployment and product-rule changes require corresponding documentation updates.

## Decision 10 — Secrets never belong in source control

**Decision:** Real environment values remain outside Git.

**Reason:** The repository is public and engineering documentation must be safe to share.

**Implication:** .env.example may contain names and placeholders only; real values belong in local/deployment secret stores.

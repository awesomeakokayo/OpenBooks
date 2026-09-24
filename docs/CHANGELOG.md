# OpenBooks Engineering Changelog

This document records durable project milestones. It is not a replacement for Git history.

## 2026-09-24 — Hackaholics pitch and product documentation

Added a public, print-ready OpenBooks pitch deck at /pitch-deck for startup programme submissions.

Added product documentation that defines:

- current V1 product capabilities;
- user groups and the core product journey;
- active and deferred payment boundaries;
- approved external-facing product language;
- evidence standards for future traction claims.

Added pitch-deck documentation covering the public route, slide narrative, visual system, maintenance rules and submission checklist.

## 2026-09-22 — Documentation system

The repository was upgraded from scattered engineering notes to a navigable documentation system covering architecture, codebase map, database, financial rules, authentication, environment safety, deployment, integrations, SEO, testing, troubleshooting, AI-assisted development, architecture decisions and project milestones.

## 2026-09-03 to 2026-09-08 — Reliability and mobile polish

The project continued with:

- public OG/social image improvements;
- dashboard/mobile layout fixes;
- removal of deferred Paystack UI;
- navigation persistence and scroll behavior;
- stronger touch targets;
- accessible primary actions.

## 2026-09-02 — Search acquisition system

OpenBooks expanded from basic metadata into a structured SEO/search acquisition system.

## 2026-08-30 — Security, financial correctness and API quality

A broad production remediation pass addressed tenant authorization, financial validation, Nigeria-local date semantics, payment invariants, concurrency-safe manual payments, API pagination, standardized errors, secret redaction, rate limiting and public invoice data minimization.

## 2026-08-27 — Foundation and first product build

OpenBooks was established as a Next.js + Prisma + PostgreSQL/Auth.js application.

## Current product boundary

OpenBooks V1 records manual Cash, Bank Transfer and POS payments.

Paystack is intentionally deferred from V1. Its future design remains documented separately so it can be reintroduced through a deliberate provider phase rather than by restoring an old code path.

## Changelog rule

Record what changed, why it mattered, and any important migration or compatibility consequence.

Do not copy raw commit logs into this file.

Do not put secret values, private customer data or deployment credentials in changelog entries.

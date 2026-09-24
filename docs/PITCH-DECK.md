# OpenBooks Pitch Deck Documentation

## Public deck

**Route:** /pitch-deck

**Production URL:** https://www.openbooks.click/pitch-deck

The route is intentionally public and does not require an OpenBooks account.

## Purpose

The public pitch deck is designed for startup programmes, partner conversations and product review.

It is a web-native version of a presentation deck:

- each major section is a slide;
- the navigation bar jumps to individual slides;
- the page includes a print/save action so it can be exported from a browser;
- the same factual product boundaries used by the repository documentation are reflected in the deck.

## Current slide structure

1. Cover
2. The problem
3. Who it serves
4. The solution
5. The product
6. How it works
7. Why OpenBooks
8. Product strategy
9. Roadmap
10. The ask

## Narrative

The deck is built around a simple sequence:

    scattered financial records
            ↓
    small businesses need clarity
            ↓
    OpenBooks connects the daily record-keeping loop
            ↓
    the product is already live
            ↓
    the next job is validation and depth

The narrative should not depend on invented traction.

Where product usage metrics become available, add dated, verifiable figures rather than estimated numbers.

## Current claims used in the deck

The deck currently relies on repository-backed facts:

- OpenBooks is a Nigeria-first digital cashbook.
- The product is live at openbooks.click.
- V1 includes customers, sales, invoices, public invoice links, payments, receipts, expenses and reports.
- V1 records Cash, Bank Transfer and POS payments.
- Paystack is deferred from V1.
- The core codebase is public.
- Engineering and product documentation exist in docs/.

## Claims that require future evidence

Before adding any of these to the deck, record a source and date:

- number of registered businesses;
- monthly active users;
- invoices created;
- total payment volume;
- revenue;
- conversion;
- retention;
- market size estimates;
- customer quotes used as quantitative proof;
- partnership claims.

## Visual system

The deck uses the OpenBooks website visual language:

- plum: #503047;
- terracotta: #C05746;
- sage: #ADC698;
- pale sage: #D0E3C4;
- warm off-white: #F8F8F6.

It uses the project's existing Manrope, Inter and IBM Plex Mono font variables.

## Editing rules

When editing /pitch-deck:

1. Keep the route self-contained unless reusable components already exist.
2. Reuse the existing brand palette rather than introducing a second visual identity.
3. Keep copy concrete and product-specific.
4. Do not claim future features as current.
5. Do not add traction numbers without a source.
6. Update this file when the slide order or narrative changes.
7. Update docs/PRODUCT.md when the product boundary changes.

## Submission checklist

Before sending the deck to a programme:

- open https://www.openbooks.click/pitch-deck;
- check the product URL still works;
- confirm current V1 feature list;
- confirm no deferred provider is presented as live;
- update traction section if real metrics are available;
- print/export once and inspect the PDF;
- confirm contact and repository links are correct.

## Related documents

- docs/PRODUCT.md — product-level source of truth.
- docs/ARCHITECTURE.md — technical system shape.
- docs/CODEBASE-MAP.md — implementation navigation.
- docs/CHANGELOG.md — durable project history.

# OpenBooks NG

Open-source, Nigeria-first digital cashbook for small businesses.

> Your business notebook, but digital — record sales, send invoices, collect payments, issue receipts.

## Stack
Next.js 16 + TypeScript • Prisma + Neon PostgreSQL • Auth.js • Tailwind v4 • Vitest + Playwright

## Design
See `style.md` (not committed) — palette: Plum `#503047`, Terracotta `#C05746`, Sage `#ADC698`, Pale Sage `#D0E3C4`, White. Fonts: Inter + Manrope.

## Get Started

```bash
npm install
cp .env.example .env.local
# fill DATABASE_URL (Neon), AUTH_SECRET, PAYSTACK keys, APP_URL
npx prisma migrate dev
npm run dev
```

## Testing
```bash
npm run test        # unit
npm run test:e2e    # e2e (requires dev server)
```

## Docs
`implement.md` is the build plan (Phases 0→10). Work docs `buildversion.md` etc are gitignored.

## License
To be decided — AGPL-3.0 candidate.

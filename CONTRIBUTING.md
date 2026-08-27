# Contributing to OpenBooks NG

## Dev setup
```bash
npm install
cp .env.example .env.local
# fill DATABASE_URL (Neon), AUTH_SECRET, APP_URL
npx prisma migrate dev
npm run dev
```

## Testing
```bash
npm run test        # vitest 47+ unit
npm run test:e2e    # playwright (needs dev server)
npx next build      # must pass
```

## Before PR
- `requireBusinessMember` on every businessId route
- Invoice totals server-side, publicToken 32-hex, providerReference unique
- `lib/` central business logic, not duplicated in handlers
- Style via `style.md` palette (Plum/Terracotta/Sage/Pale Sage) + Inter/Manrope

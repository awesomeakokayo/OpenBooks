# Backup & Restore — Neon

## Neon native
- Point-in-time restore (PITR) enabled on Neon project.
- Branching: create `backup-test` branch before risky migrations.

## Manual pg_dump
```bash
# Requires DIRECT_URL (Neon)
pg_dump "$DIRECT_URL" -Fc -f openbooks_$(date +%F).dump
# Restore test
createdb openbooks_restore_test
pg_restore -d openbooks_restore_test openbooks_*.dump
```

## Vercel
- Env vars in Vercel dashboard, not in repo.
- Run migrations via `npx prisma migrate deploy` (never `db push` in prod).

## Drill
Monthly: restore latest dump to local `openbooks_restore_test` and run `npx vitest run` against it.

## Cron
`vercel.json` daily `/api/cron/overdue` at 02:00 UTC. Protect with `CRON_SECRET` env.

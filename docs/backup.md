
# Backup & Restore — PostgreSQL

OpenBooks depends on PostgreSQL data for business, customer and financial records. Backup/recovery is therefore a production responsibility, not only a development task.

## Provider backups

Use the database provider's supported point-in-time recovery and branching features when enabled.

Before a risky schema migration, create an isolated recovery/test branch when the provider supports it.

Do not assume provider backup settings are enabled. Verify them in the current production account.

## Manual dump

For an operator with appropriate database access:

~~~bash
pg_dump "$DIRECT_URL" -Fc -f openbooks_$(date +%F).dump
~~~

Restore to an isolated test database:

~~~bash
createdb openbooks_restore_test
pg_restore -d openbooks_restore_test openbooks_*.dump
~~~

Never paste the real database connection string into documentation or an issue.

## Production migrations

Use committed Prisma migration files and:

~~~bash
npx prisma migrate deploy
~~~

Do not use prisma db push against production and do not run prisma migrate dev against the production database.

## Recovery drill

A recovery drill should verify:

1. a recent backup can be obtained;
2. the backup can be restored;
3. the restored schema is usable;
4. representative business records are readable;
5. the application can connect to the restored database;
6. financial invariants still hold.

Record the drill result without including private customer data or credentials.

## Cron

The overdue-invoice job is scheduled by vercel.json.

Schedule:

02:00 UTC daily

See DEPLOYMENT.md and the current deployment configuration for operational details.

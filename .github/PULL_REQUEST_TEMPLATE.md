
## What changed?

<!-- Describe the user-visible or engineering change and why it is needed. -->

## Verification

- [ ] npm run lint
- [ ] npm run test
- [ ] npm run build
- [ ] Relevant E2E tests run when applicable

## Safety checks

- [ ] Tenant isolation preserved
- [ ] Server-side financial rules preserved
- [ ] Authentication/authorization boundaries reviewed when applicable
- [ ] No secrets or private customer data added
- [ ] No unnecessary client-side exposure of server-only configuration

## Documentation

- [ ] Relevant docs updated
- [ ] New architecture decision documented when needed
- [ ] New recurring failure mode added to TROUBLESHOOTING.md when useful
- [ ] Public SEO changes reflected in docs/SEO.md when applicable

## Database

- [ ] Prisma schema/migration reviewed when applicable
- [ ] Destructive or compatibility-sensitive changes documented
- [ ] Backup/recovery impact considered

## Release notes

<!-- Add a concise release note only for changes that matter outside the codebase. -->

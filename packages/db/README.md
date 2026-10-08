# @pg-manager/db

Drizzle ORM schema, SQL migrations and seeds for PostgreSQL (Neon in production).

**Status: configuration only.** There are no tables and no database connection yet.

- Schema: `src/schema/` (empty until the schema batch).
- Migrations: generated into `migrations/` with `npm run db:generate -w @pg-manager/db`, reviewed, committed.
- Applying migrations: `DATABASE_URL=… npm run db:migrate -w @pg-manager/db` from CI or a trusted shell only.
- Consumers: `apps/api` only. The mobile app must never depend on this package or hold database credentials.
- Rows are mapped to `@pg-manager/domain` types inside API repositories; Drizzle types must not leak into the domain.

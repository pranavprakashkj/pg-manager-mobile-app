import { defineConfig } from "drizzle-kit";

/**
 * Drizzle Kit configuration.
 *
 * - Migrations are generated as SQL into ./migrations, reviewed, and committed.
 * - They are applied from CI/a trusted shell with `npm run db:migrate -w @pg-manager/db`,
 *   never from the mobile app and never with `drizzle-kit push` against production.
 * - DATABASE_URL is only read when a command actually needs a database (migrate/check);
 *   nothing in this repository is connected to Neon yet.
 */
export default defineConfig({
  dialect: "postgresql",
  schema: "./src/schema/index.ts",
  out: "./migrations",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "",
  },
  strict: true,
  verbose: true,
});

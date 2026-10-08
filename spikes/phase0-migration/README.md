# Phase 0 migration spike (DISPOSABLE)

Validation-only code for the Firebase → Clerk + Cloudflare Workers/Hono + Neon decision.
**Not production architecture. Nothing in the app imports it.** The app's `tsconfig.json`,
`eslint.config.js` and `metro.config.js` exclude `spikes/`. Delete this folder once the decision is made.

```
Client ──Bearer Clerk session token──▶ Worker (Hono) ──verifyToken({ jwtKey })──▶ claims.sub
                                              └──postgres.js via Hyperdrive──▶ Postgres (Neon Singapore in prod)
```

Endpoints (`api/src/index.ts`), all returning a `timings` object and a `Server-Timing` header:

| Endpoint | Auth | Purpose |
|---|---|---|
| `GET /health` | – | Liveness + Cloudflare colo |
| `GET /me` | Clerk | Clerk user id → our `users` row + active memberships (1 query) |
| `GET /db-test` | Clerk | First round trip + `now()/version()` |
| `GET /orgs/:orgId/inventory-test` | Clerk | Membership check (404 for non-members) + whole Org→Building→Floor→Room→Bed tree in ONE SQL round trip |

The schema in `api/sql/spike-schema.sql` lives in its own `spike_phase0` schema and is **not** the production schema.

## Run locally (no accounts needed)

```bash
cd spikes/phase0-migration/api
npm install
npm run db:local:init                     # throwaway Postgres.app cluster on :55432 inside .local-pg/
DATABASE_URL=postgres://spike@127.0.0.1:55432/pgm_spike npm run db:seed   # 2 orgs × 480 beds
npm run token:local > results/local-token.txt   # stand-in token in Clerk's claim shape; writes .dev.vars
CLOUDFLARE_HYPERDRIVE_LOCAL_CONNECTION_STRING_HYPERDRIVE=postgres://spike:spike@127.0.0.1:55432/pgm_spike npm run dev
# another shell:
TOKEN=$(cat results/local-token.txt) ORG_ID=$(node -e 'console.log(require("./results/seed.json").memberOrgId)') N=100 npm run bench
npm run db:local:stop
```

## Deploy against real Clerk + Neon + Cloudflare (needs your accounts)

1. **Clerk** (dashboard.clerk.com): create an application (development instance), enable Email + password,
   create one test user. Copy: Secret key (`sk_test_…`), JWT public key (API keys → *Show JWT public key* → PEM),
   and the test user's id (`user_…`).
2. **Neon** (console.neon.tech): create a project in **AWS Asia Pacific (Singapore)**. Copy the *direct*
   (non-pooled) connection string. Then:
   ```bash
   DATABASE_URL='<neon direct url>' CLERK_USER_IDS='<user_…>' npm run db:seed
   ```
3. **Cloudflare**:
   ```bash
   npx wrangler login
   npx wrangler hyperdrive create pgm-spike --connection-string='<neon direct url>'
   # paste the returned id into wrangler.jsonc → hyperdrive[0].id
   npx wrangler secret put CLERK_JWT_KEY        # paste the PEM public key
   npx wrangler deploy                          # prints https://pgm-phase0-spike.<subdomain>.workers.dev
   ```

## Measure from Bengaluru (Gate 3)

Run on a Bengaluru network — ideally twice: office broadband **and** a 4G/5G phone hotspot.

```bash
cd spikes/phase0-migration/api
export API_URL='https://pgm-phase0-spike.<subdomain>.workers.dev'
export ORG_ID=$(node -e 'console.log(require("./results/seed.json").memberOrgId)')   # printed by db:seed
export TOKEN=$(CLERK_SECRET_KEY='sk_test_…' CLERK_USER_ID='user_…' bash scripts/clerk-token.sh)
N=100 npm run bench          # prints p50/p95 per endpoint + Server-Timing stages; saves results/bench-*.json
```

Pass criterion: `inventory` client **p95 < ~300 ms**. Also note `worker colo` (expect BLR/MAA/BOM) and the
`dbMembership` / `dbInventory` stages (each ≈ one Worker→Singapore round trip).

## Teardown

`npx wrangler delete`, `npx wrangler hyperdrive delete <id>`, delete the Neon project and Clerk app,
`npm run db:local:stop && rm -rf .local-pg`, then delete `spikes/`.

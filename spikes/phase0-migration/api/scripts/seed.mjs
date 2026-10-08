// Seeds the DISPOSABLE spike schema with synthetic inventory.
// Usage: DATABASE_URL=postgres://... CLERK_USER_IDS=user_abc[,user_def] node scripts/seed.mjs
// Sizes (defaults model a large PG): BUILDINGS=3 FLOORS=4 ROOMS=10 BEDS=4  → 480 beds.
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import postgres from "postgres";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("Set DATABASE_URL");
const clerkIds = (process.env.CLERK_USER_IDS ?? "user_spike_local").split(",").map((s) => s.trim()).filter(Boolean);
const B = +(process.env.BUILDINGS ?? 3), F = +(process.env.FLOORS ?? 4), R = +(process.env.ROOMS ?? 10), BEDS = +(process.env.BEDS ?? 4);
const statuses = ["occupied", "occupied", "occupied", "vacant", "reserved", "maintenance", "occupied", "occupied"];

const sql = postgres(url, { max: 1, onnotice: () => {} });
await sql.unsafe(readFileSync(new URL("../sql/spike-schema.sql", import.meta.url), "utf8"));

const users = [];
for (const id of clerkIds) {
  const [u] = await sql`INSERT INTO spike_phase0.users (clerk_user_id, name) VALUES (${id}, ${"Spike " + id}) RETURNING id`;
  users.push(u.id);
}

const [orgA] = await sql`INSERT INTO spike_phase0.organizations (name) VALUES ('Spike PG (member)') RETURNING id`;
const [orgB] = await sql`INSERT INTO spike_phase0.organizations (name) VALUES ('Other tenant (not a member)') RETURNING id`;
for (const uid of users) {
  await sql`INSERT INTO spike_phase0.organization_members VALUES (${orgA.id}, ${uid}, 'owner', 'active')`;
}

async function seedOrg(orgId) {
  let n = 0;
  for (let b = 0; b < B; b++) {
    const [bl] = await sql`INSERT INTO spike_phase0.buildings (organization_id, name) VALUES (${orgId}, ${"Building " + String.fromCharCode(65 + b)}) RETURNING id`;
    for (let f = 0; f < F; f++) {
      const [fl] = await sql`INSERT INTO spike_phase0.floors (organization_id, building_id, name, sort_order) VALUES (${orgId}, ${bl.id}, ${f === 0 ? "Ground Floor" : `Floor ${f}`}, ${f}) RETURNING id`;
      for (let r = 0; r < R; r++) {
        const [rm] = await sql`INSERT INTO spike_phase0.rooms (organization_id, floor_id, room_number) VALUES (${orgId}, ${fl.id}, ${String(f * 100 + r + 1)}) RETURNING id`;
        const beds = Array.from({ length: BEDS }, (_, i) => ({
          organization_id: orgId, room_id: rm.id, name: `Bed ${String.fromCharCode(65 + i)}`,
          status: statuses[(n + i) % statuses.length], default_monthly_rate_paise: 850000,
        }));
        n += BEDS;
        await sql`INSERT INTO spike_phase0.beds ${sql(beds)}`;
      }
    }
  }
  return n;
}

const bedsA = await seedOrg(orgA.id);
await seedOrg(orgB.id);
await sql`ANALYZE`;
await sql.end();

mkdirSync(new URL("../results/", import.meta.url), { recursive: true });
const out = { memberOrgId: orgA.id, otherTenantOrgId: orgB.id, clerkUserIds: clerkIds, bedsPerOrg: bedsA };
writeFileSync(new URL("../results/seed.json", import.meta.url), JSON.stringify(out, null, 2));
console.log(JSON.stringify(out, null, 2));

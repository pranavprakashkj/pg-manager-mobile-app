/**
 * DISPOSABLE Phase 0 spike — NOT production architecture.
 *
 * Validates: Clerk session token → Worker (Hono) verifies it → Postgres via Hyperdrive.
 * Every response carries a per-stage timing breakdown (also as a Server-Timing header).
 */
import { Hono, type Context } from "hono";
import { verifyToken } from "@clerk/backend";
import postgres from "postgres";

type Env = {
  HYPERDRIVE: Hyperdrive;
  CLERK_JWT_KEY?: string;
  CLERK_SECRET_KEY?: string;
  CLERK_AUTHORIZED_PARTIES?: string;
};

type Vars = { timings: Record<string, number>; clerkUserId: string; sessionId: string | undefined };

const app = new Hono<{ Bindings: Env; Variables: Vars }>();

const now = () => performance.now();

/** Workers freeze timers within a request; Date/performance only advance across I/O, which is exactly what we want to measure. */
async function timed<T>(c: Context<{ Bindings: Env; Variables: Vars }>, name: string, fn: () => Promise<T>): Promise<T> {
  const t = now();
  try {
    return await fn();
  } finally {
    c.get("timings")[name] = Math.round((now() - t) * 10) / 10;
  }
}

function serverTiming(timings: Record<string, number>) {
  return Object.entries(timings)
    .map(([k, v]) => `${k};dur=${v}`)
    .join(", ");
}

function db(env: Env) {
  // One client per request is the Hyperdrive-recommended pattern (Hyperdrive owns the real pool).
  return postgres(env.HYPERDRIVE.connectionString, { max: 1, fetch_types: false, prepare: true, idle_timeout: 5 });
}

app.use("*", async (c, next) => {
  c.set("timings", {});
  const t = now();
  await next();
  const timings = c.get("timings");
  timings.total = Math.round((now() - t) * 10) / 10;
  c.header("Server-Timing", serverTiming(timings));
});

app.onError((err, c) => {
  console.error("spike error", err);
  return c.json({ error: { code: "internal", message: "Something went wrong" } }, 500);
});

/** Clerk session-token verification. Networkless when CLERK_JWT_KEY (PEM) is set. */
async function requireClerk(c: Context<{ Bindings: Env; Variables: Vars }>, next: () => Promise<void>) {
  const header = c.req.header("Authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token) return c.json({ error: { code: "unauthenticated", message: "Missing bearer token" } }, 401);

  const parties = (c.env.CLERK_AUTHORIZED_PARTIES ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  // NOTE: the root `verifyToken` export throws on failure and resolves to the claims
  // (its .d.ts advertises { data, errors }, which is the internal variant).
  let claims: { sub: string; sid?: string };
  try {
    claims = (await timed(c, "auth", () =>
      verifyToken(token, {
        jwtKey: c.env.CLERK_JWT_KEY,
        secretKey: c.env.CLERK_JWT_KEY ? undefined : c.env.CLERK_SECRET_KEY,
        authorizedParties: parties.length ? parties : undefined,
      })
    )) as unknown as { sub: string; sid?: string };
  } catch (err) {
    const reason = (err as { reason?: string }).reason ?? "token-invalid";
    return c.json({ error: { code: "unauthenticated", message: "Invalid or expired session", reason } }, 401);
  }
  c.set("clerkUserId", claims.sub);
  c.set("sessionId", claims.sid);
  c.get("timings").verifyMode = c.env.CLERK_JWT_KEY ? 1 : 0; // 1 = networkless PEM, 0 = JWKS fetch
  await next();
}

app.get("/health", (c) =>
  c.json({ ok: true, colo: (c.req.raw as { cf?: { colo?: string } }).cf?.colo ?? "local", timings: c.get("timings") })
);

app.get("/me", requireClerk, async (c) => {
  const sql = db(c.env);
  try {
    const rows = await timed(c, "db", () =>
      sql`
        SELECT u.id, u.name,
               COALESCE(json_agg(json_build_object('organizationId', m.organization_id, 'role', m.role, 'status', m.status))
                        FILTER (WHERE m.organization_id IS NOT NULL), '[]') AS memberships
        FROM spike_phase0.users u
        LEFT JOIN spike_phase0.organization_members m ON m.user_id = u.id AND m.status = 'active'
        WHERE u.clerk_user_id = ${c.get("clerkUserId")}
        GROUP BY u.id`
    );
    return c.json({
      clerkUserId: c.get("clerkUserId"),
      sessionId: c.get("sessionId"),
      user: rows[0] ?? null, // null = would be lazily provisioned in the real API
      timings: c.get("timings"),
    });
  } finally {
    c.executionCtx.waitUntil(sql.end());
  }
});

app.get("/db-test", requireClerk, async (c) => {
  const sql = db(c.env);
  try {
    // First round trip includes connection setup through Hyperdrive.
    await timed(c, "dbFirst", () => sql`SELECT 1 AS ok`);
    const [row] = await timed(c, "dbQuery", () => sql`SELECT now() AS server_time, version() AS version, current_setting('server_version') AS v`);
    return c.json({ ok: true, serverTime: row.server_time, postgres: row.v, timings: c.get("timings") });
  } finally {
    c.executionCtx.waitUntil(sql.end());
  }
});

/**
 * Inventory-style read: tenant check + the whole Org → Building → Floor → Room → Bed tree
 * in ONE batched SQL round trip (json aggregation in Postgres), as the real API would do.
 */
app.get("/orgs/:orgId/inventory-test", requireClerk, async (c) => {
  const orgId = c.req.param("orgId") as string;
  const sql = db(c.env);
  try {
    const membership = await timed(c, "dbMembership", () =>
      sql`
        SELECT m.role FROM spike_phase0.organization_members m
        JOIN spike_phase0.users u ON u.id = m.user_id
        WHERE u.clerk_user_id = ${c.get("clerkUserId")} AND m.organization_id = ${orgId}::uuid AND m.status = 'active'`
    );
    // 404, not 403: never confirm another tenant's IDs exist.
    if (membership.length === 0) return c.json({ error: { code: "not_found", message: "Organization not found" } }, 404);

    const [row] = await timed(c, "dbInventory", () =>
      sql`
        SELECT COALESCE(json_agg(b ORDER BY b.name), '[]') AS buildings FROM (
          SELECT bl.id, bl.name,
            (SELECT COALESCE(json_agg(f ORDER BY f.sort_order), '[]') FROM (
              SELECT fl.id, fl.name, fl.sort_order,
                (SELECT COALESCE(json_agg(r ORDER BY r.room_number), '[]') FROM (
                  SELECT rm.id, rm.room_number,
                    (SELECT COALESCE(json_agg(json_build_object('id', bd.id, 'name', bd.name, 'status', bd.status,
                                                                'monthlyRatePaise', bd.default_monthly_rate_paise) ORDER BY bd.name), '[]')
                       FROM spike_phase0.beds bd WHERE bd.organization_id = ${orgId}::uuid AND bd.room_id = rm.id AND bd.is_active) AS beds
                  FROM spike_phase0.rooms rm WHERE rm.organization_id = ${orgId}::uuid AND rm.floor_id = fl.id AND rm.is_active) r) AS rooms
              FROM spike_phase0.floors fl WHERE fl.organization_id = ${orgId}::uuid AND fl.building_id = bl.id AND fl.is_active) f) AS floors
          FROM spike_phase0.buildings bl WHERE bl.organization_id = ${orgId}::uuid AND bl.is_active) b`
    );

    const buildings = row.buildings as { floors: { rooms: { beds: unknown[] }[] }[] }[];
    const bedCount = buildings.reduce(
      (n, b) => n + b.floors.reduce((m, f) => m + f.rooms.reduce((k, r) => k + r.beds.length, 0), 0),
      0
    );
    return c.json({ organizationId: orgId, role: membership[0].role, bedCount, buildings, timings: c.get("timings") });
  } finally {
    c.executionCtx.waitUntil(sql.end());
  }
});

export default app;

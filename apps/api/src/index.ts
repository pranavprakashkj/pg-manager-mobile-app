import { Hono } from "hono";
import type { ApiError, HealthResponse } from "@pg-manager/domain";

/**
 * PG Manager API — architectural skeleton.
 *
 * Target request flow (not implemented yet):
 *   authentication (Clerk) → tenant authorization (our memberships) → business rules
 *   → database transaction (Drizzle/Neon) → response.
 * Today only GET /health exists; there is no auth and no database access.
 */
export type Env = {
  API_VERSION?: string;
};

export const app = new Hono<{ Bindings: Env }>();

app.get("/health", (c) => {
  const body: HealthResponse = {
    status: "ok",
    service: "pg-manager-api",
    version: c.env?.API_VERSION ?? "0.0.0",
    time: new Date().toISOString(),
  };
  return c.json(body);
});

app.notFound((c) => c.json<ApiError>({ error: { code: "not_found", message: "Not found" } }, 404));

app.onError((err, c) => {
  console.error("Unhandled API error", err);
  return c.json<ApiError>({ error: { code: "internal", message: "Something went wrong. Please try again." } }, 500);
});

export default app;

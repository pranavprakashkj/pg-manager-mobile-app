import { describe, expect, it } from "vitest";
import { ApiErrorSchema, HealthResponseSchema } from "@pg-manager/domain";
import app from "../src/index";

describe("api skeleton", () => {
  it("GET /health returns the shared health contract", async () => {
    const res = await app.request("/health", {}, { API_VERSION: "test" });
    expect(res.status).toBe(200);
    const body = HealthResponseSchema.parse(await res.json());
    expect(body).toMatchObject({ status: "ok", service: "pg-manager-api", version: "test" });
  });

  it("unknown routes return the shared error envelope", async () => {
    const res = await app.request("/nope");
    expect(res.status).toBe(404);
    expect(ApiErrorSchema.parse(await res.json()).error.code).toBe("not_found");
  });
});

import { z } from "zod";

/**
 * HTTP API contracts shared by apps/api (producer) and apps/mobile (consumer).
 * Only the foundation exists today; resource contracts are added as endpoints are built.
 */

export const API_VERSION = "v1" as const;

/** Stable, machine-readable error codes. Messages are user-facing and free of infrastructure terms. */
export const ApiErrorCodeSchema = z.enum([
  "bad_request",
  "unauthenticated",
  "forbidden",
  "not_found",
  "conflict",
  "rate_limited",
  "internal",
]);
export type ApiErrorCode = z.infer<typeof ApiErrorCodeSchema>;

export const ApiErrorSchema = z.object({
  error: z.object({
    code: ApiErrorCodeSchema,
    message: z.string(),
  }),
});
export type ApiError = z.infer<typeof ApiErrorSchema>;

export const HealthResponseSchema = z.object({
  status: z.literal("ok"),
  service: z.string(),
  version: z.string(),
  time: z.string(),
});
export type HealthResponse = z.infer<typeof HealthResponseSchema>;

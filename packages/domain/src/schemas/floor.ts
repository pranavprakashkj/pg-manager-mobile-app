import { z } from "zod";

export const floorSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Floor name is required")
    .max(100, "Floor name must be 100 characters or fewer"),
});

export type FloorFormInput = z.infer<typeof floorSchema>;

export const floorCreateSchema = floorSchema.extend({
  buildingId: z.string().min(1, "Building ID is required"),
  sortOrder: z.number().int().min(0, "Sort order must be a non-negative integer"),
});

export type FloorCreateInput = z.infer<typeof floorCreateSchema>;

/**
 * Validates and returns cleaned floor form data.
 * Throws if validation fails.
 */
export function validateFloorInput(data: unknown): FloorFormInput {
  return floorSchema.parse(data);
}

/**
 * Validates the full floor creation payload including buildingId and sortOrder.
 */
export function validateFloorCreateInput(data: unknown): FloorCreateInput {
  return floorCreateSchema.parse(data);
}

import { z } from "zod";

export const buildingSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Building name is required")
    .max(100, "Building name must be 100 characters or fewer"),
});

export type BuildingFormInput = z.infer<typeof buildingSchema>;

/**
 * Validates and returns cleaned building form data.
 * Throws if validation fails.
 */
export function validateBuildingInput(data: unknown): BuildingFormInput {
  return buildingSchema.parse(data);
}

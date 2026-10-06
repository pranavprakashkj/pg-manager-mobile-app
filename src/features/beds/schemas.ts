import { z } from "zod";

export const bedSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Bed name is required")
    .max(50, "Bed name must be 50 characters or fewer"),
  defaultMonthlyRate: z
    .number()
    .nonnegative("Rate cannot be negative"),
  defaultDailyRate: z
    .number()
    .nonnegative("Rate cannot be negative"),
});

export type BedFormInput = z.infer<typeof bedSchema>;

// Note: Status is handled separately as it has strict manual transition rules
export const bedUpdateSchema = bedSchema.extend({
  status: z.enum(["vacant", "occupied", "reserved", "maintenance"]),
});

export type BedUpdateInput = z.infer<typeof bedUpdateSchema>;

export function validateBedInput(data: unknown): BedFormInput {
  return bedSchema.parse(data);
}

export function validateBedUpdateInput(data: unknown): BedUpdateInput {
  return bedUpdateSchema.parse(data);
}

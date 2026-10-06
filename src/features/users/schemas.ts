import { z } from "zod";

export const UserProfileSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Invalid email").optional(),
  phone: z.string().optional(),
});

export type UserProfileFormInput = z.infer<typeof UserProfileSchema>;

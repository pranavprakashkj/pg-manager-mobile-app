import { z } from "zod";

export const OrganizationSchema = z.object({
  name: z.string().min(1, "Organization name is required").max(100),
});

export type OrganizationFormInput = z.infer<typeof OrganizationSchema>;

export const OrganizationMemberSchema = z.object({
  role: z.enum(["owner", "admin"]),
  status: z.enum(["active", "invited", "inactive"]),
});

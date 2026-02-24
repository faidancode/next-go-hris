import { z } from "zod";

export const userSchema = z.object({
  employee_id: z.string(),
  email: z.email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .optional()
    .or(z.literal("")),
  is_active: z.boolean(),
});

export type UserFormValues = z.infer<typeof userSchema>;

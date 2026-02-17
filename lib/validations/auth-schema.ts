import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("Email is not valid"),
  password: z
    .string({ message: "Password is required" })
    .min(8, "Password must be at least 8 characters"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

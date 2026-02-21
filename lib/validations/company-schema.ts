import { z } from "zod";

export const registerCompanySchema = z.object({
  company_name: z.string().min(2, "Company name must be at least 2 characters"),
  company_email: z.string().email("Invalid company email address"),
  admin_name: z.string().min(2, "Admin name must be at least 2 characters"),
  admin_email: z.string().email("Invalid admin email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type RegisterCompanyFormValues = z.infer<typeof registerCompanySchema>;

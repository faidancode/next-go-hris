import { z } from "zod";

export const employeeSchema = z.object({
  full_name: z.string().min(1, "Full name is required"),
  email: z.string().min(1, "Email is required").email("Email is invalid"),
  employee_number: z.string().min(1, "Employee number is required"),
  phone: z.string().optional().or(z.literal("")),
  hire_date: z.string().min(1, "Hire date is required"),
  employment_status: z.string().min(1, "Employment status is required"),
  position_id: z.string().min(1, "Position is required"),
});

export type EmployeeFormValues = z.infer<typeof employeeSchema>;

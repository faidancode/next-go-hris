import { z } from "zod";

export const employeeSalarySchema = z.object({
  employee_id: z.string().min(1, "Employee is required"),
  base_salary: z
    .number()
    .int("Base salary must be an integer")
    .min(0, "Base salary must be 0 or greater"),
  effective_date: z.string().min(1, "Effective date is required"),
});

export type EmployeeSalaryFormValues = z.infer<typeof employeeSalarySchema>;

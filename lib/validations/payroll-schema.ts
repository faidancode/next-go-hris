import { z } from "zod";

const componentSchema = z.object({
  component_name: z.string().min(1, "Component name is required"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  unit_amount: z.number().min(0, "Amount must be at least 0"),
  notes: z.string().optional(),
});

export const payrollSchema = z.object({
  employee_id: z.string().min(1, "Employee is required"),
  period_start: z.string().min(1, "Start period is required"),
  period_end: z.string().min(1, "End period is required"),
  base_salary: z.number().min(0, "Base salary must be at least 0"),
  allowance: z.number().min(0),
  overtime_hours: z.number().min(0),
  overtime_rate: z.number().min(0),
  deduction: z.number().min(0),
  allowance_items: z.array(componentSchema),
  deduction_items: z.array(componentSchema),
});

export type PayrollFormValues = z.infer<typeof payrollSchema>;




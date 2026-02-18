import { z } from "zod";

export const departmentSchema = z.object({
  name: z.string().min(1, "Department name is required"),
  parent_department_id: z.string().optional().or(z.literal("")),
});

export type DepartmentFormValues = z.infer<typeof departmentSchema>;


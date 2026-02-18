import { z } from "zod";

export const positionSchema = z.object({
  name: z.string().min(1, "Position name is required"),
  department_id: z.string().min(1, "Department is required"),
});

export type PositionFormValues = z.infer<typeof positionSchema>;

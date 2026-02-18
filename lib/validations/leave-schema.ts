import { z } from "zod";

const today = new Date();
today.setHours(0, 0, 0, 0);

export const leaveSchema = z
  .object({
    leaveType: z.enum(["ANNUAL", "SICK", "UNPAID"], {
      message: "Leave type is required",
    }),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().min(1, "End date is required"),
    reason: z.string().optional(),
  })
  .refine((values) => values.endDate >= values.startDate, {
    message: "End date cannot be earlier than start date.",
    path: ["endDate"],
  })
  .refine((values) => {
    const start = new Date(values.startDate);
    start.setHours(0, 0, 0, 0);
    return start >= today;
  }, {
    message: "Start date cannot be earlier than today.",
    path: ["startDate"],
  });

export type LeaveFormValues = z.infer<typeof leaveSchema>;


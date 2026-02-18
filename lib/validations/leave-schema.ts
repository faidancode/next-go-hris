import { z } from "zod";

const today = new Date();
today.setHours(0, 0, 0, 0);

export const leaveStatusSchema = z.enum([
  "PENDING",
  "SUBMITTED",
  "APPROVED",
  "REJECTED",
  "CANCELLED",
]);

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

export const leaveUpdateSchema = leaveSchema.extend({
  status: leaveStatusSchema,
  approvedBy: z.string().optional(),
  rejectionReason: z.string().optional(),
});

export type LeaveUpdateFormValues = z.infer<typeof leaveUpdateSchema>;

export const leaveRejectSchema = z.object({
  rejectionReason: z.string().trim().min(1, "Rejection reason is required"),
});

export type LeaveRejectFormValues = z.infer<typeof leaveRejectSchema>;

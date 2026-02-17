// src/schemas/brandSchema.ts
import { z } from "zod";

export const brandSchema = z.object({
  name: z
    .string()
    .min(3, "Name required")
    .max(255, "Name cannot exceed 255 characters"),
  slug: z.string().optional(),
  imageUrl: z.url("Image must be a valid URL").optional().or(z.literal("")),
  createdAt: z.date().optional().nullable(),
  updatedAt: z.date().optional().nullable(),
  deletedAt: z.date().optional().nullable(),
});

export type BrandFormValues = z.infer<typeof brandSchema>;

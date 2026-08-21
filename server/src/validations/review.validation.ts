import { z } from "zod";

export const reviewInputSchema = z.object({
  rating: z.number().int().min(1).max(5),
  text: z.string().min(10, "Review must be at least 10 characters.").max(2000),
});

export type ReviewInput = z.infer<typeof reviewInputSchema>;

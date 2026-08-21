import { z } from "zod";

export const productInputSchema = z.object({
  name: z.string().min(2).max(120),
  price: z.coerce.number().min(0),
  compareAtPrice: z.coerce.number().min(0).optional(),
  category: z.string().min(2),
  description: z.string().min(10),
  shortDescription: z.string().min(5).max(200),
  image: z.string().min(3),
  images: z.array(z.string()).optional().default([]),
  stock: z.coerce.number().int().min(0),
  rating: z.coerce.number().min(0).max(5).optional().default(0),
  featured: z.boolean().optional().default(false),
  tags: z.array(z.string()).optional().default([]),
});

export type ProductInput = z.infer<typeof productInputSchema>;

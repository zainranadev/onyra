import { z } from "zod";

export const orderInputSchema = z.object({
  customer: z.object({
    fullName: z.string().min(2, "Full name is required"),
    email: z.string().email("Enter a valid email"),
    phone: z.string().min(6, "Enter a valid phone number"),
  }),
  shippingAddress: z.object({
    address: z.string().min(3, "Address is required"),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State / province is required"),
    postalCode: z.string().min(1, "Postal code is required"),
    country: z.string().min(1, "Country is required"),
  }),
  deliveryMethod: z.enum(["standard", "express"]).default("standard"),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.coerce.number().int().min(1),
      })
    )
    .min(1, "Cart is empty"),
  couponCode: z.string().optional(),
});

export type OrderInput = z.infer<typeof orderInputSchema>;

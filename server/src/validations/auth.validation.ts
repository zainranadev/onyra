import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(80, "Name too long"),
  email: z.string().trim().email("Please provide a valid email address").toLowerCase(),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const loginSchema = z.object({
  email: z.string().trim().email("Please provide a valid email address").toLowerCase(),
  password: z.string().min(1, "Password is required"),
});

export const updateProfileSchema = z.object({
  name:  z.string().trim().min(2, "Name must be at least 2 characters").max(80).optional(),
  email: z.string().trim().email("Please provide a valid email address").toLowerCase().optional(),
  phone: z.string().trim().max(30, "Phone number too long").optional(),
  address: z.object({
    street:   z.string().trim().max(200).optional(),
    city:     z.string().trim().max(100).optional(),
    district: z.string().trim().max(100).optional(),
    province: z.string().trim().max(100).optional(),
  }).optional(),
});

export const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
});

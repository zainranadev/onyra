import { Request, Response } from "express";
import User from "../models/User";
import { asyncHandler } from "../middleware/asyncHandler";
import { ApiError } from "../middleware/errorHandler";
import { ok, created } from "../utils/apiResponse";
import { generateToken } from "../utils/jwt";
import {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  updatePasswordSchema,
} from "../validations/auth.validation";

function sanitizeUser(user: any) {
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    phone: user.phone,
    address: user.address,
    createdAt: user.createdAt,
  };
}

export const register = asyncHandler(async (req: Request, res: Response) => {
  const input = registerSchema.parse(req.body);

  const existing = await User.findOne({ email: input.email });
  if (existing) {
    throw new ApiError("An account with this email address already exists.", 409, "EMAIL_EXISTS");
  }

  // Role is determined server-side only — never trust client input.
  // If the registering email matches the hard-coded ADMIN_EMAIL env var, grant admin.
  const adminEmail = (process.env.ADMIN_EMAIL || "").toLowerCase().trim();
  const role = input.email.toLowerCase() === adminEmail ? "admin" : "customer";

  const user = await User.create({
    name: input.name,
    email: input.email,
    password: input.password,
    role,
  });

  const token = generateToken(user);
  created(res, { user: sanitizeUser(user), token }, "Registration successful");
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const input = loginSchema.parse(req.body);

  const user = await User.findOne({ email: input.email }).select("+password");
  if (!user) {
    throw new ApiError("Invalid email or password.", 401, "INVALID_CREDENTIALS");
  }

  const isMatch = await user.comparePassword(input.password);
  if (!isMatch) {
    throw new ApiError("Invalid email or password.", 401, "INVALID_CREDENTIALS");
  }

  const token = generateToken(user);
  ok(res, { user: sanitizeUser(user), token }, "Login successful");
});

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError("Not authenticated", 401, "UNAUTHORIZED");
  }
  ok(res, sanitizeUser(req.user), "User profile fetched successfully");
});

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError("Not authenticated", 401, "UNAUTHORIZED");
  }

  const input = updateProfileSchema.parse(req.body);

  if (input.email && input.email !== req.user.email) {
    // Prevent non-admins from claiming the admin email to escalate privileges.
    const adminEmail = (process.env.ADMIN_EMAIL || "").toLowerCase().trim();
    if (input.email.toLowerCase() === adminEmail && req.user.role !== "admin") {
      throw new ApiError("That email address is not available.", 400, "EMAIL_RESERVED");
    }

    const existing = await User.findOne({ email: input.email, _id: { $ne: req.user._id } });
    if (existing) {
      throw new ApiError("An account with this email address already exists.", 409, "EMAIL_EXISTS");
    }
    req.user.email = input.email;
  }

  if (input.name) req.user.name = input.name;
  if (input.phone !== undefined) (req.user as any).phone = input.phone;
  if (input.address !== undefined) (req.user as any).address = input.address;

  await req.user.save();
  ok(res, sanitizeUser(req.user), "Profile updated successfully");
});

export const updatePassword = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError("Not authenticated", 401, "UNAUTHORIZED");
  }

  const input = updatePasswordSchema.parse(req.body);

  // We need to fetch password explicitly since it is select: false
  const user = await User.findById(req.user._id).select("+password");
  if (!user) {
    throw new ApiError("User not found", 404, "USER_NOT_FOUND");
  }

  const isMatch = await user.comparePassword(input.currentPassword);
  if (!isMatch) {
    throw new ApiError("Incorrect current password.", 400, "INVALID_CURRENT_PASSWORD");
  }

  user.password = input.newPassword;
  await user.save();

  ok(res, null, "Password changed successfully");
});

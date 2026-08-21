import { Request, Response, NextFunction } from "express";
import User, { IUser } from "../models/User";
import { verifyToken } from "../utils/jwt";
import { ApiError } from "./errorHandler";

// Extend Express Request interface to hold user
declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

export async function requireAuth(req: Request, _res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next(new ApiError("Authentication required. Please log in.", 401, "UNAUTHORIZED"));
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return next(new ApiError("Authentication required. Please log in.", 401, "UNAUTHORIZED"));
    }

    const decoded = verifyToken(token);
    const user = await User.findById(decoded.userId);
    if (!user) {
      return next(new ApiError("User account no longer exists.", 401, "UNAUTHORIZED"));
    }

    req.user = user;
    next();
  } catch (err: any) {
    if (err.name === "TokenExpiredError") {
      return next(new ApiError("Session expired. Please log in again.", 401, "TOKEN_EXPIRED"));
    }
    return next(new ApiError("Invalid authentication token.", 401, "INVALID_TOKEN"));
  }
}

export async function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      if (token) {
        const decoded = verifyToken(token);
        const user = await User.findById(decoded.userId);
        if (user) {
          req.user = user;
        }
      }
    }
  } catch {
    // Ignore invalid tokens for optional auth and continue as guest
  }
  next();
}

export function adminOnly(req: Request, _res: Response, next: NextFunction) {
  if (!req.user) {
    return next(new ApiError("Authentication required.", 401, "UNAUTHORIZED"));
  }
  if (req.user.role !== "admin") {
    return next(new ApiError("Access denied. Admin privileges required.", 403, "FORBIDDEN"));
  }
  next();
}

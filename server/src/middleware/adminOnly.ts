import { Request, Response, NextFunction } from "express";
import { ApiError } from "./errorHandler";

// Placeholder role gate. In this build authentication is scaffolded but not
// wired to real sessions/JWT - see README "Future improvements". Wiring a
// real auth flow means: verify a JWT/session here, attach req.user, and
// check req.user.role === "admin" before calling next().
export function adminOnly(req: Request, _res: Response, next: NextFunction) {
  const role = req.header("x-demo-role");
  if (role !== "admin") {
    return next(new ApiError("Admin access required.", 403, "FORBIDDEN"));
  }
  next();
}

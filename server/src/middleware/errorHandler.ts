import { Request, Response, NextFunction } from "express";

export class ApiError extends Error {
  status: number;
  code: string;
  constructor(message: string, status = 400, code = "BAD_REQUEST") {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
    error: "ROUTE_NOT_FOUND",
  });
}

// Centralized error handler - every controller funnels here via asyncHandler/next(err).
export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  const status = err instanceof ApiError ? err.status : err.status || 500;
  const code = err instanceof ApiError ? err.code : err.code || "SERVER_ERROR";
  const message = err.message || "Something went wrong on our end.";

  if (process.env.NODE_ENV !== "production") {
    console.error(err);
  }

  res.status(status).json({ success: false, message, error: code });
}

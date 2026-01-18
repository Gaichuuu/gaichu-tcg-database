import type { Request, Response, NextFunction } from "express";
import { createErrorResponse, ErrorCodes } from "../utils/index.js";

export interface ApiError extends Error {
  statusCode?: number;
  code?: string;
}

export function errorHandler(
  err: ApiError,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  console.error("API Error:", err);

  const statusCode = err.statusCode || 500;
  const code = err.code || ErrorCodes.INTERNAL_ERROR;
  const message = err.message || "An unexpected error occurred";

  res.status(statusCode).json(createErrorResponse(code, message));
}

export function notFoundHandler(_req: Request, res: Response): void {
  res
    .status(404)
    .json(createErrorResponse(ErrorCodes.NOT_FOUND, "Endpoint not found"));
}

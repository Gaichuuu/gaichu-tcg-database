import rateLimit from "express-rate-limit";
import { createErrorResponse, ErrorCodes } from "../utils/index.js";

// Rate limit: 100 requests per minute per IP
export const rateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per window
  standardHeaders: true, // Return rate limit info in headers
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json(
      createErrorResponse(
        ErrorCodes.RATE_LIMIT_EXCEEDED,
        "Too many requests, please try again later",
      ),
    );
  },
  keyGenerator: (req) => {
    // Use X-Forwarded-For header (set by Firebase/Cloud Run) or fallback to IP
    return (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim()
      || req.ip
      || "unknown";
  },
});

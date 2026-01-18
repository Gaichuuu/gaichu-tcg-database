import type { Request, Response, NextFunction } from "express";

// Cache responses for 5 minutes (300 seconds)
// stale-while-revalidate allows serving stale content while fetching fresh
export function cacheHeaders(_req: Request, res: Response, next: NextFunction): void {
  res.set("Cache-Control", "public, max-age=300, stale-while-revalidate=60");
  next();
}

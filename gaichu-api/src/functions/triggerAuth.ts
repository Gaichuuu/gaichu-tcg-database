import type { Request } from "firebase-functions/v2/https";
import { timingSafeEqual } from "node:crypto";

export function isTriggerAuthorized(req: Request, expected: string): boolean {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) return false;
  if (!expected) return false;
  const provided = Buffer.from(authHeader.slice(7));
  const secret = Buffer.from(expected);
  if (provided.length !== secret.length) return false;
  return timingSafeEqual(provided, secret);
}

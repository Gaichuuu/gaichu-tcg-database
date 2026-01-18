import { Router } from "express";
import type { Request, Response } from "express";
import { getStats } from "../services/statsService.js";
import { createItemResponse } from "../utils/index.js";

const router = Router();

// GET /stats - Get database statistics
router.get("/", (_req: Request, res: Response) => {
  const stats = getStats();
  res.json(createItemResponse(stats));
});

export default router;

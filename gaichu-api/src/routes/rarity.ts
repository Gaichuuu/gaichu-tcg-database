import { Router } from "express";
import type { Request, Response } from "express";
import { getAllRarity, getRarityById } from "../services/rarityService.js";
import {
  createListResponse,
  createItemResponse,
  createErrorResponse,
  ErrorCodes,
  parseStringParam,
  parsePaginationQuery,
} from "../utils/index.js";

const router = Router();

// GET /rarity - List all rarity types
router.get("/", (req: Request, res: Response) => {
  const series = parseStringParam(req.query.series);
  const { limit, offset } = parsePaginationQuery(req.query);

  const result = getAllRarity({ series, limit, offset });
  res.json(createListResponse(result.data, result.pagination));
});

// GET /rarity/:id - Get a single rarity by ID
router.get("/:id", (req: Request, res: Response) => {
  const rarity = getRarityById(req.params.id);
  if (!rarity) {
    res
      .status(404)
      .json(createErrorResponse(ErrorCodes.NOT_FOUND, "Rarity not found"));
    return;
  }
  res.json(createItemResponse(rarity));
});

export default router;

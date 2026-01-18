import { Router } from "express";
import type { Request, Response } from "express";
import { getAllSets, getSetById } from "../services/setService.js";
import { getCardsBySet } from "../services/cardService.js";
import {
  createListResponse,
  createItemResponse,
  createErrorResponse,
  ErrorCodes,
  parseStringParam,
  parsePaginationQuery,
  parseCardListQuery,
} from "../utils/index.js";

const router = Router();

// GET /sets - List all sets
router.get("/", (req: Request, res: Response) => {
  const series = parseStringParam(req.query.series);
  const { limit, offset } = parsePaginationQuery(req.query);

  const result = getAllSets({ series, limit, offset });
  res.json(createListResponse(result.data, result.pagination));
});

// GET /sets/:id - Get a single set by ID
router.get("/:id", (req: Request, res: Response) => {
  const set = getSetById(req.params.id);
  if (!set) {
    res
      .status(404)
      .json(createErrorResponse(ErrorCodes.NOT_FOUND, "Set not found"));
    return;
  }
  res.json(createItemResponse(set));
});

// GET /sets/:id/cards - Get all cards in a set
router.get("/:id/cards", (req: Request, res: Response) => {
  const set = getSetById(req.params.id);
  if (!set) {
    res
      .status(404)
      .json(createErrorResponse(ErrorCodes.NOT_FOUND, "Set not found"));
    return;
  }

  const params = parseCardListQuery(req.query);
  const result = getCardsBySet(set.short_name, params);
  res.json(createListResponse(result.data, result.pagination));
});

export default router;

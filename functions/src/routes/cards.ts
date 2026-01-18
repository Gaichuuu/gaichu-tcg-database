import { Router } from "express";
import type { Request, Response } from "express";
import {
  getAllCards,
  getCardById,
  searchCards,
} from "../services/cardService.js";
import type { CardQueryParams } from "../types/api.js";
import {
  createListResponse,
  createItemResponse,
  createErrorResponse,
  ErrorCodes,
  parseStringParam,
  parseIntParam,
  parseLocale,
  parseSort,
  parseOrder,
} from "../utils/index.js";

const router = Router();

function parseCardQueryParams(query: Request["query"]): CardQueryParams {
  return {
    series: parseStringParam(query.series),
    set: parseStringParam(query.set),
    rarity: parseStringParam(query.rarity),
    type: parseStringParam(query.type),
    illustrator: parseStringParam(query.illustrator),
    name: parseStringParam(query.name),
    locale: parseLocale(query.locale),
    limit: parseIntParam(query.limit),
    offset: parseIntParam(query.offset),
    sort: parseSort(query.sort),
    order: parseOrder(query.order),
  };
}

// GET /cards - List all cards with filtering and pagination
router.get("/", (req: Request, res: Response) => {
  const params = parseCardQueryParams(req.query);
  const result = getAllCards(params);
  res.json(createListResponse(result.data, result.pagination));
});

// GET /cards/search - Search cards by query string
router.get("/search", (req: Request, res: Response) => {
  const q = parseStringParam(req.query.q);
  if (!q) {
    res
      .status(400)
      .json(
        createErrorResponse(
          ErrorCodes.BAD_REQUEST,
          "Query parameter 'q' is required",
        ),
      );
    return;
  }

  const params = parseCardQueryParams(req.query);
  const result = searchCards(q, params);
  res.json(createListResponse(result.data, result.pagination));
});

// GET /cards/:id - Get a single card by ID
router.get("/:id", (req: Request, res: Response) => {
  const card = getCardById(req.params.id);
  if (!card) {
    res
      .status(404)
      .json(createErrorResponse(ErrorCodes.NOT_FOUND, "Card not found"));
    return;
  }
  res.json(createItemResponse(card));
});

export default router;

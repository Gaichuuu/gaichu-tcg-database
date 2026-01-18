import { Router } from "express";
import type { Request, Response } from "express";
import { getAllSeries, getSeriesByShortName } from "../services/seriesService.js";
import { getSetsBySeries } from "../services/setService.js";
import { getCardsBySeries } from "../services/cardService.js";
import {
  createListResponse,
  createItemResponse,
  createErrorResponse,
  ErrorCodes,
  parsePaginationQuery,
  parseCardListQuery,
} from "../utils/index.js";

const router = Router();

// GET /series - List all series
router.get("/", (req: Request, res: Response) => {
  const { limit, offset } = parsePaginationQuery(req.query);
  const result = getAllSeries({ limit, offset });
  res.json(createListResponse(result.data, result.pagination));
});

// GET /series/:shortName - Get a single series by short_name
router.get("/:shortName", (req: Request, res: Response) => {
  const series = getSeriesByShortName(req.params.shortName);
  if (!series) {
    res
      .status(404)
      .json(createErrorResponse(ErrorCodes.NOT_FOUND, "Series not found"));
    return;
  }
  res.json(createItemResponse(series));
});

// GET /series/:shortName/sets - Get all sets in a series
router.get("/:shortName/sets", (req: Request, res: Response) => {
  const series = getSeriesByShortName(req.params.shortName);
  if (!series) {
    res
      .status(404)
      .json(createErrorResponse(ErrorCodes.NOT_FOUND, "Series not found"));
    return;
  }

  const { limit, offset } = parsePaginationQuery(req.query);
  const result = getSetsBySeries(req.params.shortName, { limit, offset });
  res.json(createListResponse(result.data, result.pagination));
});

// GET /series/:shortName/cards - Get all cards in a series
router.get("/:shortName/cards", (req: Request, res: Response) => {
  const series = getSeriesByShortName(req.params.shortName);
  if (!series) {
    res
      .status(404)
      .json(createErrorResponse(ErrorCodes.NOT_FOUND, "Series not found"));
    return;
  }

  const params = parseCardListQuery(req.query);
  const result = getCardsBySeries(req.params.shortName, params);
  res.json(createListResponse(result.data, result.pagination));
});

export default router;

import { Router } from "express";
import type { Request, Response } from "express";
import {
  getAllIllustrators,
  getIllustratorById,
} from "../services/illustratorService.js";
import { getCardsByIllustrator } from "../services/cardService.js";
import {
  createListResponse,
  createItemResponse,
  createErrorResponse,
  ErrorCodes,
  parsePaginationQuery,
  parseCardListQuery,
} from "../utils/index.js";

const router = Router();

// GET /illustrators - List all illustrators
router.get("/", (req: Request, res: Response) => {
  const { limit, offset } = parsePaginationQuery(req.query);
  const result = getAllIllustrators({ limit, offset });
  res.json(createListResponse(result.data, result.pagination));
});

// GET /illustrators/:id - Get a single illustrator by ID
router.get("/:id", (req: Request, res: Response) => {
  const illustrator = getIllustratorById(req.params.id);
  if (!illustrator) {
    res
      .status(404)
      .json(createErrorResponse(ErrorCodes.NOT_FOUND, "Illustrator not found"));
    return;
  }
  res.json(createItemResponse(illustrator));
});

// GET /illustrators/:id/cards - Get all cards by an illustrator
router.get("/:id/cards", (req: Request, res: Response) => {
  const illustrator = getIllustratorById(req.params.id);
  if (!illustrator) {
    res
      .status(404)
      .json(createErrorResponse(ErrorCodes.NOT_FOUND, "Illustrator not found"));
    return;
  }

  const params = parseCardListQuery(req.query);
  const result = getCardsByIllustrator(illustrator.name, params);
  res.json(createListResponse(result.data, result.pagination));
});

export default router;

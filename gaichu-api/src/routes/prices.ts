import { Router } from "express";
import type { Request, Response } from "express";
import { getCardPrice, getCardPrices } from "../services/priceService.js";
import {
  createItemResponse,
  createListResponse,
  createErrorResponse,
  ErrorCodes,
  parseStringParam,
} from "../utils/index.js";

const router = Router();

// GET /prices/:cardId - Get price for a single card
router.get("/:cardId", async (req: Request, res: Response) => {
  try {
    const price = await getCardPrice(req.params.cardId);
    if (!price) {
      res
        .status(404)
        .json(
          createErrorResponse(
            ErrorCodes.NOT_FOUND,
            "Price data not found for this card",
          ),
        );
      return;
    }
    res.json(createItemResponse(price));
  } catch (error) {
    console.error("Error fetching card price:", error);
    res
      .status(500)
      .json(
        createErrorResponse(
          ErrorCodes.INTERNAL_ERROR,
          "Failed to fetch price data",
        ),
      );
  }
});

// GET /prices - Get prices for cards in a series/set
router.get("/", async (req: Request, res: Response) => {
  try {
    const series = parseStringParam(req.query.series);
    const set = parseStringParam(req.query.set);

    const prices = await getCardPrices(series, set);
    res.json(
      createListResponse(prices, {
        totalItems: prices.length,
        limit: prices.length,
        offset: 0,
        hasMore: false,
      }),
    );
  } catch (error) {
    console.error("Error fetching card prices:", error);
    res
      .status(500)
      .json(
        createErrorResponse(
          ErrorCodes.INTERNAL_ERROR,
          "Failed to fetch price data",
        ),
      );
  }
});

export default router;

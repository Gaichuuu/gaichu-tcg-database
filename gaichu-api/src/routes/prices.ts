import { Router } from "express";
import type { Request, Response } from "express";
import {
  getCardPrice,
  getCardPrices,
  getLastSyncLog,
  getRecentSyncLogs,
} from "../services/priceService.js";
import {
  createItemResponse,
  createListResponse,
  createErrorResponse,
  ErrorCodes,
  parseStringParam,
} from "../utils/index.js";

const router = Router();

// GET /prices/sync/status - Get last sync status
router.get("/sync/status", async (_req: Request, res: Response) => {
  try {
    const lastSync = await getLastSyncLog();
    if (!lastSync) {
      res.json(
        createItemResponse({
          message: "No sync runs recorded yet",
          lastSync: null,
        }),
      );
      return;
    }
    res.json(createItemResponse(lastSync));
  } catch (error) {
    console.error("Error fetching sync status:", error);
    res
      .status(500)
      .json(
        createErrorResponse(
          ErrorCodes.INTERNAL_ERROR,
          "Failed to fetch sync status",
        ),
      );
  }
});

// GET /prices/sync/history - Get recent sync history
router.get("/sync/history", async (req: Request, res: Response) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 10, 50);
    const logs = await getRecentSyncLogs(limit);
    res.json(
      createListResponse(logs, {
        totalItems: logs.length,
        limit,
        offset: 0,
        hasMore: false,
      }),
    );
  } catch (error) {
    console.error("Error fetching sync history:", error);
    res
      .status(500)
      .json(
        createErrorResponse(
          ErrorCodes.INTERNAL_ERROR,
          "Failed to fetch sync history",
        ),
      );
  }
});

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

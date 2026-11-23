import { Router } from "express";
import type { Request, Response } from "express";
import {
  createItemResponse,
  createListResponse,
  createErrorResponse,
  ErrorCodes,
  parseStringParam,
} from "../utils/index.js";

/**
 *
 *   GET /sync/status        last sync run
 *   GET /sync/history       recent sync runs (?limit=, max 50)
 *   GET /:id/history        weekly snapshots (?range=1M|3M|6M|12M|MAX)
 *   GET /:id                current price summary
 *   GET /                   all price summaries (?series=, plus extra filters)
 */
export interface PriceRouterConfig<Summary, Snapshot, Log> {
  noun: string;
  idField: "card_id" | "set_id";
  getOne: (id: string) => Promise<Summary | null>;
  getMany: (query: Request["query"]) => Promise<Summary[]>;
  getHistory: (id: string, fromDate?: string) => Promise<Snapshot[]>;
  getLastLog: () => Promise<Log | null>;
  getRecentLogs: (limit: number) => Promise<Log[]>;
}

export function rangeToFromDate(range: string, now: Date): string | undefined {
  const months: Record<string, number> = {
    "1M": 1,
    "3M": 3,
    "6M": 6,
    "12M": 12,
  };
  if (range === "MAX" || !(range in months)) return undefined;
  const d = new Date(now);
  d.setMonth(d.getMonth() - months[range]);
  return d.toISOString().slice(0, 10);
}

function fail(res: Response, what: string, error: unknown): void {
  console.error(`Error fetching ${what}:`, error);
  res
    .status(500)
    .json(
      createErrorResponse(ErrorCodes.INTERNAL_ERROR, `Failed to fetch ${what}`),
    );
}

export function createPriceRouter<Summary, Snapshot, Log>(
  cfg: PriceRouterConfig<Summary, Snapshot, Log>,
): Router {
  const router = Router();
  const { noun } = cfg;

  router.get("/sync/status", async (_req: Request, res: Response) => {
    try {
      const lastSync = await cfg.getLastLog();
      res.json(
        createItemResponse(
          lastSync ?? {
            message: `No ${noun} sync runs recorded yet`,
            lastSync: null,
          },
        ),
      );
    } catch (error) {
      fail(res, `${noun} sync status`, error);
    }
  });

  router.get("/sync/history", async (req: Request, res: Response) => {
    try {
      const limit = Math.min(parseInt(req.query.limit as string) || 10, 50);
      const logs = await cfg.getRecentLogs(limit);
      res.json(
        createListResponse(logs, {
          totalItems: logs.length,
          limit,
          offset: 0,
          hasMore: false,
        }),
      );
    } catch (error) {
      fail(res, `${noun} sync history`, error);
    }
  });

  router.get("/:id/history", async (req: Request, res: Response) => {
    try {
      const range = parseStringParam(req.query.range) || "MAX";
      const fromDate = rangeToFromDate(range, new Date());
      const snapshots = await cfg.getHistory(req.params.id, fromDate);
      res.json(
        createItemResponse({ [cfg.idField]: req.params.id, range, snapshots }),
      );
    } catch (error) {
      fail(res, `${noun} price history`, error);
    }
  });

  router.get("/:id", async (req: Request, res: Response) => {
    try {
      const price = await cfg.getOne(req.params.id);
      if (!price) {
        res
          .status(404)
          .json(
            createErrorResponse(
              ErrorCodes.NOT_FOUND,
              `Price data not found for this ${noun}`,
            ),
          );
        return;
      }
      res.json(createItemResponse(price));
    } catch (error) {
      fail(res, `${noun} price`, error);
    }
  });

  router.get("/", async (req: Request, res: Response) => {
    try {
      const prices = await cfg.getMany(req.query);
      res.json(
        createListResponse(prices, {
          totalItems: prices.length,
          limit: prices.length,
          offset: 0,
          hasMore: false,
        }),
      );
    } catch (error) {
      fail(res, `${noun} prices`, error);
    }
  });

  return router;
}

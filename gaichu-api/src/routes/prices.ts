import {
  getCardPrice,
  getCardPrices,
  getLastSyncLog,
  getRecentSyncLogs,
  getWeeklyPriceHistory,
} from "../services/priceService.js";
import { parseStringParam } from "../utils/index.js";
import { createPriceRouter } from "./priceRouter.js";

export default createPriceRouter({
  noun: "card",
  idField: "card_id",
  getOne: getCardPrice,
  getMany: (q) =>
    getCardPrices(parseStringParam(q.series), parseStringParam(q.set)),
  getHistory: getWeeklyPriceHistory,
  getLastLog: getLastSyncLog,
  getRecentLogs: getRecentSyncLogs,
});

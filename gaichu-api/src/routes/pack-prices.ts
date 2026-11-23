import {
  getPackPrice,
  getPackPrices,
  getLastPackSyncLog,
  getRecentPackSyncLogs,
  getWeeklyPackHistory,
} from "../services/packPriceService.js";
import { parseStringParam } from "../utils/index.js";
import { createPriceRouter } from "./priceRouter.js";

export default createPriceRouter({
  noun: "pack",
  idField: "set_id",
  getOne: getPackPrice,
  getMany: (q) => getPackPrices(parseStringParam(q.series)),
  getHistory: getWeeklyPackHistory,
  getLastLog: getLastPackSyncLog,
  getRecentLogs: getRecentPackSyncLogs,
});

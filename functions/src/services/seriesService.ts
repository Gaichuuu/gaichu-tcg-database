import { loadSeries } from "./dataLoader.js";
import type { Series } from "../types/series.js";
import type { PaginationInfo } from "../types/api.js";
import { parsePaginationParams, applyPagination } from "../utils/index.js";

export function getAllSeries(query: {
  limit?: number;
  offset?: number;
}): { data: Series[]; pagination: PaginationInfo } {
  const series = loadSeries();
  const sorted = [...series].sort((a, b) => a.sort_by - b.sort_by);
  const paginationParams = parsePaginationParams({
    limit: query.limit?.toString(),
    offset: query.offset?.toString(),
  });
  return applyPagination(sorted, paginationParams);
}

export function getSeriesByShortName(shortName: string): Series | undefined {
  const series = loadSeries();
  return series.find((s) => s.short_name === shortName);
}

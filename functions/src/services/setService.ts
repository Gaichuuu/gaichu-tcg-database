import { loadSets } from "./dataLoader.js";
import type { Set } from "../types/set.js";
import type { SetQueryParams, PaginationInfo } from "../types/api.js";
import { parsePaginationParams, applyPagination } from "../utils/index.js";

export function getAllSets(query: SetQueryParams): {
  data: Set[];
  pagination: PaginationInfo;
} {
  let sets = loadSets();

  if (query.series) {
    sets = sets.filter((s) => s.series_short_name === query.series);
  }

  const sorted = [...sets].sort((a, b) => a.sort_by - b.sort_by);
  const paginationParams = parsePaginationParams({
    limit: query.limit?.toString(),
    offset: query.offset?.toString(),
  });
  return applyPagination(sorted, paginationParams);
}

export function getSetById(id: string): Set | undefined {
  const sets = loadSets();
  return sets.find((s) => s.id === id);
}

export function getSetByShortName(
  seriesShortName: string,
  setShortName: string,
): Set | undefined {
  const sets = loadSets();
  return sets.find(
    (s) =>
      s.series_short_name === seriesShortName && s.short_name === setShortName,
  );
}

export function getSetsBySeries(
  seriesShortName: string,
  query: { limit?: number; offset?: number },
): { data: Set[]; pagination: PaginationInfo } {
  return getAllSets({ ...query, series: seriesShortName });
}

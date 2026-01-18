import { loadRarity } from "./dataLoader.js";
import type { Rarity } from "../types/rarity.js";
import type { PaginationInfo } from "../types/api.js";
import { parsePaginationParams, applyPagination } from "../utils/index.js";

export function getAllRarity(query: {
  series?: string;
  limit?: number;
  offset?: number;
}): { data: Rarity[]; pagination: PaginationInfo } {
  let rarities = loadRarity();

  if (query.series) {
    rarities = rarities.filter((r) => r.series_short_name === query.series);
  }

  const sorted = [...rarities].sort((a, b) => a.name.localeCompare(b.name));
  const paginationParams = parsePaginationParams({
    limit: query.limit?.toString(),
    offset: query.offset?.toString(),
  });
  return applyPagination(sorted, paginationParams);
}

export function getRarityById(id: string): Rarity | undefined {
  const rarities = loadRarity();
  return rarities.find((r) => r.id === id);
}

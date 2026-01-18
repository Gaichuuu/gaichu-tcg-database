import { loadIllustrators } from "./dataLoader.js";
import type { Illustrator } from "../types/illustrator.js";
import type { PaginationInfo } from "../types/api.js";
import { parsePaginationParams, applyPagination } from "../utils/index.js";

export function getAllIllustrators(query: {
  limit?: number;
  offset?: number;
}): { data: Illustrator[]; pagination: PaginationInfo } {
  const illustrators = loadIllustrators();
  const sorted = [...illustrators].sort((a, b) => a.name.localeCompare(b.name));
  const paginationParams = parsePaginationParams({
    limit: query.limit?.toString(),
    offset: query.offset?.toString(),
  });
  return applyPagination(sorted, paginationParams);
}

export function getIllustratorById(id: string): Illustrator | undefined {
  const illustrators = loadIllustrators();
  return illustrators.find((i) => i.id === id);
}

export function getIllustratorByName(name: string): Illustrator | undefined {
  const illustrators = loadIllustrators();
  return illustrators.find((i) => i.name.toLowerCase() === name.toLowerCase());
}

import type { PaginationParams, PaginationInfo } from "../types/index.js";

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

export function parsePaginationParams(query: {
  limit?: string;
  offset?: string;
}): PaginationParams {
  let limit = parseInt(query.limit || String(DEFAULT_LIMIT), 10);
  let offset = parseInt(query.offset || "0", 10);

  if (isNaN(limit) || limit < 1) {
    limit = DEFAULT_LIMIT;
  }
  if (limit > MAX_LIMIT) {
    limit = MAX_LIMIT;
  }

  if (isNaN(offset) || offset < 0) {
    offset = 0;
  }

  return { limit, offset };
}

export function applyPagination<T>(
  items: T[],
  params: PaginationParams,
): { data: T[]; pagination: PaginationInfo } {
  const { limit, offset } = params;
  const totalItems = items.length;
  const paginatedData = items.slice(offset, offset + limit);
  const hasMore = offset + limit < totalItems;

  return {
    data: paginatedData,
    pagination: {
      totalItems,
      limit,
      offset,
      hasMore,
    },
  };
}

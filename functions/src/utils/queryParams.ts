import type { CardQueryParams } from "../types/api.js";

export function parseStringParam(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

export function parseIntParam(value: unknown): number | undefined {
  if (typeof value !== "string") return undefined;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? undefined : parsed;
}

export function parseLocale(value: unknown): "en" | "ja" {
  return value === "ja" ? "ja" : "en";
}

export function parseSort(value: unknown): CardQueryParams["sort"] {
  const validSorts = ["name", "number", "sort_by"];
  return validSorts.includes(value as string)
    ? (value as CardQueryParams["sort"])
    : "sort_by";
}

export function parseOrder(value: unknown): CardQueryParams["order"] {
  return value === "desc" ? "desc" : "asc";
}

export function parsePaginationQuery(query: {
  limit?: unknown;
  offset?: unknown;
}): { limit?: number; offset?: number } {
  return {
    limit: parseIntParam(query.limit),
    offset: parseIntParam(query.offset),
  };
}

export function parseCardListQuery(query: {
  locale?: unknown;
  limit?: unknown;
  offset?: unknown;
  sort?: unknown;
  order?: unknown;
}): CardQueryParams {
  return {
    locale: parseLocale(query.locale),
    limit: parseIntParam(query.limit),
    offset: parseIntParam(query.offset),
    sort: parseSort(query.sort),
    order: parseOrder(query.order),
  };
}

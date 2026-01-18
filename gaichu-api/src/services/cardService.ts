import { loadAllCards } from "./dataLoader.js";
import type { Card, I18nMap } from "../types/card.js";
import type { CardQueryParams, PaginationInfo } from "../types/api.js";
import { parsePaginationParams, applyPagination } from "../utils/index.js";

function getLocalizedName(
  name: I18nMap | string,
  locale: "en" | "ja" = "en",
): string {
  if (typeof name === "string") return name;
  return name[locale] || name.en || "";
}

function matchesFilter(card: Card, params: CardQueryParams): boolean {
  if (params.series && card.series_short_name !== params.series) {
    return false;
  }
  if (params.set && card.set_short_name !== params.set) {
    return false;
  }
  if (
    params.rarity &&
    card.rarity.toLowerCase() !== params.rarity.toLowerCase()
  ) {
    return false;
  }
  if (
    params.type &&
    card.type?.toLowerCase() !== params.type.toLowerCase()
  ) {
    return false;
  }
  if (params.illustrator) {
    const illustratorLower = params.illustrator.toLowerCase();
    const hasIllustrator = card.illustrators.some(
      (i) => i.toLowerCase() === illustratorLower,
    );
    if (!hasIllustrator) return false;
  }
  if (params.name) {
    const searchName = params.name.toLowerCase();
    const cardName = getLocalizedName(card.name, params.locale).toLowerCase();
    if (!cardName.includes(searchName)) return false;
  }
  return true;
}

function sortCards(
  cards: Card[],
  sort: CardQueryParams["sort"] = "sort_by",
  order: CardQueryParams["order"] = "asc",
  locale: "en" | "ja" = "en",
): Card[] {
  const sorted = [...cards];
  sorted.sort((a, b) => {
    let comparison = 0;
    switch (sort) {
      case "name": {
        const nameA = getLocalizedName(a.name, locale);
        const nameB = getLocalizedName(b.name, locale);
        comparison = nameA.localeCompare(nameB);
        break;
      }
      case "number":
        comparison = a.number - b.number;
        break;
      case "sort_by":
      default:
        comparison = a.sort_by - b.sort_by;
        break;
    }
    return order === "desc" ? -comparison : comparison;
  });
  return sorted;
}

export function getAllCards(query: CardQueryParams): {
  data: Card[];
  pagination: PaginationInfo;
} {
  const cards = loadAllCards();
  const filtered = cards.filter((card) => matchesFilter(card, query));
  const sorted = sortCards(filtered, query.sort, query.order, query.locale);
  const paginationParams = parsePaginationParams({
    limit: query.limit?.toString(),
    offset: query.offset?.toString(),
  });
  return applyPagination(sorted, paginationParams);
}

export function getCardById(id: string): Card | undefined {
  const cards = loadAllCards();
  return cards.find((card) => card.id === id);
}

export function searchCards(
  searchQuery: string,
  params: CardQueryParams,
): { data: Card[]; pagination: PaginationInfo } {
  const cards = loadAllCards();
  const searchLower = searchQuery.toLowerCase();
  const locale = params.locale || "en";

  const filtered = cards.filter((card) => {
    const name = getLocalizedName(card.name, locale).toLowerCase();
    const description =
      typeof card.description === "string"
        ? card.description.toLowerCase()
        : (card.description?.[locale] || card.description?.en || "").toLowerCase();
    const effect = (card.effect || "").toLowerCase();

    const matchesSearch =
      name.includes(searchLower) ||
      description.includes(searchLower) ||
      effect.includes(searchLower);

    if (!matchesSearch) return false;
    return matchesFilter(card, params);
  });

  const sorted = sortCards(filtered, params.sort, params.order, locale);
  const paginationParams = parsePaginationParams({
    limit: params.limit?.toString(),
    offset: params.offset?.toString(),
  });
  return applyPagination(sorted, paginationParams);
}

export function getCardsBySeries(
  seriesShortName: string,
  query: CardQueryParams,
): { data: Card[]; pagination: PaginationInfo } {
  return getAllCards({ ...query, series: seriesShortName });
}

export function getCardsBySet(
  setShortName: string,
  query: CardQueryParams,
): { data: Card[]; pagination: PaginationInfo } {
  return getAllCards({ ...query, set: setShortName });
}

export function getCardsByIllustrator(
  illustratorName: string,
  query: CardQueryParams,
): { data: Card[]; pagination: PaginationInfo } {
  return getAllCards({ ...query, illustrator: illustratorName });
}

import type { CollectionCard } from "@/types/CollectionCard";
import type { SetAndCard } from "@/types/MergedCollection";
import { i18nToEnString } from "@/utils/RoutePathBuildUtils";

export type SortKey =
  | "number"
  | "name-asc"
  | "name-desc"
  | "price-asc"
  | "price-desc";

export interface BrowseFilters {
  setIds: string[] | null;
  variant: string | null;
  rarity: string | null;
  minPrice: number | null;
  maxPrice: number | null;
  q: string;
}

export const DEFAULT_FILTERS: BrowseFilters = {
  setIds: null,
  variant: null,
  rarity: null,
  minPrice: null,
  maxPrice: null,
  q: "",
};

export function flattenSeriesCards(
  setAndCards: SetAndCard[],
): CollectionCard[] {
  const byId = new Map<string, CollectionCard>();
  for (const { cards } of setAndCards) {
    for (const card of cards) {
      if (!byId.has(card.id)) byId.set(card.id, card);
    }
  }
  return [...byId.values()];
}

export function parseHp(hp: string | undefined): number {
  if (!hp) return 0;
  const n = parseInt(hp, 10);
  return Number.isNaN(n) ? 0 : n;
}

export function collectVariants(cards: CollectionCard[]): string[] {
  const set = new Set<string>();
  for (const c of cards) {
    if (c.variant) set.add(c.variant);
  }
  return [...set].sort((a, b) => a.localeCompare(b));
}

export function collectRarities(cards: CollectionCard[]): string[] {
  const set = new Set<string>();
  for (const c of cards) {
    if (c.rarity) set.add(c.rarity);
  }
  return [...set].sort((a, b) => a.localeCompare(b));
}

const nameOf = (card: CollectionCard): string =>
  i18nToEnString(card.name).toLowerCase();

function cardHaystack(card: CollectionCard): string {
  const parts: string[] = [];
  if (card.name?.en) parts.push(card.name.en);
  if (card.name?.ja) parts.push(card.name.ja);
  if (card.parody) parts.push(card.parody);
  if (card.rarity) parts.push(card.rarity);
  if (card.type) parts.push(card.type);
  if (card.variant) parts.push(card.variant);
  for (const illus of card.illustrators ?? []) parts.push(illus);
  if (card.number != null) parts.push(String(card.number));
  return parts.join(" ").toLowerCase();
}

export function matchesQuery(card: CollectionCard, q: string): boolean {
  const trimmed = q.trim().toLowerCase();
  if (!trimmed) return true;
  const hay = cardHaystack(card);
  return trimmed.split(/\s+/).every((word) => hay.includes(word));
}

const priceOf = (card: CollectionCard): number => card.average_price ?? 0;

export function inPriceRange(
  price: number | null | undefined,
  filters: Pick<BrowseFilters, "minPrice" | "maxPrice">,
): boolean {
  const p = price ?? 0;
  if (filters.minPrice != null && p < filters.minPrice) return false;
  if (filters.maxPrice != null && p > filters.maxPrice) return false;
  return true;
}

export function filterCards(
  cards: CollectionCard[],
  filters: BrowseFilters,
): CollectionCard[] {
  return cards.filter((card) => {
    const setIds = filters.setIds;
    if (
      setIds !== null &&
      !(card.set_ids ?? []).some((id) => setIds.includes(id))
    ) {
      return false;
    }
    if (filters.variant && card.variant !== filters.variant) return false;
    if (filters.rarity && card.rarity !== filters.rarity) return false;
    if (!inPriceRange(priceOf(card), filters)) return false;
    if (!matchesQuery(card, filters.q)) return false;
    return true;
  });
}

export function comparePrices(
  a: number | null | undefined,
  b: number | null | undefined,
  sort: "price-asc" | "price-desc",
): number {
  const pa = a && a > 0 ? a : null;
  const pb = b && b > 0 ? b : null;
  if (pa == null || pb == null) {
    if (pa == null && pb == null) return 0;
    return pa == null ? 1 : -1;
  }
  return sort === "price-asc" ? pa - pb : pb - pa;
}

export function sortCards(
  cards: CollectionCard[],
  sort: SortKey,
): CollectionCard[] {
  const copy = [...cards];
  switch (sort) {
    case "name-asc":
      return copy.sort((a, b) => nameOf(a).localeCompare(nameOf(b)));
    case "name-desc":
      return copy.sort((a, b) => nameOf(b).localeCompare(nameOf(a)));
    case "price-desc":
    case "price-asc":
      return copy.sort(
        (a, b) =>
          comparePrices(a.average_price, b.average_price, sort) ||
          a.sort_by - b.sort_by,
      );
    case "number":
    default:
      return copy.sort((a, b) => a.sort_by - b.sort_by);
  }
}

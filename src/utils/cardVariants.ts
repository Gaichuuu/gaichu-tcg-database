import type { CollectionCard } from "@/types/CollectionCard";
import { i18nToEnString } from "@/utils/RoutePathBuildUtils";

export function isHolo(card: CollectionCard): boolean {
  return (card.variant ?? "").toLowerCase().includes("holo");
}

export function variantKey(card: CollectionCard): string {
  const name = i18nToEnString(card.name).trim().toLowerCase();
  const parody = (card.parody ?? "").trim().toLowerCase();
  return `${name}|${parody}`;
}

export function findVariants(
  allCards: CollectionCard[],
  focused: CollectionCard,
): CollectionCard[] {
  const key = variantKey(focused);
  const siblings = allCards.filter((c) => variantKey(c) === key);
  if (!siblings.some((c) => c.id === focused.id)) siblings.push(focused);
  return siblings.sort((a, b) => a.sort_by - b.sort_by);
}

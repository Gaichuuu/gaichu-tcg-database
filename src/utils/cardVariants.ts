import type { CollectionCard } from "@/types/CollectionCard";
import { i18nToEnString } from "@/utils/RoutePathBuildUtils";

export function isHolo(card: CollectionCard): boolean {
  return (card.variant ?? "").toLowerCase().includes("holo");
}

const normalize = (s: string): string =>
  s.toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");

function attackSignature(card: CollectionCard): string {
  return (card.attacks ?? [])
    .filter((a) => (a.costs?.length ?? 0) > 0 || !!a.damage)
    .map((a) => normalize(i18nToEnString(a.name)))
    .sort()
    .join(",");
}

export function variantKey(card: CollectionCard): string {
  const name = i18nToEnString(card.name).trim().toLowerCase();
  const parody = (card.parody ?? "").trim().toLowerCase();
  const hp = (card.hp ?? "").trim().toLowerCase();
  return `${name}|${parody}|${hp}|${attackSignature(card)}`;
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

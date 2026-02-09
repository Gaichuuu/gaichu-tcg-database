import { useMemo, useState, useEffect } from "react";
import { useAllCards } from "./useAllCards";
import { t, useLocale, type Locale } from "@/i18n";
import type { CollectionCard } from "@/types/CollectionCard";

const MAX_RESULTS = 20;
const DEBOUNCE_MS = 250;

export function buildSearchText(card: CollectionCard, locale: Locale): string {
  const parts: string[] = [];

  if (card.name.en) parts.push(card.name.en);
  if (card.name.ja) parts.push(card.name.ja);

  const desc = t(card.description, locale);
  if (desc) parts.push(desc);

  for (const atk of card.attacks ?? []) {
    const atkName = t(atk.name, locale);
    const atkEffect = t(atk.effect, locale);
    if (atkName) parts.push(atkName);
    if (atkEffect) parts.push(atkEffect);
  }

  if (card.parody) parts.push(card.parody);
  if (card.rarity) parts.push(card.rarity);
  if (card.type) parts.push(card.type);
  if (card.effect) parts.push(card.effect);
  if (card.note) parts.push(card.note);
  if (card.hp) parts.push(card.hp);
  if (card.color) parts.push(card.color);
  if (card.variant) parts.push(card.variant);

  for (const illus of card.illustrators ?? []) {
    parts.push(illus);
  }

  parts.push(card.series_short_name);
  parts.push(card.set_short_name);

  if (card.sets.length > 0) {
    parts.push(card.sets[0].name);
  }

  return parts.join(" ").toLowerCase();
}

export function useCardSearch(rawQuery: string): {
  results: CollectionCard[];
  isLoading: boolean;
  debouncedQuery: string;
} {
  const [debouncedQuery, setDebouncedQuery] = useState(rawQuery);
  const { cards, isLoading } = useAllCards();
  const { locale } = useLocale();

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(rawQuery), DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [rawQuery]);

  const searchIndex = useMemo(() => {
    return cards.map((card) => ({
      card,
      text: buildSearchText(card, locale),
    }));
  }, [cards, locale]);

  const results = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();
    if (!q) return [];

    const terms = q.split(/\s+/);
    const matches: CollectionCard[] = [];
    for (const entry of searchIndex) {
      if (terms.every((term) => entry.text.includes(term))) {
        matches.push(entry.card);
        if (matches.length >= MAX_RESULTS) break;
      }
    }
    return matches;
  }, [debouncedQuery, searchIndex]);

  return { results, isLoading, debouncedQuery };
}

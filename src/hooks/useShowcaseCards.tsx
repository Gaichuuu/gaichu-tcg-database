import { useMemo, useRef } from "react";
import { useQueries } from "@tanstack/react-query";
import { useSeries } from "@/hooks/useCollection";
import { fetchSets } from "@/services/CollectionSetService";
import { IS_USE_LOCAL_DATA } from "@/services/Constants";
import { getJsonSet } from "@/services/JsonCollectionSetService";
import type { CollectionCard } from "@/types/CollectionCard";

interface ShowcaseCard {
  image: string;
  series: string;
  set: string;
  sortBy: number;
  name: string;
  averagePrice?: number;
}

export function hasValidImage(card: CollectionCard): boolean {
  return !card.image.includes("*") && !card.image.endsWith("/00.jpg");
}

export function shuffle<T>(arr: T[], rng: () => number): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function toEnName(name: CollectionCard["name"]): string {
  if (typeof name === "string") return name;
  return name?.en ?? Object.values(name ?? {})[0] ?? "";
}

export function useShowcaseCards(count = 24): {
  cards: ShowcaseCard[];
  isLoading: boolean;
} {
  const { data: allSeries } = useSeries();
  const seriesNames = useMemo(
    () => allSeries?.map((s) => s.series.short_name) ?? [],
    [allSeries],
  );

  const seedRef = useRef(Math.random());

  const queries = useQueries({
    queries: seriesNames.map((name) => ({
      queryKey: IS_USE_LOCAL_DATA
        ? ["useSetsLocal", name]
        : [`SetsList_${name}`],
      queryFn: async () =>
        IS_USE_LOCAL_DATA ? getJsonSet(name) : fetchSets(name),
    })),
  });

  const isLoading =
    seriesNames.length === 0 || queries.some((q) => q.isLoading);

  const cards = useMemo(() => {
    if (isLoading) return [];

    const allCards: ShowcaseCard[] = [];
    for (const query of queries) {
      if (!query.data) continue;
      for (const setAndCard of query.data) {
        for (const card of setAndCard.cards) {
          if (!hasValidImage(card)) continue;
          allCards.push({
            image: card.image,
            series: card.series_short_name,
            set: card.set_short_name,
            sortBy: card.sort_by,
            name: toEnName(card.name),
            averagePrice: card.average_price,
          });
        }
      }
    }

    const seed = seedRef.current;
    let s = seed * 2147483647;
    const rng = () => {
      s = (s * 16807) % 2147483647;
      return (s - 1) / 2147483646;
    };

    const shuffled = shuffle(allCards, rng);
    return shuffled.slice(0, count);
  }, [isLoading, queries, count]);

  return { cards, isLoading };
}

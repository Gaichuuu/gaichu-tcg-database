import { useMemo, useRef } from "react";
import { useQueries } from "@tanstack/react-query";
import { useSeries } from "@/hooks/useCollection";
import { fetchSets } from "@/services/CollectionSetService";
import { IS_USE_LOCAL_DATA } from "@/services/Constants";
import { getJsonSet } from "@/services/JsonCollectionSetService";
import { ONE_HOUR } from "@/utils/TimeUtils";
import { i18nToEnString } from "@/utils/RoutePathBuildUtils";
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

export const toEnName = (name: CollectionCard["name"]): string =>
  i18nToEnString(name as Parameters<typeof i18nToEnString>[0]);

const SEED_KEY = "marquee_seed";
const SEED_TS_KEY = "marquee_seed_ts";

function getOrCreateSeed(): number {
  try {
    const ts = Number(sessionStorage.getItem(SEED_TS_KEY) ?? 0);
    const cached = sessionStorage.getItem(SEED_KEY);
    if (cached && Date.now() - ts < ONE_HOUR) return Number(cached);
  } catch {
    // sessionStorage unavailable
  }
  const seed = Math.random();
  try {
    sessionStorage.setItem(SEED_KEY, String(seed));
    sessionStorage.setItem(SEED_TS_KEY, String(Date.now()));
  } catch {
    // sessionStorage unavailable
  }
  return seed;
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

  const seedRef = useRef(getOrCreateSeed());

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
            name: i18nToEnString(
              card.name as Parameters<typeof i18nToEnString>[0],
            ),
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

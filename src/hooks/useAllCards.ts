import { useMemo } from "react";
import { useQueries } from "@tanstack/react-query";
import { useSeries } from "@/hooks/useCollection";
import { fetchSets } from "@/services/CollectionSetService";
import { IS_USE_LOCAL_DATA } from "@/services/Constants";
import { getJsonSet } from "@/services/JsonCollectionSetService";
import type { CollectionCard } from "@/types/CollectionCard";

export function useAllCards(): {
  cards: CollectionCard[];
  isLoading: boolean;
} {
  const { data: allSeries, isLoading: isSeriesLoading } = useSeries();
  const seriesNames = useMemo(
    () => allSeries?.map((s) => s.series.short_name) ?? [],
    [allSeries],
  );

  const combined = useQueries({
    queries: seriesNames.map((name) => ({
      queryKey: IS_USE_LOCAL_DATA
        ? ["useSetsLocal", name]
        : [`SetsList_${name}`],
      queryFn: async () =>
        IS_USE_LOCAL_DATA ? getJsonSet(name) : fetchSets(name),
    })),
    combine: (results) => ({
      data: results.map((r) => r.data),
      isLoading: results.some((r) => r.isLoading),
    }),
  });

  const isLoading = isSeriesLoading || combined.isLoading;

  const cards = useMemo(() => {
    if (isLoading) return [];
    const all: CollectionCard[] = [];
    for (const data of combined.data) {
      if (!data) continue;
      for (const setAndCard of data) {
        for (const card of setAndCard.cards) {
          all.push(card);
        }
      }
    }
    return all;
  }, [isLoading, combined.data]);

  return { cards, isLoading };
}

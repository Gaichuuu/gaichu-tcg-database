// src/hooks/useCollection.tsx
import { fetchSeries } from "@/services/CollectionSeriesService";
import { fetchSets } from "@/services/CollectionSetService";
import { IS_USE_LOCAL_DATA } from "@/services/Constants";
import { getJsonSeries } from "@/services/JsonCollectionSeriesService";
import { getJsonSet } from "@/services/JsonCollectionSetService";
import { SeriesAndSet, SetAndCard } from "@/types/MergedCollection";
import { useQuery, UseQueryResult } from "@tanstack/react-query";
export const useSeries = (): UseQueryResult<SeriesAndSet[], Error> => {
  if (IS_USE_LOCAL_DATA) {
    return useQuery<SeriesAndSet[]>({
      queryKey: ["useSeriesLocal"],
      queryFn: async () => {
        return getJsonSeries();
      },
    });
  }

  return useQuery<SeriesAndSet[]>({
    queryKey: ["useSeries"],
    queryFn: async () => {
      return fetchSeries();
    },
  });
};
export const useSets = (
  seriesShortName: string,
): UseQueryResult<SetAndCard[] | null, Error> => {
  if (IS_USE_LOCAL_DATA) {
    return useQuery<SetAndCard[] | null>({
      queryKey: ["useSetsLocal", seriesShortName],
      enabled: !!seriesShortName,
      queryFn: async () => {
        return getJsonSet(seriesShortName);
      },
    });
  }
  return useQuery<SetAndCard[]>(makeSetListQuery(seriesShortName));
};

export const useSet = (
  seriesShortName: string,
  setShortName: string,
): UseQueryResult<SetAndCard | null, Error> => {
  if (IS_USE_LOCAL_DATA) {
    return useQuery<SetAndCard | null>({
      queryKey: [`useSetLocal_${seriesShortName}_${setShortName}`],
      enabled: !!seriesShortName && !!setShortName,
      queryFn: async () => {
        const sets = getJsonSet(seriesShortName);
        return sets.find((set) => set.set.short_name === setShortName) || null;
      },
    });
  }
  return useQuery<SetAndCard | null, Error>({
    queryKey: [`useSet_${seriesShortName}_${setShortName}`],
    enabled: !!seriesShortName && !!setShortName,
    queryFn: async () => {
      const sets = await fetchSets(seriesShortName);
      return sets.find((set) => set.set.short_name === setShortName) || null;
    },
  });
};

const makeSetListQuery = (seriesShortName: string) => {
  return {
    queryKey: [`SetsList_${seriesShortName}`],
    enabled: !!seriesShortName,
    queryFn: () => fetchSets(seriesShortName!),
  };
};

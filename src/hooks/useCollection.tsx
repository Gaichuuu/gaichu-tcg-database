import { fetchSeries } from "@/services/CollectionSeriesService";
import { fetchSets } from "@/services/CollectionSetService";
import { IS_USE_LOCAL_DATA } from "@/services/Constants";
import { getJsonSeries } from "@/services/JsonCollectionSeriesService";
import { getJsonSet } from "@/services/JsonCollectionSetService";
import { SeriesAndSet, SetAndCard } from "@/types/MergedCollection";
import { useQuery, UseQueryResult } from "@tanstack/react-query";

export const useSeries = (): UseQueryResult<SeriesAndSet[], Error> => {
  return useQuery<SeriesAndSet[]>({
    queryKey: IS_USE_LOCAL_DATA ? ["useSeriesLocal"] : ["useSeries"],
    queryFn: async () => {
      return IS_USE_LOCAL_DATA ? getJsonSeries() : fetchSeries();
    },
  });
};

export const useSets = (
  seriesShortName: string,
): UseQueryResult<SetAndCard[] | null, Error> => {
  return useQuery<SetAndCard[] | null>({
    queryKey: IS_USE_LOCAL_DATA
      ? ["useSetsLocal", seriesShortName]
      : [`SetsList_${seriesShortName}`],
    enabled: !!seriesShortName,
    queryFn: async () => {
      return IS_USE_LOCAL_DATA
        ? getJsonSet(seriesShortName)
        : fetchSets(seriesShortName);
    },
  });
};

export const useSet = (
  seriesShortName: string,
  setShortName: string,
): UseQueryResult<SetAndCard | null, Error> => {
  return useQuery<SetAndCard | null, Error>({
    queryKey: IS_USE_LOCAL_DATA
      ? [`useSetLocal_${seriesShortName}_${setShortName}`]
      : [`useSet_${seriesShortName}_${setShortName}`],
    enabled: !!seriesShortName && !!setShortName,
    queryFn: async () => {
      const sets = IS_USE_LOCAL_DATA
        ? getJsonSet(seriesShortName)
        : await fetchSets(seriesShortName);
      return sets.find((set) => set.set.short_name === setShortName) || null;
    },
  });
};

export const useSeriesByShortName = (
  seriesShortName: string,
): UseQueryResult<SeriesAndSet | null, Error> => {
  return useQuery<SeriesAndSet | null, Error>({
    queryKey: IS_USE_LOCAL_DATA
      ? [`useSeriesByShortNameLocal_${seriesShortName}`]
      : [`useSeriesByShortName_${seriesShortName}`],
    enabled: !!seriesShortName,
    queryFn: async () => {
      const allSeries = IS_USE_LOCAL_DATA
        ? getJsonSeries()
        : await fetchSeries();
      return (
        allSeries.find((s) => s.series.short_name === seriesShortName) || null
      );
    },
  });
};

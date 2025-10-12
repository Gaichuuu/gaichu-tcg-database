// src/hooks/useCollection.tsx
import { THIRTY_MINUTES } from "@/utils/TimeUtils";
import { useQuery } from "@tanstack/react-query";
import { AppResult } from "@/services/AppResult";
import { fetchSeries } from "@/services/CollectionSeriesService";
import { fetchSets } from "@/services/CollectionSetService";
import { IS_USE_LOCAL_DATA } from "@/services/Constants";
import { getJsonSeries } from "@/services/JsonCollectionSeriesService";
import { getJsonSet } from "@/services/JsonCollectionSetService";
import { SeriesAndSet, SetAndCard } from "@/types/MergedCollection";
export const getSeries = (): AppResult<SeriesAndSet[], Error> => {
  const queryResult = useQuery<SeriesAndSet[]>({
    queryKey: ["SeriesList"],
    queryFn: fetchSeries,
    staleTime: THIRTY_MINUTES,
  });

  if (IS_USE_LOCAL_DATA) {
    return {
      data: getJsonSeries(),
      error: undefined,
      isLoading: false,
    };
  }

  return {
    data: queryResult.data,
    error: queryResult.error || undefined,
    isLoading: queryResult.isLoading,
  };
};

export const useSets = (
  seriesShortName?: string,
): AppResult<SetAndCard[] | null, Error> => {
  if (!seriesShortName) {
    return {
      data: null,
      error: new Error("not found"),
      isLoading: false,
    };
  }

  if (IS_USE_LOCAL_DATA) {
    return {
      data: getJsonSet(seriesShortName!),
      error: undefined,
      isLoading: false,
    };
  }
  const queryResult = useQuery<SetAndCard[]>(makeSetListQuery(seriesShortName));
  return {
    data: queryResult.data,
    error: queryResult.error || undefined,
    isLoading: queryResult.isLoading,
  };
};

export const useSet = (
  seriesShortName?: string,
  setShortName?: string,
): AppResult<SetAndCard | null, Error> => {
  if (!seriesShortName || !setShortName) {
    return {
      data: null,
      error: new Error("not found"),
      isLoading: false,
    };
  }

  if (IS_USE_LOCAL_DATA) {
    return {
      data:
        getJsonSet(seriesShortName!).find(
          (set) => set.set.short_name === setShortName,
        ) || null,
      error: undefined,
      isLoading: false,
    };
  }
  const queryResult = useQuery<SetAndCard[]>(makeSetListQuery(seriesShortName));
  return {
    data:
      queryResult.data?.find((set) => set.set.short_name === setShortName) ||
      null,
    error: queryResult.error || undefined,
    isLoading: queryResult.isLoading,
  };
};

const makeSetListQuery = (seriesShortName: string) => {
  return {
    queryKey: [`SetsList_${seriesShortName}`],
    enabled: !!seriesShortName,
    queryFn: () => fetchSets(seriesShortName!),
    staleTime: THIRTY_MINUTES,
  };
};

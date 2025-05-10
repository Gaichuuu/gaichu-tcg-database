import { useQuery } from "@tanstack/react-query";
import { fetchCardDetail, fetchCards } from "../services/CollectionCardService";
import { fetchSeries } from "../services/CollectionSeriesService";
import { fetchSets } from "../services/CollectionSetService";
import { IS_USE_LOCAL_DATA } from "../services/Constants";
import { getJsonSeries } from "../services/JsonCollectionSeriesService";
import { Result } from "../services/Result";
import { CollectionCard } from "../types/CollectionCard";
import { SeriesAndSet, SetAndCard } from "../types/MergedCollection";

export const getSeries = (): Result<SeriesAndSet[], Error> => {
  if (IS_USE_LOCAL_DATA) {
    return {
      data: getJsonSeries(),
      error: undefined,
      isLoading: false,
    };
  }

  const queryResult = useQuery<SeriesAndSet[]>({
    queryKey: ["SeriesList"],
    queryFn: fetchSeries,
    staleTime: 1000 * 60 * 5,
  });

  return {
    data: queryResult.data,
    error: queryResult.error || undefined,
    isLoading: queryResult.isLoading,
  };
};

export const getSets = (seriesShortName?: string) => {
  return useQuery<SetAndCard[]>({
    queryKey: [`SetsList_${seriesShortName}`],
    enabled: !!seriesShortName,
    queryFn: () => fetchSets(seriesShortName!),
    staleTime: 1000 * 60 * 5,
  });
};

export const getCards = (setShortName?: string) => {
  return useQuery<CollectionCard[]>({
    queryKey: [`CardsList_${setShortName}`],
    enabled: !!setShortName,
    queryFn: () => fetchCards(setShortName!),
    staleTime: 1000 * 60 * 5,
  });
};

export const getCardDetail = (cardName?: string) => {
  return useQuery<CollectionCard | null>({
    queryKey: [`CardDetail_${cardName}`],
    enabled: !!cardName,
    queryFn: () => fetchCardDetail(cardName!),
    staleTime: 1000 * 60 * 5,
  });
};

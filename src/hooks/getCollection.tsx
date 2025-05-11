import { useQuery } from "@tanstack/react-query";
import { fetchCardDetail, fetchCards } from "../services/CollectionCardService";
import { fetchSeries } from "../services/CollectionSeriesService";
import { fetchSets } from "../services/CollectionSetService";
import { IS_USE_LOCAL_DATA } from "../services/Constants";
import {
  getJsonCardDetail,
  getJsonCardList,
} from "../services/JsonCollectionCardService";
import { getJsonSeries } from "../services/JsonCollectionSeriesService";
import { getJsonSet } from "../services/JsonCollectionSetService";
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

export const getSets = (
  seriesShortName?: string,
): Result<SetAndCard[], Error> => {
  if (!seriesShortName) {
    return {
      data: [],
      error: undefined,
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

  const queryResult = useQuery<SetAndCard[]>({
    queryKey: [`SetsList_${seriesShortName}`],
    enabled: !!seriesShortName,
    queryFn: () => fetchSets(seriesShortName!),
    staleTime: 1000 * 60 * 5,
  });

  return {
    data: queryResult.data,
    error: queryResult.error || undefined,
    isLoading: queryResult.isLoading,
  };
};

export const getCards = (
  setShortName?: string,
): Result<CollectionCard[], Error> => {
  if (!setShortName) {
    return {
      data: [],
      error: undefined,
      isLoading: false,
    };
  }
  if (IS_USE_LOCAL_DATA) {
    return {
      data: getJsonCardList(setShortName!),
      error: undefined,
      isLoading: false,
    };
  }

  const queryResult = useQuery<CollectionCard[]>({
    queryKey: [`CardsList_${setShortName}`],
    enabled: !!setShortName,
    queryFn: () => fetchCards(setShortName!),
    staleTime: 1000 * 60 * 5,
  });

  return {
    data: queryResult.data,
    error: queryResult.error || undefined,
    isLoading: queryResult.isLoading,
  };
};

export const getCardDetail = (cardName?: string) => {
  if (!cardName) {
    return {
      data: null,
      error: undefined,
      isLoading: false,
    };
  }

  if (IS_USE_LOCAL_DATA) {
    return {
      data: getJsonCardDetail(cardName!),
      error: undefined,
      isLoading: false,
    };
  }

  const queryResult = useQuery<CollectionCard | null>({
    queryKey: [`CardDetail_${cardName}`],
    enabled: !!cardName,
    queryFn: () => fetchCardDetail(cardName!),
    staleTime: 1000 * 60 * 5,
  });

  return {
    data: queryResult.data,
    error: queryResult.error || undefined,
    isLoading: queryResult.isLoading,
  };
};

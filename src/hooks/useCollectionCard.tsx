import { useQuery } from "@tanstack/react-query";
import { AppResult } from "../services/AppResult";
import {
  fetchAdjacentCards,
  fetchCardDetail,
} from "../services/CollectionCardService";
import { IS_USE_LOCAL_DATA } from "../services/Constants";
import {
  getAdjacentCards,
  getJsonCardDetail,
} from "../services/JsonCollectionCardService";
import { CollectionCard } from "../types/CollectionCard";

export const useCardDetail = (
  seriesShortName: string,
  setShortName: string,
  sortBy: number,
  cardName: string,
): AppResult<CollectionCard | null, Error> => {
  const queryResult = useQuery<CollectionCard | null>({
    queryKey: [
      `CardDetail_${seriesShortName}_${setShortName}_${sortBy}_${cardName}`,
    ],
    enabled: !!seriesShortName && !!setShortName && !!cardName,
    queryFn: () =>
      fetchCardDetail(seriesShortName, setShortName, sortBy, cardName),
    staleTime: 1000 * 60 * 5,
  });

  if (IS_USE_LOCAL_DATA) {
    const card = getJsonCardDetail(
      seriesShortName,
      setShortName,
      sortBy,
      cardName,
    );

    return {
      data: card,
      error: card ? undefined : Error("Card not found"),
      isLoading: false,
    };
  }

  return {
    data: queryResult.data,
    error: queryResult.error || undefined,
    isLoading: queryResult.isLoading,
  };
};

export interface UseCurrentAndAdjacentCardsResult {
  card: CollectionCard | undefined;
  previousCard: CollectionCard | undefined;
  nextCard: CollectionCard | undefined;
  isLoading: boolean;
  error: Error | undefined;
}
export const useCurrentAndAdjacentCards = (
  seriesShortName: string,
  setShortName: string,
  sortBy: number,
  cardName: string,
): UseCurrentAndAdjacentCardsResult => {
  // current card
  const {
    data: card,
    isLoading,
    error,
  } = useCardDetail(seriesShortName, setShortName, sortBy, cardName);

  // adjacent cards
  const queryResult = useQuery<{
    previousCard: CollectionCard | null;
    nextCard: CollectionCard | null;
  }>({
    queryFn: () =>
      fetchAdjacentCards(seriesShortName, setShortName, card?.sortBy),
    queryKey: [
      `AdjacentCards_${seriesShortName}_${setShortName}_sortBy_${card?.sortBy}`,
    ],
    enabled: !!seriesShortName && !!setShortName,
    staleTime: 1000 * 60 * 5,
  });

  if (IS_USE_LOCAL_DATA) {
    const adjacentCards = getAdjacentCards(
      seriesShortName,
      setShortName,
      card?.sortBy,
    );
    return {
      card: card ?? undefined,
      previousCard: adjacentCards.previousCard ?? undefined,
      nextCard: adjacentCards.nextCard ?? undefined,
      error: error || undefined,
      isLoading: false,
    };
  }

  return {
    card: card ?? undefined,
    previousCard: queryResult.data?.previousCard ?? undefined,
    nextCard: queryResult.data?.nextCard ?? undefined,
    isLoading: isLoading || queryResult.isLoading,
    error: error || queryResult.error || undefined,
  };
};

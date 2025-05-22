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
  cardName: string,
): AppResult<CollectionCard | null, Error> => {
  const queryResult = useQuery<CollectionCard | null>({
    queryKey: [`CardDetail_${seriesShortName}_${setShortName}_${cardName}`],
    enabled: !!seriesShortName && !!setShortName && !!cardName,
    queryFn: () => fetchCardDetail(seriesShortName, setShortName, cardName),
    staleTime: 1000 * 60 * 5,
  });

  if (IS_USE_LOCAL_DATA) {
    const card = getJsonCardDetail(seriesShortName, setShortName, cardName);

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
  cardName: string,
): UseCurrentAndAdjacentCardsResult => {
  // current card
  const {
    data: card,
    isLoading,
    error,
  } = useCardDetail(seriesShortName, setShortName, cardName);

  // adjacent cards
  const prevNumber = card?.number ? card.number - 1 : undefined;
  const nextNumber = card?.number ? card.number + 1 : undefined;

  const queryResult = useQuery<CollectionCard[]>({
    queryFn: () =>
      fetchAdjacentCards(seriesShortName, setShortName, prevNumber, nextNumber),
    queryKey: [
      `AdjacentCards_${seriesShortName}_${setShortName}_cardNumber_${card?.number}`,
    ],
    enabled: !!seriesShortName && !!setShortName,
    staleTime: 1000 * 60 * 5,
  });

  if (IS_USE_LOCAL_DATA) {
    const adjacentCards = getAdjacentCards(
      seriesShortName,
      setShortName,
      prevNumber,
      nextNumber,
    );
    return {
      card: card ?? undefined,
      previousCard:
        adjacentCards.find((c) => c.number === prevNumber) ?? undefined,
      nextCard: adjacentCards.find((c) => c.number === nextNumber) ?? undefined,
      error: error || undefined,
      isLoading: false,
    };
  }

  return {
    card: card ?? undefined,
    previousCard:
      queryResult.data?.find((c) => c.number === prevNumber) ?? undefined,
    nextCard:
      queryResult.data?.find((c) => c.number === nextNumber) ?? undefined,
    isLoading: isLoading || queryResult.isLoading,
    error: error || queryResult.error || undefined,
  };
};

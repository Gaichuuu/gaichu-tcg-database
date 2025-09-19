// src/hooks/useCollectionCard.tsx
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

const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID || "dev";

export const useCardDetail = (
  seriesShortName: string,
  setShortName: string,
  sortBy: number | undefined,
  cardName: string,
): AppResult<CollectionCard | null, Error> => {
  const sortKey = Number.isFinite(sortBy as number) ? String(sortBy) : "nosort";
  const enabled = Boolean(seriesShortName && setShortName && cardName.trim());

  const queryResult = useQuery<CollectionCard | null>({
    queryKey: [
      "CardDetail",
      projectId,
      seriesShortName,
      setShortName,
      sortKey,
      cardName,
    ],
    enabled,
    queryFn: () =>
      fetchCardDetail(seriesShortName, setShortName, sortBy, cardName),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: false, // avoid retry loops for legit 404s
  });

  if (IS_USE_LOCAL_DATA) {
    const card = getJsonCardDetail(
      seriesShortName,
      setShortName,
      sortBy as any,
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
  sortBy: number | undefined,
  cardName: string,
): UseCurrentAndAdjacentCardsResult => {
  const {
    data: card,
    isLoading,
    error,
  } = useCardDetail(seriesShortName, setShortName, sortBy, cardName);

  const queryResult = useQuery<{
    previousCard: CollectionCard | null;
    nextCard: CollectionCard | null;
  }>({
    queryKey: [
      "AdjacentCards",
      projectId,
      seriesShortName,
      setShortName,
      "sortBy",
      card?.sortBy ?? "nosort",
    ],
    queryFn: () =>
      fetchAdjacentCards(seriesShortName, setShortName, card?.sortBy),
    enabled: Boolean(seriesShortName && setShortName && card), // wait for current card
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: false,
  });

  if (IS_USE_LOCAL_DATA) {
    const adjacent = getAdjacentCards(
      seriesShortName,
      setShortName,
      card?.sortBy,
    );
    return {
      card: card ?? undefined,
      previousCard: adjacent.previousCard ?? undefined,
      nextCard: adjacent.nextCard ?? undefined,
      error: error || undefined,
      isLoading: false,
    };
  }

  return {
    card: card ?? undefined,
    previousCard: queryResult.data?.previousCard ?? undefined,
    nextCard: queryResult.data?.nextCard ?? undefined,
    isLoading: isLoading || queryResult.isLoading,
    error: error || undefined,
  };
};

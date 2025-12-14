// src/hooks/useCollectionCard.tsx
import {
  fetchAdjacentCards,
  fetchCardDetail,
} from "@/services/CollectionCardService";
import { IS_USE_LOCAL_DATA } from "@/services/Constants";
import {
  getAdjacentCards,
  getJsonCardDetail,
} from "@/services/JsonCollectionCardService";
import { CollectionCard } from "@/types/CollectionCard";
import { THIRTY_MINUTES, TWENTY_FOUR_HOURS } from "@/utils/TimeUtils";
import {
  keepPreviousData,
  useQuery,
  UseQueryResult,
} from "@tanstack/react-query";

const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID || "dev";

export const useCardDetail = (
  seriesShortName: string,
  setShortName: string,
  sortBy: number | undefined,
  cardName: string,
): UseQueryResult<CollectionCard | null, Error> => {
  const sortKey = Number.isFinite(sortBy as number) ? String(sortBy) : "";
  const enabled = Boolean(seriesShortName && setShortName && cardName.trim());

  if (IS_USE_LOCAL_DATA) {
    return useQuery<CollectionCard | null, Error>({
      queryKey: [
        "useCardDetailLocal",
        projectId,
        seriesShortName,
        setShortName,
        "sortBy",
        sortKey,
        cardName,
      ],
      enabled,
      queryFn: async () => {
        return getJsonCardDetail(
          seriesShortName,
          setShortName,
          sortBy as any,
          cardName,
        );
      },
    });
  }

  return useQuery<CollectionCard | null>({
    queryKey: [
      "CardDetail",
      projectId,
      seriesShortName,
      setShortName,
      "sortBy",
      sortKey,
      cardName,
    ],
    enabled,
    queryFn: () =>
      fetchCardDetail(seriesShortName, setShortName, sortBy, cardName),
    staleTime: THIRTY_MINUTES,
    gcTime: TWENTY_FOUR_HOURS,
    refetchOnWindowFocus: false,
    retry: false,
  });
};

export interface UseCurrentAndAdjacentCardsResult {
  card: CollectionCard | null;
  previousCard: CollectionCard | null;
  nextCard: CollectionCard | null;
}

export const useCurrentAndAdjacentCards = (
  seriesShortName: string,
  setShortName: string,
  sortBy: number | undefined,
  cardName: string,
): UseQueryResult<UseCurrentAndAdjacentCardsResult | null, Error> => {
  if (IS_USE_LOCAL_DATA) {
    return useQuery<UseCurrentAndAdjacentCardsResult | null, Error>({
      queryKey: [
        "useCurrentAndAdjacentCardsLocal",
        projectId,
        seriesShortName,
        setShortName,
        "sortBy",
        sortBy ?? "",
        cardName,
      ],
      queryFn: async () => {
        const card = await getJsonCardDetail(
          seriesShortName,
          setShortName,
          sortBy ?? 0,
          cardName,
        );

        const adjacentCards = await getAdjacentCards(
          seriesShortName,
          setShortName,
          sortBy ?? 0,
        );
        return {
          card: card,
          previousCard: adjacentCards.previousCard,
          nextCard: adjacentCards.nextCard,
        };
      },
      enabled: Boolean(seriesShortName && setShortName),
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: false,
    });
  }
  const enabled = Boolean(seriesShortName && setShortName && cardName.trim());

  return useQuery<UseCurrentAndAdjacentCardsResult | null, Error>({
    queryKey: [
      "useCurrentAndAdjacentCards",
      projectId,
      seriesShortName,
      setShortName,
      sortBy ?? "",
      cardName,
    ],
    enabled,
    staleTime: 5 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: false,
    placeholderData: keepPreviousData,

    queryFn: async () => {
      const card = await fetchCardDetail(
        seriesShortName,
        setShortName,
        sortBy,
        cardName,
      );
      const adjacentCards = await fetchAdjacentCards(
        seriesShortName,
        setShortName,
        sortBy,
      );
      return {
        card,
        previousCard: adjacentCards.previousCard,
        nextCard: adjacentCards.nextCard,
      };
    },
  });
};

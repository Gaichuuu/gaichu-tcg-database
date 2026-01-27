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

  return useQuery<CollectionCard | null, Error>({
    queryKey: [
      IS_USE_LOCAL_DATA ? "useCardDetailLocal" : "CardDetail",
      projectId,
      seriesShortName,
      setShortName,
      "sortBy",
      sortKey,
      cardName,
    ],
    enabled,
    queryFn: async () => {
      return IS_USE_LOCAL_DATA
        ? getJsonCardDetail(
            seriesShortName,
            setShortName,
            sortBy ?? 0,
            cardName,
          )
        : fetchCardDetail(seriesShortName, setShortName, sortBy, cardName);
    },
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
  const enabled = IS_USE_LOCAL_DATA
    ? Boolean(seriesShortName && setShortName)
    : Boolean(seriesShortName && setShortName && cardName.trim());

  return useQuery<UseCurrentAndAdjacentCardsResult | null, Error>({
    queryKey: [
      IS_USE_LOCAL_DATA
        ? "useCurrentAndAdjacentCardsLocal"
        : "useCurrentAndAdjacentCards",
      projectId,
      seriesShortName,
      setShortName,
      IS_USE_LOCAL_DATA ? "sortBy" : undefined,
      sortBy ?? "",
      cardName,
    ].filter((k) => k !== undefined),
    enabled,
    placeholderData: IS_USE_LOCAL_DATA ? undefined : keepPreviousData,
    queryFn: async () => {
      if (IS_USE_LOCAL_DATA) {
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
      }

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

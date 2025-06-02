import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { database } from "../../config/FirebaseConfig";
import { CollectionCard } from "../types/CollectionCard";
const collectionName = "cards";

export const fetchCards = async (
  seriesShortName: string,
  setShortName: string,
): Promise<CollectionCard[]> => {
  const cardsReference = collection(database, collectionName);
  const cardsQuery = query(
    cardsReference,
    where("series_short_name", "==", seriesShortName),
    where("set_short_name", "==", setShortName),
    orderBy("sortBy", "asc"),
  );

  const cardsSnapshot = await getDocs(cardsQuery);
  const cards = cardsSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as CollectionCard[];
  return cards;
};

export const fetchCardDetail = async (
  seriesShortName: string,
  setShortName: string,
  cardName: string,
): Promise<CollectionCard | null> => {
  const cardsReference = collection(database, collectionName);
  const cardsQuery = query(
    cardsReference,
    where("series_short_name", "==", seriesShortName),
    where("set_short_name", "==", setShortName),
    where("name", "==", cardName),
    limit(1),
  );

  const cardsSnapshot = await getDocs(cardsQuery);
  if (cardsSnapshot.empty) return null;

  const doc = cardsSnapshot.docs[0];
  return { id: doc.id, ...doc.data() } as CollectionCard;
};

export const fetchAdjacentCards = async (
  seriesShortName: string,
  setShortName: string,
  currentCardSortBy?: number,
): Promise<{
  previousCard: CollectionCard | null;
  nextCard: CollectionCard | null;
}> => {
  if (currentCardSortBy === undefined) {
    return { previousCard: null, nextCard: null };
  }

  const cardsReference = collection(database, collectionName);
  const cardsQuery = query(
    cardsReference,
    where("series_short_name", "==", seriesShortName),
    where("set_short_name", "==", setShortName),
    where("sortBy", ">=", currentCardSortBy - 1),
    where("sortBy", "<=", currentCardSortBy + 1),
    orderBy("sortBy", "asc"),
  );

  const cardsSnapshot = await getDocs(cardsQuery);
  const cards = cardsSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as CollectionCard[];

  const previousCard =
    cards.filter((card) => card.sortBy < currentCardSortBy).at(-1) || null;
  const nextCard =
    cards.filter((card) => card.sortBy > currentCardSortBy).at(0) || null;

  return {
    previousCard: previousCard ?? null,
    nextCard: nextCard ?? null,
  };
};

import { CollectionCard } from "@/types/CollectionCard";
import { CollectionSet } from "@/types/CollectionSet";
import { SetAndCard } from "@/types/MergedCollection";
import { database } from "@/lib/firebase";
import { collection, getDocs, orderBy, query, where } from "firebase/firestore";

export const fetchSets = async (shortName: string): Promise<SetAndCard[]> => {
  const setsQuery = query(
    collection(database, "sets"),
    where("series_short_name", "==", shortName),
    orderBy("sort_by", "asc"),
  );
  const setsSnapshot = await getDocs(setsQuery);
  const sets = setsSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as CollectionSet[];

  const cardsQuery = query(
    collection(database, "cards"),
    where("series_short_name", "==", shortName),
    orderBy("sort_by", "asc"),
  );
  const cardsSnapshot = await getDocs(cardsQuery);
  const cards = cardsSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as CollectionCard[];

  return mergeWithSetsId(sets, cards);
};

const mergeWithSetsId = (
  sets: CollectionSet[],
  cards: CollectionCard[],
): SetAndCard[] => {
  return sets.map((setItem) => ({
    set: setItem,
    cards: cards.filter((cardItem) => cardItem.set_ids[0] === setItem.id),
  }));
};

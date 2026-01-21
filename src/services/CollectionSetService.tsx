import type { CollectionCard } from "@/types/CollectionCard";
import type { CollectionSet } from "@/types/CollectionSet";
import type { SetAndCard } from "@/types/MergedCollection";
import { database } from "@/lib/firebase";
import {
  collection,
  getDocs,
  orderBy,
  query,
  where,
} from "firebase/firestore/lite";

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

  if (sets.length === 0) {
    return [];
  }

  // Query cards for each set using array-contains (no composite index required)
  const results: SetAndCard[] = await Promise.all(
    sets.map(async (setItem) => {
      const cardsQuery = query(
        collection(database, "cards"),
        where("set_ids", "array-contains", setItem.id),
      );
      const cardsSnapshot = await getDocs(cardsQuery);
      const cards = cardsSnapshot.docs
        .map(
          (doc) =>
            ({
              id: doc.id,
              ...doc.data(),
              set_short_name: setItem.short_name,
              series_short_name: setItem.series_short_name,
              total_cards_count: setItem.total_cards_count ?? 0,
              sets: [{ name: setItem.name, image: setItem.logo }],
            }) as CollectionCard,
        )
        .sort((a, b) => a.sort_by - b.sort_by);

      return { set: setItem, cards };
    }),
  );

  return results;
};

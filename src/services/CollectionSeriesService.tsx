import { collection, getDocs } from "firebase/firestore";
import { database } from "../../config/FirebaseConfig";
import { CollectionSeries } from "../types/CollectionSeries";
import { CollectionSet } from "../types/CollectionSet";
import { SeriesAndSet } from "../types/MergedCollection";

export enum SeriesShortName {
  wm = "wm",
  mz = "mz",
}

export const fetchSeries = async (): Promise<SeriesAndSet[]> => {
  const seriesSnapshot = await getDocs(collection(database, "series"));
  const series = seriesSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as CollectionSeries[];

  const setsSnapshot = await getDocs(collection(database, "sets"));
  const sets = setsSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as CollectionSet[];

  return mergeWithSeriesId(series, sets).sort(
    (a, b) => a.series.sortBy - b.series.sortBy,
  );
};

const mergeWithSeriesId = (
  series: CollectionSeries[],
  sets: CollectionSet[],
): SeriesAndSet[] => {
  return series.map((seriesItem) => ({
    series: seriesItem,
    sets: sets.filter((setItem) => setItem.series_id === seriesItem.id),
  }));
};

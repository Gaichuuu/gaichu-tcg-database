import type { CollectionCard } from "@/types/CollectionCard";
import type { SeriesAndSet, SetAndCard } from "@/types/MergedCollection";

export const loadJsonSeries = async (): Promise<SeriesAndSet[]> =>
  (await import("./JsonCollectionSeriesService")).getJsonSeries();

export const loadJsonSet = async (
  seriesShortName: string,
): Promise<SetAndCard[]> =>
  (await import("./JsonCollectionSetService")).getJsonSet(seriesShortName);

export const loadJsonCardDetail = async (
  seriesShortName: string,
  setShortName: string,
  sortBy: number,
  cardName: string,
): Promise<CollectionCard | null> =>
  (await import("./JsonCollectionCardService")).getJsonCardDetail(
    seriesShortName,
    setShortName,
    sortBy,
    cardName,
  );

export const loadAdjacentCards = async (
  seriesShortName: string,
  setShortName: string,
  sortBy: number,
) =>
  (await import("./JsonCollectionCardService")).getAdjacentCards(
    seriesShortName,
    setShortName,
    sortBy,
  );

import { z } from "zod";
import mzCardList from "../../data/mz/cards.json";
import wmCardList from "../../data/wm/cards.json";
import { CollectionCard } from "../types/CollectionCard";
import { SeriesShortName } from "./CollectionSeriesService";

export const SerieCardList: Record<SeriesShortName, any> = {
  [SeriesShortName.wm]: wmCardList,
  [SeriesShortName.mz]: mzCardList,
};

export const getJsonCardList = (
  seriesShortName: string,
  setShortName: string,
): CollectionCard[] => {
  const cardList = jsonCardList(seriesShortName);
  const result = cardList.filter(
    (card) => card.set_short_name === setShortName,
  );

  return result.sort((a, b) => a.number - b.number);
};

export const getJsonCardDetail = (
  seriesShortName: string,
  setShortName: string,
  cardName: string,
): CollectionCard | null => {
  const cardList = jsonCardList(seriesShortName);
  const card = cardList
    .filter(
      (card) =>
        card.set_short_name === setShortName &&
        card.series_short_name === seriesShortName,
    )
    .find((card) => card.name === cardName);

  if (!card) return null;
  return card;
};

export const getAdjacentCards = (
  seriesShortName: string,
  setShortName: string,
  previousNumber?: number,
  nextNumber?: number,
): CollectionCard[] => {
  const cardList = jsonCardList(seriesShortName);
  const cards = cardList
    .filter((card) => card.series_short_name === seriesShortName)
    .filter((card) => card.set_short_name === setShortName);

  return cards.filter((card) => {
    if (previousNumber && card.number === previousNumber) return true;
    if (nextNumber && card.number === nextNumber) return true;
    return false;
  });
};

export const jsonCardList = (seriesShortName: string): CollectionCard[] => {
  switch (seriesShortName) {
    case SeriesShortName.wm:
      return SerieCardList[SeriesShortName.wm].map((card: any) =>
        CardSchema.parse(card),
      );
    case SeriesShortName.mz:
      return SerieCardList[SeriesShortName.mz].map((card: any) =>
        CardSchema.parse(card),
      );

    default:
      return [];
  }
};

const CardSchema = z.object({
  id: z.string(),
  number: z.number().optional(),
  sortBy: z.number().optional(),
  name: z.string(),
  variant: z.string().optional(),
  image: z.string(),
  rarity: z.string(),
  set_short_name: z.string(),
  series_short_name: z.string(),
  illustrators: z.array(z.string()),
  set_ids: z.array(z.string()),
  sets: z.array(
    z.object({
      name: z.string(),
      image: z.string(),
    }),
  ),
  thumb: z.string(),

  // optional properties
  description: z.string().optional(),
  attacks: z
    .array(
      z.object({
        name: z.string(),
        effect: z.string(),
        damage: z.string().optional(),
        costs: z.array(z.string()).optional(),
      }),
    )
    .optional(),
  measurement: z
    .object({
      height: z.string().optional(),
      weight: z.string().optional(),
    })
    .optional(),
  parody: z.string().optional(),
  hp: z.string().optional(),
  type: z.string().optional(),
  limit: z.number().optional(),
  cost: z
    .array(
      z.object({
        total: z.string(),
        aura: z.array(z.string()),
      }),
    )
    .optional(),
  effect: z.string().optional(),
  note: z.string().optional(),
});

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
  variant: string,
): CollectionCard | null => {
  const cardList = jsonCardList(seriesShortName);
  const card = cardList
    .filter(
      (card) =>
        card.set_short_name === setShortName &&
        card.series_short_name === seriesShortName &&
        card.name === cardName &&
        card.variant === variant,
    )
    .at(-1);
  if (!card) return null;
  return card;
};

export const getAdjacentCards = (
  seriesShortName: string,
  setShortName: string,
  currentCardSortBy?: number,
): {
  previousCard: CollectionCard | null;
  nextCard: CollectionCard | null;
} => {
  if (currentCardSortBy === undefined) {
    return { previousCard: null, nextCard: null };
  }
  const cardList = jsonCardList(seriesShortName);
  const cards = cardList
    .filter((card) => card.series_short_name === seriesShortName)
    .filter((card) => card.set_short_name === setShortName)
    .sort((a, b) => a.sortBy - b.sortBy);

  const previousCard =
    cards.filter((card) => card.sortBy < currentCardSortBy).at(-1) || null;
  const nextCard =
    cards.filter((card) => card.sortBy > currentCardSortBy).at(0) || null;

  return {
    previousCard: previousCard,
    nextCard: nextCard,
  };
};

export const jsonCardList = (seriesShortName: string): CollectionCard[] => {
  switch (seriesShortName) {
    case SeriesShortName.wm:
      const cards = SerieCardList[SeriesShortName.wm].map((card: any) =>
        CardSchema.parse(card),
      ) as CollectionCard[];
      return cards.sort((a, b) => a.sortBy - b.sortBy);
    case SeriesShortName.mz:
      return SerieCardList[SeriesShortName.mz].map((card: any) =>
        CardSchema.parse(card),
      ) as CollectionCard[];
      return cards.sort((a, b) => a.sortBy - b.sortBy);

    default:
      return [];
  }
};

const CardSchema = z.object({
  id: z.string(),
  total_cards_count: z.number(),
  number: z.number(),
  sortBy: z.number(),
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
        aura: z.string(),
      }),
    )
    .optional(),
  effect: z.string().optional(),
  note: z.string().optional(),
});

import { CollectionCard } from "@/types/CollectionCard";
import { z } from "zod";
import ashCardList from "../../data/ash/cards.json";
import mzCardList from "../../data/mz/cards.json";
import ozCardList from "../../data/oz/cards.json";
import wmCardList from "../../data/wm/cards.json";
import { SeriesShortName } from "./CollectionSeriesService";

// FIXME: added hard code "series_short_name" to read json files wich have series_short_name path
export const SerieCardList: Record<SeriesShortName, any> = {
  [SeriesShortName.wm]: wmCardList,
  [SeriesShortName.mz]: mzCardList,
  [SeriesShortName.ash]: ashCardList,
  [SeriesShortName.oz]: ozCardList,
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
  sortBy: number,
  cardName: string,
): CollectionCard | null => {
  const cardList = jsonCardList(seriesShortName);
  const card = cardList
    .filter(
      (card) =>
        card.set_short_name === setShortName &&
        card.series_short_name === seriesShortName &&
        card.sort_by === sortBy &&
        card.name === cardName,
    )
    .at(-1);
  if (!card) return null;
  return card;
};

export const getAdjacentCards = (
  seriesShortName: string,
  setShortName: string,
  currentCardsort_by?: number,
): {
  previousCard: CollectionCard | null;
  nextCard: CollectionCard | null;
} => {
  if (currentCardsort_by === undefined) {
    return { previousCard: null, nextCard: null };
  }
  const cardList = jsonCardList(seriesShortName);
  const cards = cardList
    .filter((card) => card.series_short_name === seriesShortName)
    .filter((card) => card.set_short_name === setShortName)
    .sort((a, b) => a.sort_by - b.sort_by);

  const previousCard =
    cards.filter((card) => card.sort_by < currentCardsort_by).at(-1) || null;
  const nextCard =
    cards.filter((card) => card.sort_by > currentCardsort_by).at(0) || null;

  return {
    previousCard: previousCard,
    nextCard: nextCard,
  };
};

export const jsonCardList = (seriesShortName: string): CollectionCard[] => {
  const cards = SerieCardList[seriesShortName as SeriesShortName].map(
    (card: any) => CardSchema.parse(card),
  ) as CollectionCard[];
  return cards.sort((a, b) => a.sort_by - b.sort_by);
};

const CardSchema = z.object({
  id: z.string(),
  total_cards_count: z.number(),
  number: z.number(),
  sort_by: z.number(),
  name: z.string(),
  variant: z.string().optional(),
  image: z.string(),
  rarity: z.string(),
  color: z.string().optional(),
  weakness: z
    .array(
      z.object({
        type: z.string(),
        value: z.string().optional(),
      }),
    )
    .optional(),
  resistance: z
    .array(
      z.object({
        type: z.string(),
        value: z.string().optional(),
      }),
    )
    .optional(),
  retreat: z
    .array(
      z.object({
        costs: z.array(z.string()).optional(),
      }),
    )
    .optional(),

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
  zoo_attack: z
    .array(
      z.object({
        name: z.string(),
        effect: z.string().optional(),
        damage: z.string(),
        status: z.array(z.string()).optional(),
        multiplier: z.string().optional(),
        bonus: z.string().optional(),
      }),
    )
    .optional(),
  measurement: z
    .object({
      height: z.string().optional(),
      weight: z.string().optional(),
    })
    .optional(),
  stage: z
    .array(
      z.object({
        basic: z.string().optional(),
        evolution: z.string().optional(),
        description: z.string().optional(),
      }),
    )
    .optional(),
  rule: z
    .array(
      z.object({
        name: z.string().optional(),
        description: z.string().optional(),
      }),
    )
    .optional(),
  parody: z.string().optional(),
  hp: z.string().optional(),
  lp: z.string().optional(),
  traits: z.array(z.string()).optional(),
  terra: z
    .array(
      z.object({
        attack: z.string(),
        icon: z.string(),
        lp: z.string(),
      }),
    )
    .optional(),
  metadata: z
    .object({
      height: z.string().optional(),
      weight: z.string().optional(),
      gps: z.string().optional(),
      discovered: z.string().optional(),
      length: z.string().optional(),
      type: z.string().optional(),
      measurement: z.string().optional(),
    })
    .optional(),
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

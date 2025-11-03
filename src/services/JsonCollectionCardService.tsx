import { z } from "zod";
import { t } from "@/i18n/locale";
import { slugify } from "@/utils/RoutePathBuildUtils";

const localeEnum = z.enum(["en", "ja"]);

const I18nValue = z.union([z.string(), z.record(localeEnum, z.string())]);

type LocaleKey = z.infer<typeof localeEnum>;

function toI18nMap(v: unknown): Partial<Record<LocaleKey, string>> {
  if (v == null) return {};
  return typeof v === "string" ? { en: v } : (v as any);
}

import mzCardList from "../../data/mz/cards.json";
import wmCardList from "../../data/wm/cards.json";
import ashCardList from "../../data/ash/cards.json";
import ozCardList from "../../data/oz/cards.json";
import disgruntledCardList from "../../data/disgruntled/cards.json";
import { CollectionCard } from "@/types/CollectionCard";
import { SeriesShortName } from "./CollectionSeriesService";

// FIXME: added hard code "series_short_name" to read json files wich have series_short_name path
export const SerieCardList: Record<SeriesShortName, any> = {
  [SeriesShortName.wm]: wmCardList,
  [SeriesShortName.mz]: mzCardList,
  [SeriesShortName.ash]: ashCardList,
  [SeriesShortName.oz]: ozCardList,
  [SeriesShortName.disgruntled]: disgruntledCardList,
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
  cardNameFromUrl: string,
): CollectionCard | null => {
  const targetSlug = slugify(cardNameFromUrl);

  const card =
    jsonCardList(seriesShortName)
      .filter(
        (c) =>
          c.set_short_name === setShortName &&
          c.series_short_name === seriesShortName &&
          c.sort_by === sortBy,
      )
      .find((c) => slugify(t(c.name, "en")) === targetSlug) ?? null;

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
    .sort((a, b) => a.sort_by - b.sort_by);

  const previousCard =
    cards.filter((card) => card.sort_by < currentCardSortBy).at(-1) || null;
  const nextCard =
    cards.filter((card) => card.sort_by > currentCardSortBy).at(0) || null;

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

const AttackSchemaRaw = z.object({
  name: I18nValue,
  effect: I18nValue,
  damage: z.string().optional(),
  costs: z.array(z.string()).optional(),
});

const CardSchemaRaw = z.object({
  id: z.string(),
  total_cards_count: z.number(),
  number: z.number(),
  sort_by: z.number(),

  name: I18nValue,
  variant: z.string().optional(),
  image: z.string(),
  rarity: z.string().optional(),
  color: z.string().optional(),

  weakness: z
    .array(z.object({ type: z.string(), value: z.string().optional() }))
    .optional(),
  resistance: z
    .array(z.object({ type: z.string(), value: z.string().optional() }))
    .optional(),
  retreat: z
    .array(z.object({ costs: z.array(z.string()).optional() }))
    .optional(),
  strength: z.string().optional(),

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

  description: I18nValue.optional(),

  attacks: z.array(AttackSchemaRaw).optional().default([]),
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
  lp_alt: z.string().optional(),
  traits: z.array(z.string()).optional(),
  terra: z
    .array(z.object({ attack: z.string(), icon: z.string(), lp: z.string() }))
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
  cost: z.array(z.object({ total: z.string(), aura: z.string() })).optional(),
  effect: z.string().optional(),
  note: z.string().optional(),
});

const CardSchema = CardSchemaRaw.transform((c) => ({
  ...c,
  name: toI18nMap(c.name),
  description: toI18nMap(c.description),

  attacks: (c.attacks ?? []).map((a) => ({
    ...a,
    name: toI18nMap(a.name),
    effect: toI18nMap(a.effect),
    costs: a.costs ?? [],
  })),
}));

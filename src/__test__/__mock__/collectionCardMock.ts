import type { CollectionCard } from "@/types/CollectionCard";

const defaults: CollectionCard = {
  id: "default-id",
  total_cards_count: 50,
  number: 1,
  sort_by: 1,
  name: { en: "Default Card" },
  image: "https://example.com/card.png",
  rarity: "common",
  set_short_name: "base",
  series_short_name: "ash",
  illustrators: [],
  set_ids: ["set-1"],
  sets: [{ name: "Base Set", image: "https://example.com/set.png" }],
  thumb: "https://example.com/thumb.png",
  variant: "normal",
};

export function makeCard(
  overrides?: Partial<CollectionCard>,
): CollectionCard {
  return { ...defaults, ...overrides };
}

export const collectionCardMocks: CollectionCard[] = [
  makeCard({
    id: "card-1",
    name: { en: "Fire Dragon", ja: "ファイアドラゴン" },
    description: { en: "A fiery beast", ja: "炎の獣" },
    attacks: [
      {
        name: { en: "Flame Burst" },
        effect: { en: "Does 50 damage" },
        damage: "50",
        costs: ["fire", "fire"],
      },
    ],
    parody: "Charizard",
    type: "fire",
    hp: "120",
    illustrators: ["Artist One"],
    average_price: 12.5,
    series_short_name: "ash",
    set_short_name: "base",
  }),
  makeCard({
    id: "card-2",
    name: { en: "Thunder Mouse" },
    description: { en: "An electric rodent" },
    parody: "Pikachu",
    rarity: "rare",
    type: "electric",
    hp: "60",
    color: "yellow",
    illustrators: ["Artist Two", "Artist Three"],
    series_short_name: "wm",
    set_short_name: "promo",
  }),
  makeCard({
    id: "card-3",
    name: { ja: "水亀" },
    attacks: [
      {
        name: { ja: "水鉄砲" },
        effect: { ja: "20ダメージ" },
        damage: "20",
        costs: ["water"],
      },
      {
        name: { ja: "甲羅防御" },
        effect: { ja: "次のターンダメージを受けない" },
        costs: [],
      },
    ],
    effect: "Water shield",
    note: "Promo only",
    variant: "holo",
    series_short_name: "ash",
    set_short_name: "expansion",
  }),
  makeCard({
    id: "card-4",
    name: { en: "Minimal Card" },
    series_short_name: "mz",
    set_short_name: "starter",
  }),
];

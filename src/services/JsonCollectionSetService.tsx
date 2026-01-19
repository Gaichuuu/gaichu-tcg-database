import { CollectionCard } from "@/types/CollectionCard";
import { SetAndCard } from "@/types/MergedCollection";
import setsList from "data/sets.json";
import { jsonCardList } from "./JsonCollectionCardService";

interface JsonPackArt {
  url: string;
  frontDescription?: string;
  backDescription?: string;
  illustrator?: string;
  note?: string;
  packs?: Array<{ url: string; label: string }>;
}

interface JsonCardBack {
  url: string;
  text?: string;
  illustrator?: string;
  note?: string;
}

interface JsonSet {
  id: string;
  short_name: string;
  series_short_name: string;
  series_id: string;
  logo: string;
  name: string;
  sort_by: number;
  description?: string;
  pack_art?: JsonPackArt;
  card_back?: JsonCardBack;
  print_file_url?: string;
  buy_url?: string;
  total_cards_count?: number;
}

export const getJsonSet = (seriesShortName: string): SetAndCard[] => {
  const cardList = jsonCardList(seriesShortName);
  return (setsList as JsonSet[])
    .filter((set) => set.series_short_name === seriesShortName)
    .map((set) => convertToSetAndCard(set, cardList))
    .sort((a, b) => a.set.sort_by - b.set.sort_by);
};

const convertToSetAndCard = (
  set: JsonSet,
  cardList: CollectionCard[],
): SetAndCard => ({
  set: {
    id: set.id,
    short_name: set.short_name,
    series_short_name: set.series_short_name,
    series_id: set.series_id,
    logo: set.logo,
    name: set.name,
    sort_by: set.sort_by,
    description: set.description,
    pack_art: set.pack_art,
    card_back: set.card_back,
    total_cards_count: set.total_cards_count,
  },
  cards: cardList
    .filter(
      (card) => Array.isArray(card.set_ids) && card.set_ids.includes(set.id),
    )
    .map((card) => ({
      id: card.id,
      total_cards_count: card.total_cards_count,
      number: card.number,
      sort_by: card.sort_by,

      name: card.name,
      description: card.description,
      attacks: (card.attacks ?? []).map((attack) => ({
        name: attack.name,
        effect: attack.effect,
        damage: attack.damage,
        costs: attack.costs ?? [],
      })),

      parody: card.parody,
      rarity: card.rarity,
      color: card.color,
      set_short_name: card.set_short_name,
      series_short_name: card.series_short_name,
      image: card.image,
      thumb: card.thumb,
      variant: card.variant,
      hp: card.hp,
      effect: card.effect,
      note: card.note,
      illustrators: [...card.illustrators],
      zoo_attack: card.zoo_attack,

      weakness: card.weakness?.map((w) => ({
        type: w.type,
        value: w.value,
      })),
      resistance: card.resistance?.map((r) => ({
        type: r.type,
        value: r.value,
      })),
      retreat: card.retreat?.map((rt) => ({ costs: rt.costs ?? [] })),

      measurement: {
        height: card.measurement?.height,
        weight: card.measurement?.weight,
      },
      stage: card.stage?.map((stage) => ({
        basic: stage.basic,
        evolution: stage.evolution,
        description: stage.description,
      })),

      rule: card.rule?.map((rule) => ({
        name: rule.name,
        description: rule.description,
      })),
      sets: card.sets.map((s) => ({
        name: s.name,
        image: s.image,
      })),
      set_ids: [...card.set_ids],
      traits: card.traits,
      terra: card.terra,
      metadata: card.metadata,
      type: card.type,
      limit: card.limit,
      cost: card.cost,
      lp: card.lp,
    })),
});

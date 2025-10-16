import { SetAndCard } from "@/types/MergedCollection";
import setsList from "data/sets.json";
import { jsonCardList } from "./JsonCollectionCardService";

export const getJsonSet = (seriesShortName: string): SetAndCard[] => {
  const cardList = jsonCardList(seriesShortName);
  return setsList
    .filter((set: any) => set.series_short_name === seriesShortName)
    .map((set: any) => convertToSetAndCard(set, cardList))
    .sort((a, b) => a.set.sortBy - b.set.sortBy);
};

const convertToSetAndCard = (set: any, cardList: any[]): SetAndCard => ({
  set: {
    id: set.id,
    short_name: set.short_name,
    series_short_name: set.series_short_name,
    series_id: set.series_id,
    logo: set.logo,
    name: set.name,
    sortBy: set.sortBy,
    description: set.description,
    set_images: set.set_images?.map((image: any) => ({
      url: image.url,
      pathType: image.pathType,
      frontDescription: image.frontDescription,
      backDescription: image.backDescription,
      note: image.note,
      text: image.text,
      illustrator: image.illustrator,
      packs: image.packs?.map((pack: any) => ({
        url: pack.url,
        label: pack.label,
      })),
    })),
  },
  cards: cardList

    .filter(
      (card) => Array.isArray(card.set_ids) && card.set_ids.includes(set.id),
    )
    .map((card) => ({
      id: card.id,
      total_cards_count: card.total_cards_count,
      number: card.number!,
      sortBy: card.sortBy,

      name: card.name,
      description: card.description,
      attacks: (card.attacks ?? []).map((attack: any) => ({
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

      weakness: card.weakness?.map((w: any) => ({
        type: w.type,
        value: w.value,
      })),
      resistance: card.resistance?.map((r: any) => ({
        type: r.type,
        value: r.value,
      })),
      retreat: card.retreat?.map((rt: any) => ({ costs: rt.costs ?? [] })),

      measurement: {
        height: card.measurement?.height,
        weight: card.measurement?.weight,
      },
      stage: card.stage?.map((stage: any) => ({
        basic: stage.basic,
        evolution: stage.evolution,
        description: stage.description,
      })),

      rule: card.rule?.map((rule: any) => ({
        name: rule.name,
        description: rule.description,
      })),
      sets: card.sets.map((s: any) => ({
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

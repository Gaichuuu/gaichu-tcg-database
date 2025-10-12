import { SetAndCard } from "@/types/MergedCollection";
import setsList from "data/sets.json";
import { jsonCardList } from "./JsonCollectionCardService";

export const getJsonSet = (seriesShortName: string): SetAndCard[] => {
  const cardList = jsonCardList(seriesShortName);
  return setsList
    .filter((set) => set.series_short_name === seriesShortName)
    .map((set) => {
      return convertToSetAndCard(set, cardList);
    })
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
    .filter((card) => card.set_ids[0] === set.id)
    .map((card) => ({
      id: card.id,
      total_cards_count: card.total_cards_count,
      number: card.number!,
      sortBy: card.sortBy,
      name: card.name,
      parody: card.parody,
      rarity: card.rarity,
      color: card.color,
      set_short_name: card.set_short_name,
      series_short_name: card.series_short_name,
      image: card.image,
      thumb: card.thumb,
      variant: card.variant,
      hp: card.hp,
      description: card.description,
      effect: card.effect,
      note: card.note,
      illustrators: [...card.illustrators],
      zoo_attack: card.zoo_attack,
      attacks: card.attacks?.map((attack: any) => ({
        name: attack.name,
        effect: attack.effect,
        damage: attack.damage,
        costs: attack.costs?.map((cost: any) => cost),
      })),

      weakness: card.weakness?.map((weakness: any) => ({
        type: weakness.type,
        value: weakness.value,
      })),
      resistance: card.resistance?.map((resistance: any) => ({
        type: resistance.type,
        value: resistance.value,
      })),
      retreat: card.retreat?.map((retreat: any) => ({
        costs: retreat.costs?.map((cost: any) => cost),
      })),

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
        title: rule.title,
        description: rule.description,
      })),
      sets: card.sets.map((set: any) => ({
        name: set.name,
        image: set.image,
      })),
      set_ids: [...card.set_ids],
    })),
});

import cardList from "../../data/cards.json";
import { CollectionCard } from "../types/CollectionCard";

export const getJsonCardList = (setShortName: string): CollectionCard[] => {
  const result = cardList.filter(
    (card) => card.set_short_name === setShortName,
  );

  return result.map((card) => ({
    id: card.id,
    number: card.number!,
    name: card.name,
    parody: card.parody,
    rarity: card.rarity,
    set_short_name: card.set_short_name,
    image: card.image,
    hp: card.hp,
    description: card.description,
    illustrators: card.illustrators.map((illustrator) => illustrator),
    attacks: card.attacks.map((attack) => ({
      name: attack.name,
      effect: attack.effect,
      damage: attack.damage,
      costs: attack.costs?.map((cost) => cost),
    })),
    measurement: {
      height: card.measurement.height,
      weight: card.measurement.weight,
    },
    sets: card.sets.map((set) => ({
      name: set.name,
      image: set.image,
    })),
    set_ids: card.set_ids.map((set_id) => set_id),
  }));
};

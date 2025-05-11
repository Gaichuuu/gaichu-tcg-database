import cardList from "../../data/cards.json";
import setsList from "../../data/sets.json";
import { SetAndCard } from "../types/MergedCollection";

export const getJsonSet = (shortName: string): SetAndCard[] => {
  const result = setsList
    .filter((set) => set.series_short_name === shortName)
    .flatMap((set) => {
      const matchingCards = cardList.filter(
        (card) => card.set_ids[0] === set.id,
      );

      return [
        {
          set: {
            id: set.id,
            short_name: set.short_name,
            series_id: set.series_id,
            logo: set.logo,
            name: set.name,
          },
          cards: matchingCards.map((card) => ({
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
          })),
        },
      ];
    });

  return result;
};

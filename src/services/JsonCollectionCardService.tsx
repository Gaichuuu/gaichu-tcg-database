import cardList from "../../data/cards.json";
import { CollectionCard } from "../types/CollectionCard";

export const getJsonCardList = (setShortName: string): CollectionCard[] => {
  const result = cardList.filter(
    (card) => card.set_short_name === setShortName,
  );

  return result
    .map((card) => {
      return convertToCollectionCard(card);
    })
    .sort((a, b) => a.number - b.number);
};

export const getJsonCardDetail = (cardName: string): CollectionCard | null => {
  const card = cardList.find((card) => card.name === cardName);
  if (!card) return null;

  return convertToCollectionCard(card);
};

export const getAdjacentCards = (
  setShortName: string,
  previousNumber?: number,
  nextNumber?: number,
): CollectionCard[] => {
  const cards = cardList.filter((card) => card.set_short_name === setShortName);

  return cards
    .filter((card) => {
      if (previousNumber && card.number === previousNumber) return true;
      if (nextNumber && card.number === nextNumber) return true;
      return false;
    })
    .map((card) => convertToCollectionCard(card));
};

const convertToCollectionCard = (card: any): CollectionCard => ({
  id: card.id,
  number: card.number!,
  name: card.name,
  parody: card.parody,
  rarity: card.rarity,
  set_short_name: card.set_short_name,
  series_short_name: card.series_short_name,
  image: card.image,
  thumb: card.thumb,
  hp: card.hp,
  description: card.description,
  illustrators: [...card.illustrators],
  attacks: card.attacks.map((attack: any) => ({
    name: attack.name,
    effect: attack.effect,
    damage: attack.damage,
    costs: attack.costs?.map((cost: any) => cost),
  })),
  measurement: {
    height: card.measurement.height,
    weight: card.measurement.weight,
  },
  sets: card.sets.map((set: any) => ({
    name: set.name,
    image: set.image,
  })),
  set_ids: [...card.set_ids],
});

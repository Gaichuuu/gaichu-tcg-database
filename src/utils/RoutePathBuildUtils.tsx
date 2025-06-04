import { generatePath } from "react-router-dom";
import { CollectionCard } from "../types/CollectionCard";

export const CardDetailPath =
  "/cards/:seriesShortName/sets/:setShortName/card/:cardName";

export function getCardDetailPath(card: CollectionCard): string {
  const path = generatePath(CardDetailPath, {
    seriesShortName: encodeURIComponent(card.series_short_name),
    setShortName: encodeURIComponent(card.set_short_name),
    cardName: encodeURIComponent(card.name),
  });
  const params = new URLSearchParams({
    variant: encodeURIComponent(card.variant),
  });
  return `${path}?${params.toString()}`;
}

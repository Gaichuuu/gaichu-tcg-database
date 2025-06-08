import { generatePath } from "react-router-dom";
import { CollectionCard } from "../types/CollectionCard";
import { CollectionSet } from "../types/CollectionSet";

export const HomePagePath = "/";
export const AboutPagePath = "/about";
export const SeriesListPath = "/cards";
export const SetListPath = SeriesListPath + "/:seriesShortName";
export const CardListPath = SetListPath + "/sets/:setShortName";
export const CardDetailPath = CardListPath + "/card/:cardName";

export function getSetListPath(seriesShortName: string): string {
  const path = generatePath(SetListPath, {
    seriesShortName: encodeURIComponent(seriesShortName),
  });

  return path;
}

export function getCardListPath(
  seriesShortName: string,
  set: CollectionSet,
): string {
  const path = generatePath(CardListPath, {
    seriesShortName: encodeURIComponent(seriesShortName),
    setShortName: encodeURIComponent(set.short_name),
  });

  return path;
}

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

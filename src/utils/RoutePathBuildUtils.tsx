import { generatePath } from "react-router-dom";
import { CollectionCard } from "../types/CollectionCard";
import { CollectionSet } from "../types/CollectionSet";

export const HomePagePath = "/";
export const AboutPagePath = "/about";
export const SeriesListPath = "/cards";
export const SetListPath = SeriesListPath + "/:seriesShortName";
export const CardListPath = SetListPath + "/sets/:setShortName";
export const CardDetailPath = CardListPath + "/card/:sortByAndCardName";

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
    sortByAndCardName: encodeURIComponent(`${card.sortBy}_${card.name}`),
  });

  return path;
}

export function parseSortAndNameRegex(input: string): {
  sortBy: number;
  cardName: string;
} {
  const m = input.match(/^(\d+(?:\.\d+)?)_(.+)$/);
  if (!m) {
    throw new Error(`Invalid format: ${input}`);
  }
  const [, sortByStr, cardName] = m;
  const sortBy = parseFloat(sortByStr);
  return { sortBy, cardName };
}

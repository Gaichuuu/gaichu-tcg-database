import { generatePath } from "react-router-dom";
import { CollectionCard } from "../types/CollectionCard";
import { CollectionSet } from "../types/CollectionSet";

export const HomePagePath = "/";
export const AboutPagePath = "/about";
export const SeriesListPath = "/cards";
export const SetListPath = SeriesListPath + "/:seriesShortName";
export const CardListPath = SetListPath + "/sets/:setShortName";
export const CardDetailPath = CardListPath + "/card/:sortByAndCardName"; // TODO - sao: direct access to cardListPath if sortByAndCardName is not provided
export const PackArtPath = CardListPath + "/pack-art";
export const CardBackPath = CardListPath + "/card-back";

export enum PathSegments {
  Cards = 0,
  CardName = 1,
  Sets = 2,
  SetName = 3,
  Card = 4,
  SetImagePath = 4, // This is used for PackArt or CardBack
  // Example: /cards/wm/sets/set1/pack-art or /cards/wm/sets/set1/card-back
  SortByAndCardName = 5,
  // Example: /cards/mz/sets/promo/card/99.3_Sunlight
}

export interface BreadcrumbItem {
  label: string;
  routeTo?: string | undefined;
}

export enum SetImagePathType {
  PackArt = "pack-art",
  CardBack = "card-back",
}
export const getTitleSetImagePathType = (
  pathType: SetImagePathType | undefined,
): string => {
  switch (pathType) {
    case SetImagePathType.PackArt:
      return "Pack Art";
    case SetImagePathType.CardBack:
      return "Card Back";
    case undefined:
    default:
      return "";
  }
};
export function getBreadcrumbItems(locationPathname: string): BreadcrumbItem[] {
  const originalSegments = locationPathname.split("/").filter(Boolean);

  return (
    originalSegments
      .map((segment, index) => {
        // Handle for card name segment
        if (
          originalSegments[PathSegments.Card] == "card" &&
          index === PathSegments.SortByAndCardName
        ) {
          const { cardName } = parseSortAndNameRegex(
            decodeURIComponent(segment),
          );
          // label: Use the card name directly without sortBy number
          // No routeTo
          return { label: cardName, routeTo: undefined };
        }

        // Handle for set image path segment (Pack Art or Card Back)
        if (
          getTitleSetImagePathType(
            decodeURIComponent(segment) as SetImagePathType,
          ) &&
          index === PathSegments.SetImagePath
        ) {
          // label: "Pack Art" or "Card Back"
          // No ruteTo
          return {
            label: getTitleSetImagePathType(
              decodeURIComponent(segment) as SetImagePathType,
            ),
            routeTo: undefined,
          };
        }
        if (originalSegments.length - 1 === index) {
          // If this is the last segment, we don't create a routeTo
          return { label: decodeURIComponent(segment), routeTo: undefined };
        }

        // Handle for other segments
        const routeTo = "/" + originalSegments.slice(0, index + 1).join("/");
        // label and routeTo
        return { label: decodeURIComponent(segment), routeTo: routeTo };
      })
      // Filter out unwanted segments "sets" and "card"
      .filter((item) => item.label !== "sets" && item.label !== "card")
  );
}

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

export function getArtPath(
  set: CollectionSet | undefined,
  pathType: SetImagePathType | undefined,
): string {
  if (!set) {
    return "";
  }
  switch (pathType) {
    case SetImagePathType.PackArt:
      const path = generatePath(PackArtPath, {
        seriesShortName: encodeURIComponent(set.series_short_name),
        setShortName: encodeURIComponent(set.short_name),
      });
      return path;
    case SetImagePathType.CardBack:
      const cardBackPath = generatePath(CardBackPath, {
        seriesShortName: encodeURIComponent(set.series_short_name),
        setShortName: encodeURIComponent(set.short_name),
      });
      return cardBackPath;
    case undefined:
    default:
      return "";
  }
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

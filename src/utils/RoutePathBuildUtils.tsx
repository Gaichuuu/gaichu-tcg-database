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
// src/utils/RoutePathBuildUtils.tsx
export function getBreadcrumbItems(locationPathname: string): BreadcrumbItem[] {
  const segments = locationPathname.split("/").filter(Boolean);
  const items: BreadcrumbItem[] = [];

  // Decodes 1–3 times to handle double-encoded segments like "%2520" -> "%20" -> " "
  const decodeMulti = (s: string) => {
    let out = s;
    for (let i = 0; i < 3; i++) {
      try {
        const next = decodeURIComponent(out);
        if (next === out) break; // no more to decode
        out = next;
      } catch {
        break; // stop if malformed
      }
    }
    // final guard just in case a lone "%20" slipped through
    return out.replace(/%20/g, " ");
  };

  for (let index = 0; index < segments.length; index++) {
    const segment = segments[index];

    // skip scaffolding segments
    if (segment === "sets" || segment === "card") continue;

    // pack-art / card-back title
    if (index === PathSegments.SetImagePath) {
      const title = getTitleSetImagePathType(
        decodeMulti(segment) as SetImagePathType,
      );
      if (title) {
        items.push({ label: title }); // routeTo omitted (optional)
        continue;
      }
    }

    // card detail last segment → show only the card name (strip sort)
    if (
      segments[PathSegments.Card] === "card" &&
      index === PathSegments.SortByAndCardName
    ) {
      const decoded = decodeMulti(segment);
      const { cardName } = parseSortAndNameRegex(decoded);
      items.push({ label: cardName }); // no routeTo on the last crumb
      continue;
    }

    // all other segments
    const label = decodeMulti(segment);
    const isLast = index === segments.length - 1;
    const routeTo = isLast
      ? undefined
      : "/" + segments.slice(0, index + 1).join("/");
    items.push({ label, routeTo });
  }
  console.log("[breadcrumbs]", { segments, items });
  return items;
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
  sortBy?: number; // now optional
  cardName: string;
} {
  const s = (input ?? "").trim();
  if (!s) return { cardName: "" };

  // Accept "<sort>_<name>" (your current format),
  // and be tolerant to "<sort>--<name>" or "<sort>-<name>" just in case.
  const m = s.match(/^(?<sort>\d+(?:\.\d+)?)(?:[_-]{1,2})(?<name>.+)$/);
  if (m?.groups) {
    const n = Number(m.groups.sort);
    return {
      sortBy: Number.isFinite(n) ? n : undefined,
      cardName: m.groups.name,
    };
    // e.g., "99.3_Sunlight" → { sortBy: 99.3, cardName: "Sunlight" }
  }

  // Fallback: treat entire segment as the name (handles "Heavy Boy")
  return { cardName: s };
}

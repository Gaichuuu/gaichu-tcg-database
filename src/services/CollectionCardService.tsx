// src/services/CollectionCardService.tsx
import { database } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  limit as ql,
  getDocs,
  orderBy,
} from "firebase/firestore";
import type { CollectionCard } from "@/types/CollectionCard";
import { t } from "@/i18n/locale";
import { slugify } from "@/utils/RoutePathBuildUtils";

const cardsRef = collection(database, "cards");
const __DEV__ = import.meta.env.DEV;

const toSlug = (v: unknown) =>
  slugify(typeof v === "string" ? v : t(v as any, "en"));

function warnIfCamel(raw: any, id?: string) {
  if (!__DEV__) return;
  if (raw?.seriesShortName || raw?.setShortName) {
    console.warn(
      `[cards] camelCase field(s) found in doc ${id ?? "(unknown)"}; ` +
        `please fix the data to use snake_case (ex: series_short_name).`,
    );
  }
}

function asCard(raw: any, id?: string): CollectionCard {
  warnIfCamel(raw, id);
  return raw as CollectionCard;
}

async function getDocsWithSeriesSet(
  seriesShortName: string,
  setShortName: string,
  extra: any[] = [],
) {
  return getDocs(
    query(
      cardsRef,
      where("series_short_name", "==", seriesShortName),
      where("set_short_name", "==", setShortName),
      ...extra,
    ),
  );
}

export async function fetchCardDetail(
  seriesShortName: string,
  setShortName: string,
  sortBy: number | undefined,
  cardNameFromUrl: string,
): Promise<CollectionCard | null> {
  const targetSlug = slugify(cardNameFromUrl);

  if (Number.isFinite(sortBy as number)) {
    try {
      const snap = await getDocsWithSeriesSet(seriesShortName, setShortName, [
        where("sortBy", "==", sortBy),
        ql(1),
      ]);
      if (!snap.empty) return asCard(snap.docs[0].data(), snap.docs[0].id);
    } catch (e) {
      console.warn("[cards] sortBy query failed (index?):", e);
    }
  }

  try {
    const withinSet = await getDocsWithSeriesSet(
      seriesShortName,
      setShortName,
      [ql(1000)],
    );
    const match =
      withinSet.docs
        .map((d) => asCard(d.data(), d.id))
        .find((d) => toSlug((d as any).name) === targetSlug) ?? null;

    if (match) return match;
  } catch (e) {
    console.warn("[cards] set-scan failed:", e);
  }

  return null;
}

export async function fetchAdjacentCards(
  seriesShortName: string,
  setShortName: string,
  sortBy: number | undefined,
): Promise<{
  previousCard: CollectionCard | null;
  nextCard: CollectionCard | null;
}> {
  if (!Number.isFinite(sortBy as number))
    return { previousCard: null, nextCard: null };

  try {
    const prevSnap = await getDocsWithSeriesSet(seriesShortName, setShortName, [
      where("sortBy", "<", sortBy),
      orderBy("sortBy", "desc"),
      ql(1),
    ]);
    const nextSnap = await getDocsWithSeriesSet(seriesShortName, setShortName, [
      where("sortBy", ">", sortBy),
      orderBy("sortBy", "asc"),
      ql(1),
    ]);

    return {
      previousCard: prevSnap.empty
        ? null
        : asCard(prevSnap.docs[0].data(), prevSnap.docs[0].id),
      nextCard: nextSnap.empty
        ? null
        : asCard(nextSnap.docs[0].data(), nextSnap.docs[0].id),
    };
  } catch (e) {
    console.warn("[cards] adjacent query failed (likely missing index):", e);
    return { previousCard: null, nextCard: null };
  }
}

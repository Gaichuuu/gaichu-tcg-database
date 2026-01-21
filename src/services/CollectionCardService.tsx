// src/services/CollectionCardService.tsx
import { database } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  limit as ql,
  getDocs,
  orderBy,
  QueryConstraint,
  DocumentData,
} from "firebase/firestore/lite";
import type { CollectionCard } from "@/types/CollectionCard";
import type { CollectionSet } from "@/types/CollectionSet";
import { I18nValue, t } from "@/i18n";
import { slugify } from "@/utils/RoutePathBuildUtils";

const cardsRef = collection(database, "cards");
const setsRef = collection(database, "sets");
const __DEV__ = import.meta.env.DEV;

const toSlug = (v: unknown): string =>
  slugify(typeof v === "string" ? v : t(v as I18nValue, "en"));

function warnIfCamel(raw: DocumentData, id?: string) {
  if (!__DEV__) return;
  if (raw?.seriesShortName || raw?.setShortName) {
    console.warn(
      `[cards] camelCase field(s) found in doc ${id ?? "(unknown)"}; ` +
        `please fix the data to use snake_case (ex: series_short_name).`,
    );
  }
}

function asCard(
  raw: DocumentData,
  set: CollectionSet,
  id?: string,
): CollectionCard {
  warnIfCamel(raw, id);
  return {
    ...raw,
    set_short_name: set.short_name,
    series_short_name: set.series_short_name,
    total_cards_count: set.total_cards_count ?? 0,
    sets: [{ name: set.name, image: set.logo }],
  } as CollectionCard;
}

async function getSetByShortNames(
  seriesShortName: string,
  setShortName: string,
): Promise<CollectionSet | null> {
  const setQuery = query(
    setsRef,
    where("series_short_name", "==", seriesShortName),
    where("short_name", "==", setShortName),
    ql(1),
  );
  const snap = await getDocs(setQuery);
  if (snap.empty) return null;
  return { id: snap.docs[0].id, ...snap.docs[0].data() } as CollectionSet;
}

async function getDocsWithSetId(setId: string, extra: QueryConstraint[] = []) {
  return getDocs(
    query(cardsRef, where("set_ids", "array-contains", setId), ...extra),
  );
}

export async function fetchCardDetail(
  seriesShortName: string,
  setShortName: string,
  sortBy: number | undefined,
  cardNameFromUrl: string,
): Promise<CollectionCard | null> {
  const targetSlug = slugify(cardNameFromUrl);

  const set = await getSetByShortNames(seriesShortName, setShortName);
  if (!set) {
    console.warn("[cards] set not found:", seriesShortName, setShortName);
    return null;
  }

  if (Number.isFinite(sortBy as number)) {
    try {
      const snap = await getDocsWithSetId(set.id, [
        where("sort_by", "==", sortBy),
        ql(1),
      ]);
      if (!snap.empty)
        return asCard(snap.docs[0].data(), set, snap.docs[0].id);
    } catch (e) {
      console.warn("[cards] sort_by query failed (index?):", e);
    }
  }

  try {
    const withinSet = await getDocsWithSetId(set.id, [ql(1000)]);
    const match =
      withinSet.docs
        .map((d) => asCard(d.data(), set, d.id))
        .find((d) => toSlug(d.name) === targetSlug) ?? null;

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

  const set = await getSetByShortNames(seriesShortName, setShortName);
  if (!set) return { previousCard: null, nextCard: null };

  try {
    const prevSnap = await getDocsWithSetId(set.id, [
      where("sort_by", "<", sortBy),
      orderBy("sort_by", "desc"),
      ql(1),
    ]);
    const nextSnap = await getDocsWithSetId(set.id, [
      where("sort_by", ">", sortBy),
      orderBy("sort_by", "asc"),
      ql(1),
    ]);

    return {
      previousCard: prevSnap.empty
        ? null
        : asCard(prevSnap.docs[0].data(), set, prevSnap.docs[0].id),
      nextCard: nextSnap.empty
        ? null
        : asCard(nextSnap.docs[0].data(), set, nextSnap.docs[0].id),
    };
  } catch (e) {
    console.warn("[cards] adjacent query failed (likely missing index):", e);
    return { previousCard: null, nextCard: null };
  }
}

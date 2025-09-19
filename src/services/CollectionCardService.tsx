import { db } from "../lib/firebase";
import {
  collection,
  query,
  where,
  limit as ql,
  getDocs,
  orderBy,
} from "firebase/firestore";
import type { CollectionCard } from "../types/CollectionCard";

const cardsRef = collection(db, "cards");

const normalize = (s: string) =>
  (s ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

/** Ensure returned objects always expose snake_case keys we use elsewhere. */
function coerceCard(raw: any): CollectionCard {
  return {
    ...raw,
    series_short_name: raw.series_short_name ?? raw.seriesShortName ?? "",
    set_short_name: raw.set_short_name ?? raw.setShortName ?? "",
  } as CollectionCard;
}

/** Run a query scoping series/set; first try snake_case, then camelCase. */
async function getDocsWithSeriesSet(
  seriesShortName: string,
  setShortName: string,
  extra: any[] = [],
) {
  // snake_case
  try {
    const snap = await getDocs(
      query(
        cardsRef,
        where("series_short_name", "==", seriesShortName),
        where("set_short_name", "==", setShortName),
        ...extra,
      ),
    );
    if (!snap.empty) return snap;
  } catch (e) {
    console.warn("[cards] snake_case series/set query threw (index?):", e);
  }

  // camelCase fallback
  try {
    const snap = await getDocs(
      query(
        cardsRef,
        where("seriesShortName", "==", seriesShortName),
        where("setShortName", "==", setShortName),
        ...extra,
      ),
    );
    return snap;
  } catch (e) {
    console.warn("[cards] camelCase series/set query threw (index?):", e);
    throw e;
  }
}

/** Find a card by sort index when present, otherwise by exact name (with robust fallbacks). */
export async function fetchCardDetail(
  seriesShortName: string,
  setShortName: string,
  sortBy: number | undefined,
  cardName: string,
): Promise<CollectionCard | null> {
  console.log("[cards] fetchCardDetail params", {
    seriesShortName,
    setShortName,
    sortBy,
    cardName,
  });

  // 1) Prefer precise lookup by sortBy
  if (Number.isFinite(sortBy as number)) {
    try {
      const snap = await getDocsWithSeriesSet(seriesShortName, setShortName, [
        where("sortBy", "==", sortBy),
        ql(1),
      ]);
      console.log("[cards] sortBy match count:", snap.size);
      if (!snap.empty) {
        const doc = coerceCard(snap.docs[0].data());
        console.log("[cards] sortBy sample:", {
          id: snap.docs[0].id,
          name: doc.name,
          series_short_name: doc.series_short_name,
          set_short_name: doc.set_short_name,
          sortBy: doc.sortBy,
        });
        return doc;
      }
    } catch (e) {
      console.warn("[cards] sortBy query failed (likely index):", e);
    }
  }

  // 2) Name-only query (single eq) then filter by series/set client-side
  try {
    const byName = await getDocs(
      query(cardsRef, where("name", "==", cardName)),
    );
    console.log("[cards] name-only count:", byName.size);
    if (!byName.empty) {
      const match = byName.docs
        .map((d) => coerceCard(d.data()))
        .find(
          (d) =>
            d.series_short_name === seriesShortName &&
            d.set_short_name === setShortName,
        );
      if (match) {
        console.log("[cards] name-only matched", {
          id: match.id,
          name: match.name,
        });
        return match;
      }
    }
  } catch (e) {
    console.warn("[cards] name-only query failed:", e);
  }

  // 3) Set-scan (two eq). If this throws (index), fall back to series-only.
  try {
    const withinSet = await getDocsWithSeriesSet(
      seriesShortName,
      setShortName,
      [ql(1000)],
    );
    console.log("[cards] within-set count:", withinSet.size);
    const wanted = normalize(cardName);
    const match = withinSet.docs
      .map((d) => coerceCard(d.data()))
      .find((d) => normalize(d.name) === wanted);
    if (match) {
      console.log("[cards] set-scan matched", {
        id: match.id,
        name: match.name,
      });
      return match;
    }
  } catch (e) {
    console.warn(
      "[cards] set-scan threw (index). Falling back to series-only filter:",
      e,
    );
    try {
      // series-only scan (no composite index) then filter in memory
      // snake_case
      let bySeries = await getDocs(
        query(
          cardsRef,
          where("series_short_name", "==", seriesShortName),
          ql(3000),
        ),
      );
      if (bySeries.empty) {
        // camelCase fallback
        bySeries = await getDocs(
          query(
            cardsRef,
            where("seriesShortName", "==", seriesShortName),
            ql(3000),
          ),
        );
      }
      console.log("[cards] by-series count:", bySeries.size);
      const wanted = normalize(cardName);
      const match = bySeries.docs
        .map((d) => coerceCard(d.data()))
        .filter((d) => d.set_short_name === setShortName)
        .find((d) => normalize(d.name) === wanted);
      if (match) {
        console.log("[cards] series-scan matched", {
          id: match.id,
          name: match.name,
        });
        return match;
      }
    } catch (e2) {
      console.error("[cards] series-only fallback failed:", e2);
    }
  }

  console.warn("[cards] no match for", {
    seriesShortName,
    setShortName,
    sortBy,
    cardName,
  });
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
  if (!Number.isFinite(sortBy as number)) {
    return { previousCard: null, nextCard: null };
  }

  try {
    // uses the helper from earlier; if you don't have it, see note below
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
      previousCard: prevSnap.empty ? null : coerceCard(prevSnap.docs[0].data()),
      nextCard: nextSnap.empty ? null : coerceCard(nextSnap.docs[0].data()),
    };
  } catch (e) {
    console.warn("[cards] adjacent query failed (likely missing index):", e);
    // Don’t fail the whole page if prev/next can’t load
    return { previousCard: null, nextCard: null };
  }
}

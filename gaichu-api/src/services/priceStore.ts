import admin from "firebase-admin";
import type {
  EbayPriceData,
  EbaySale,
  CardPriceSummary,
} from "../types/index.js";
import { getIsoWeekKey, isoWeekMonday } from "../utils/isoWeek.js";
import { calculatePriceStats, mergeSales } from "./priceStats.js";

export function getFirestore(): admin.firestore.Firestore {
  if (!admin.apps.length) {
    admin.initializeApp();
  }
  return admin.firestore();
}

export interface StoredPriceDoc {
  series_short_name: string;
  prices: EbayPriceData;
  all_sales?: EbaySale[];
  recent_sales?: EbaySale[];
  fetched_at: string;
  created_at: string;
}

export function newestSaleDate(
  sales: Array<{ date_sold: string }> | undefined,
): string | null {
  let newest = Number.NEGATIVE_INFINITY;
  for (const sale of sales ?? []) {
    const t = Date.parse(sale.date_sold);
    if (!Number.isNaN(t) && t > newest) newest = t;
  }
  return Number.isFinite(newest) ? new Date(newest).toISOString() : null;
}

export function toPriceSummary(data: StoredPriceDoc): CardPriceSummary {
  return {
    average_price: data.prices?.average_price ?? null,
    median_price: data.prices?.median_price ?? null,
    min_price: data.prices?.min_price ?? null,
    max_price: data.prices?.max_price ?? null,
    sample_size: data.prices?.sample_size ?? 0,
    last_updated: data.fetched_at,
    last_sale_date: newestSaleDate(data.all_sales ?? data.recent_sales),
    ebay_search_url: data.prices?.response_url,
  };
}

export async function saveWithRollingWindow<T extends StoredPriceDoc>(
  collection: string,
  docId: string,
  fresh: T,
): Promise<void> {
  const docRef = getFirestore().collection(collection).doc(docId);
  const existingDoc = await docRef.get();
  const existing = existingDoc.exists ? (existingDoc.data() as T) : undefined;

  const mergedSales = mergeSales(
    existing?.all_sales ?? existing?.recent_sales ?? [],
    fresh.all_sales ?? fresh.recent_sales ?? [],
  );
  const prices = calculatePriceStats(mergedSales);
  if (fresh.prices.response_url) {
    prices.response_url = fresh.prices.response_url;
  }

  await docRef.set({
    ...fresh,
    all_sales: mergedSales,
    recent_sales: mergedSales.slice(0, 10),
    prices,
    created_at: existing?.created_at ?? fresh.created_at,
    updated_at: new Date().toISOString(),
  });
}

export interface WeeklySnapshotFields {
  series_short_name: string;
  week: string;
  snapshot_date: string;
  average_price: number | null;
  median_price: number | null;
  min_price: number | null;
  max_price: number | null;
  sample_size: number;
  source: "sync" | "git-backfill" | "trawl-backfill";
  created_at: string;
}

const snapshotsOf = (historyCollection: string, id: string) =>
  getFirestore().collection(historyCollection).doc(id).collection("snapshots");

export async function writeWeeklySnapshot(
  historyCollection: string,
  id: string,
  snapshot: WeeklySnapshotFields,
): Promise<void> {
  await snapshotsOf(historyCollection, id)
    .doc(snapshot.week)
    .set(snapshot, { merge: true });
}

export async function readWeeklyHistory<T>(
  historyCollection: string,
  id: string,
  fromDate?: string,
): Promise<T[]> {
  let query: admin.firestore.Query = snapshotsOf(historyCollection, id);
  if (fromDate) query = query.where("snapshot_date", ">=", fromDate);
  const snap = await query.orderBy("snapshot_date", "asc").get();
  return snap.docs.map((d) => d.data() as T);
}

export async function archiveAllSnapshots(
  priceCollection: string,
  historyCollection: string,
  idField: "card_id" | "set_id",
  now: Date,
): Promise<number> {
  const db = getFirestore();
  const week = getIsoWeekKey(now);
  const snapshotDate = isoWeekMonday(now);
  const createdAt = now.toISOString();
  const docs = (
    await db
      .collection(priceCollection)
      .select(idField, "series_short_name", "prices")
      .get()
  ).docs;

  const BATCH = 400;
  for (let i = 0; i < docs.length; i += BATCH) {
    const batch = db.batch();
    for (const doc of docs.slice(i, i + BATCH)) {
      const d = doc.data() as {
        series_short_name: string;
        prices?: EbayPriceData;
      } & Record<string, unknown>;
      const id = (d[idField] as string | undefined) ?? doc.id;
      const record: WeeklySnapshotFields & Record<string, unknown> = {
        [idField]: id,
        series_short_name: d.series_short_name,
        week,
        snapshot_date: snapshotDate,
        average_price: d.prices?.average_price ?? null,
        median_price: d.prices?.median_price ?? null,
        min_price: d.prices?.min_price ?? null,
        max_price: d.prices?.max_price ?? null,
        sample_size: d.prices?.sample_size ?? 0,
        source: "sync",
        created_at: createdAt,
      };
      batch.set(snapshotsOf(historyCollection, id).doc(week), record, {
        merge: true,
      });
    }
    await batch.commit();
  }
  return docs.length;
}

export async function logRun<T extends object>(
  logCollection: string,
  entry: T,
): Promise<void> {
  await getFirestore().collection(logCollection).add(entry);
}

export async function recentRuns<T>(
  logCollection: string,
  limit: number,
): Promise<T[]> {
  const snapshot = await getFirestore()
    .collection(logCollection)
    .orderBy("timestamp", "desc")
    .limit(limit)
    .get();
  return snapshot.docs.map((doc) => doc.data() as T);
}

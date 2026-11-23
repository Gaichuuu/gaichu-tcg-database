import admin from "firebase-admin";
import type {
  PackPrice,
  PackPriceSummary,
  WeeklyPackPriceSnapshot,
} from "../types/index.js";
import {
  archiveAllSnapshots,
  getFirestore,
  logRun,
  readWeeklyHistory,
  recentRuns,
  saveWithRollingWindow,
  toPriceSummary,
  writeWeeklySnapshot,
} from "./priceStore.js";

const COLLECTION_NAME = "pack_prices";
const PRICE_HISTORY_COLLECTION = "pack_price_history";
const SYNC_LOG_COLLECTION = "pack_price_sync_logs";

export async function getPackPrice(
  setId: string,
): Promise<PackPriceSummary | null> {
  const doc = await getFirestore().collection(COLLECTION_NAME).doc(setId).get();
  if (!doc.exists) return null;
  return toPriceSummary(doc.data() as PackPrice);
}

export async function getPackPrices(
  series?: string,
): Promise<PackPriceSummary[]> {
  let query: admin.firestore.Query = getFirestore().collection(COLLECTION_NAME);
  if (series) query = query.where("series_short_name", "==", series);
  const snapshot = await query.get();
  return snapshot.docs.map((doc) => toPriceSummary(doc.data() as PackPrice));
}

export async function savePackPrice(packPrice: PackPrice): Promise<void> {
  await saveWithRollingWindow(COLLECTION_NAME, packPrice.set_id, packPrice);
}

export async function getAllPricedSetIds(): Promise<Set<string>> {
  const db = getFirestore();
  const snapshot = await db.collection(COLLECTION_NAME).select("set_id").get();
  return new Set(snapshot.docs.map((doc) => doc.data().set_id as string));
}

export async function getStaleSetIds(thresholdDays: number): Promise<string[]> {
  const db = getFirestore();
  const threshold = new Date();
  threshold.setDate(threshold.getDate() - thresholdDays);
  const snapshot = await db
    .collection(COLLECTION_NAME)
    .where("fetched_at", "<", threshold.toISOString())
    .select("set_id")
    .get();
  return snapshot.docs.map((doc) => doc.data().set_id as string);
}

export interface PackSyncLogEntry {
  timestamp: string;
  trigger: "scheduled" | "manual";
  packsProcessed: number;
  success: number;
  noResults: number;
  errors: number;
  updatedPacks: Array<{ setId: string; packName: string }>;
}

export async function logPackSyncRun(entry: PackSyncLogEntry): Promise<void> {
  await logRun(SYNC_LOG_COLLECTION, entry);
}

export async function getLastPackSyncLog(): Promise<PackSyncLogEntry | null> {
  return (
    (await recentRuns<PackSyncLogEntry>(SYNC_LOG_COLLECTION, 1))[0] ?? null
  );
}

export async function getRecentPackSyncLogs(
  limit = 10,
): Promise<PackSyncLogEntry[]> {
  return recentRuns<PackSyncLogEntry>(SYNC_LOG_COLLECTION, limit);
}

export async function archiveWeeklyPackSnapshot(
  snapshot: WeeklyPackPriceSnapshot,
): Promise<void> {
  await writeWeeklySnapshot(
    PRICE_HISTORY_COLLECTION,
    snapshot.set_id,
    snapshot,
  );
}

export async function getWeeklyPackHistory(
  setId: string,
  fromDate?: string,
): Promise<WeeklyPackPriceSnapshot[]> {
  return readWeeklyHistory<WeeklyPackPriceSnapshot>(
    PRICE_HISTORY_COLLECTION,
    setId,
    fromDate,
  );
}

export async function archiveSnapshotsForAllPacks(now: Date): Promise<number> {
  return archiveAllSnapshots(
    COLLECTION_NAME,
    PRICE_HISTORY_COLLECTION,
    "set_id",
    now,
  );
}

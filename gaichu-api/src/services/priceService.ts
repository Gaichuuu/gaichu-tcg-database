import admin from "firebase-admin";
import type {
  CardPrice,
  CardPriceSummary,
  WeeklyPriceSnapshot,
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

export { newestSaleDate } from "./priceStore.js";

const COLLECTION_NAME = "card_prices";
const PRICE_HISTORY_COLLECTION = "card_price_history";

/**
 * Get price for a single card by ID
 */
export async function getCardPrice(
  cardId: string,
): Promise<CardPriceSummary | null> {
  const db = getFirestore();
  const doc = await db.collection(COLLECTION_NAME).doc(cardId).get();

  if (!doc.exists) {
    return null;
  }

  return toPriceSummary(doc.data() as CardPrice);
}

/**
 * Get full price document for a card (internal use)
 */
export async function getCardPriceDocument(
  cardId: string,
): Promise<CardPrice | null> {
  const db = getFirestore();
  const doc = await db.collection(COLLECTION_NAME).doc(cardId).get();

  if (!doc.exists) {
    return null;
  }

  return doc.data() as CardPrice;
}

/**
 * Get prices for all cards in a series/set
 */
export async function getCardPrices(
  series?: string,
  set?: string,
): Promise<CardPriceSummary[]> {
  const db = getFirestore();
  let query: admin.firestore.Query = db.collection(COLLECTION_NAME);

  if (series) {
    query = query.where("series_short_name", "==", series);
  }
  if (set) {
    query = query.where("set_short_name", "==", set);
  }

  const snapshot = await query.get();
  return snapshot.docs.map((doc) => toPriceSummary(doc.data() as CardPrice));
}

/**
 * Save or update a card price document with rolling window merge
 */
export async function saveCardPrice(cardPrice: CardPrice): Promise<void> {
  await saveWithRollingWindow(COLLECTION_NAME, cardPrice.card_id, cardPrice);
}

/**
 * Get cards that need price updates (older than threshold)
 */
export async function getStaleCardIds(
  thresholdDays: number,
): Promise<string[]> {
  const db = getFirestore();
  const threshold = new Date();
  threshold.setDate(threshold.getDate() - thresholdDays);
  const thresholdIso = threshold.toISOString();

  const snapshot = await db
    .collection(COLLECTION_NAME)
    .where("fetched_at", "<", thresholdIso)
    .select("card_id")
    .get();

  return snapshot.docs.map((doc) => doc.data().card_id as string);
}

/**
 * Get all card IDs that have price data
 */
export async function getAllPricedCardIds(): Promise<Set<string>> {
  const db = getFirestore();
  const snapshot = await db.collection(COLLECTION_NAME).select("card_id").get();
  return new Set(snapshot.docs.map((doc) => doc.data().card_id as string));
}

/**
 * Backfill eBay search URLs for documents that don't have them
 * Uses the stored search_query_used to generate the URL
 */
export async function backfillEbayUrls(
  buildEbaySearchUrl: (query: string) => string,
): Promise<{ updated: number; skipped: number }> {
  const db = getFirestore();
  const snapshot = await db.collection(COLLECTION_NAME).get();

  let updated = 0;
  let skipped = 0;

  // Process in batches of 500 (Firestore limit)
  const batchSize = 500;
  let batch = db.batch();
  let batchCount = 0;

  for (const doc of snapshot.docs) {
    const data = doc.data() as CardPrice;

    // Skip if already has URL or no search query stored
    if (data.prices?.response_url || !data.search_query_used) {
      skipped++;
      continue;
    }

    // Generate URL from stored search query
    const ebaySearchUrl = buildEbaySearchUrl(data.search_query_used);

    batch.update(doc.ref, {
      "prices.response_url": ebaySearchUrl,
      updated_at: new Date().toISOString(),
    });

    updated++;
    batchCount++;

    // Commit batch when it reaches the limit
    if (batchCount >= batchSize) {
      await batch.commit();
      batch = db.batch();
      batchCount = 0;
    }
  }

  // Commit any remaining updates
  if (batchCount > 0) {
    await batch.commit();
  }

  return { updated, skipped };
}

/**
 * Sync log entry for tracking price sync runs
 */
export interface SyncLogEntry {
  timestamp: string;
  trigger: "scheduled" | "manual";
  cardsProcessed: number;
  success: number;
  noResults: number;
  errors: number;
  updatedCards: Array<{ cardId: string; cardName: string }>;
}

const SYNC_LOG_COLLECTION = "price_sync_logs";

/** Log a price sync run to Firestore. */
export async function logSyncRun(entry: SyncLogEntry): Promise<void> {
  await logRun(SYNC_LOG_COLLECTION, entry);
}

/** The most recent sync log entry. */
export async function getLastSyncLog(): Promise<SyncLogEntry | null> {
  return (await recentRuns<SyncLogEntry>(SYNC_LOG_COLLECTION, 1))[0] ?? null;
}

/** Recent sync logs, newest first. */
export async function getRecentSyncLogs(
  limit: number = 10,
): Promise<SyncLogEntry[]> {
  return recentRuns<SyncLogEntry>(SYNC_LOG_COLLECTION, limit);
}

/** Write one weekly price snapshot (idempotent by week key). */
export async function archiveWeeklySnapshot(
  snapshot: WeeklyPriceSnapshot,
): Promise<void> {
  await writeWeeklySnapshot(
    PRICE_HISTORY_COLLECTION,
    snapshot.card_id,
    snapshot,
  );
}

/** A card's weekly snapshots, oldest first; optionally from a date. */
export async function getWeeklyPriceHistory(
  cardId: string,
  fromDate?: string,
): Promise<WeeklyPriceSnapshot[]> {
  return readWeeklyHistory<WeeklyPriceSnapshot>(
    PRICE_HISTORY_COLLECTION,
    cardId,
    fromDate,
  );
}

export async function archiveSnapshotsForAllCards(now: Date): Promise<number> {
  return archiveAllSnapshots(
    COLLECTION_NAME,
    PRICE_HISTORY_COLLECTION,
    "card_id",
    now,
  );
}

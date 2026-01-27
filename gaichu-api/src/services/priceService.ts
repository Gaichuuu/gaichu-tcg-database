import admin from "firebase-admin";
import type {
  CardPrice,
  CardPriceSummary,
  EbayPriceData,
  EbaySale,
} from "../types/index.js";

/** Rolling window for sales data (in days) */
const ROLLING_WINDOW_DAYS = 90;

/**
 * Calculate price statistics from an array of sales
 */
function calculatePriceStats(sales: EbaySale[]): EbayPriceData {
  if (sales.length === 0) {
    return {
      average_price: null,
      median_price: null,
      min_price: null,
      max_price: null,
      sample_size: 0,
    };
  }

  const prices = sales.map((s) => s.sale_price).sort((a, b) => a - b);
  const sum = prices.reduce((a, b) => a + b, 0);
  const mid = Math.floor(prices.length / 2);

  return {
    average_price: Math.round((sum / prices.length) * 100) / 100,
    median_price:
      prices.length % 2 ? prices[mid] : (prices[mid - 1] + prices[mid]) / 2,
    min_price: prices[0],
    max_price: prices[prices.length - 1],
    sample_size: prices.length,
  };
}

/**
 * Extract eBay item ID from a link URL
 * Links look like: https://www.ebay.com/itm/116462454412?...
 */
function extractEbayItemId(link: string): string {
  const match = link.match(/\/itm\/(\d+)/);
  return match ? match[1] : link; // Fall back to full link if no match
}

/**
 * Merge new sales with existing, dedupe by eBay item ID, and filter to rolling window
 */
function mergeSales(
  existingSales: EbaySale[],
  newSales: EbaySale[],
): EbaySale[] {
  // Dedupe by eBay item ID (extracted from link)
  // The full link contains search-specific query params that change between API calls
  const salesByItemId = new Map<string, EbaySale>();
  for (const sale of existingSales) {
    salesByItemId.set(extractEbayItemId(sale.link), sale);
  }
  for (const sale of newSales) {
    salesByItemId.set(extractEbayItemId(sale.link), sale);
  }

  // Filter to rolling window and sort by date descending
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - ROLLING_WINDOW_DAYS);

  return Array.from(salesByItemId.values())
    .filter((sale) => new Date(sale.date_sold) >= cutoffDate)
    .sort(
      (a, b) =>
        new Date(b.date_sold).getTime() - new Date(a.date_sold).getTime(),
    );
}

// Initialize Firebase Admin if not already initialized
function getFirestore(): admin.firestore.Firestore {
  if (!admin.apps.length) {
    admin.initializeApp();
  }
  return admin.firestore();
}

const COLLECTION_NAME = "card_prices";

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

  const data = doc.data() as CardPrice;
  return {
    average_price: data.prices?.average_price ?? null,
    median_price: data.prices?.median_price ?? null,
    min_price: data.prices?.min_price ?? null,
    max_price: data.prices?.max_price ?? null,
    sample_size: data.prices?.sample_size ?? 0,
    last_updated: data.fetched_at,
    ebay_search_url: data.prices?.response_url,
  };
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
  return snapshot.docs.map((doc) => {
    const data = doc.data() as CardPrice;
    return {
      average_price: data.prices?.average_price ?? null,
      median_price: data.prices?.median_price ?? null,
      min_price: data.prices?.min_price ?? null,
      max_price: data.prices?.max_price ?? null,
      sample_size: data.prices?.sample_size ?? 0,
      last_updated: data.fetched_at,
      ebay_search_url: data.prices?.response_url,
    };
  });
}

/**
 * Save or update a card price document with rolling window merge
 */
export async function saveCardPrice(cardPrice: CardPrice): Promise<void> {
  const db = getFirestore();
  const docRef = db.collection(COLLECTION_NAME).doc(cardPrice.card_id);
  const existingDoc = await docRef.get();

  if (existingDoc.exists) {
    const existing = existingDoc.data() as CardPrice;

    // Merge new sales with existing, dedupe, and filter to 90-day window
    const mergedSales = mergeSales(
      existing.all_sales ?? existing.recent_sales ?? [],
      cardPrice.all_sales ?? cardPrice.recent_sales ?? [],
    );

    // Recalculate price stats from merged sales data
    const prices = calculatePriceStats(mergedSales);

    // Preserve response_url from the latest fetch if available
    if (cardPrice.prices.response_url) {
      prices.response_url = cardPrice.prices.response_url;
    }

    await docRef.set({
      ...cardPrice,
      all_sales: mergedSales,
      recent_sales: mergedSales.slice(0, 10),
      prices,
      created_at: existing.created_at,
      updated_at: new Date().toISOString(),
    });
  } else {
    // New document - use incoming sales as all_sales
    const allSales = cardPrice.all_sales ?? cardPrice.recent_sales ?? [];
    await docRef.set({
      ...cardPrice,
      all_sales: allSales,
      recent_sales: allSales.slice(0, 10),
    });
  }
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
 * Batch save multiple card prices
 */
export async function batchSaveCardPrices(
  cardPrices: CardPrice[],
): Promise<void> {
  const db = getFirestore();
  const batch = db.batch();

  for (const cardPrice of cardPrices) {
    const docRef = db.collection(COLLECTION_NAME).doc(cardPrice.card_id);
    batch.set(docRef, cardPrice, { merge: true });
  }

  await batch.commit();
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

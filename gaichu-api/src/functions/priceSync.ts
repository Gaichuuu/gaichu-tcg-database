import { onSchedule } from "firebase-functions/v2/scheduler";
import { onRequest } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import { loadAllCards } from "../services/dataLoader.js";
import {
  fetchEbayPrice,
  buildCardPriceDocument,
  buildEbaySearchUrl,
  delay,
} from "../services/ebayPriceService.js";
import {
  saveCardPrice,
  getCardPriceDocument,
  getAllPricedCardIds,
  backfillEbayUrls,
  logSyncRun,
} from "../services/priceService.js";
import type { Card } from "../types/index.js";

// Define the secret for RapidAPI key
const rapidApiKey = defineSecret("RAPIDAPI_KEY");

// Configuration
const SYNC_CONFIG = {
  // How old prices must be before refreshing (in days)
  staleDays: 7,
  // Maximum cards to process per run (to stay within rate limits)
  maxCardsPerRun: 50,
  // Delay between API calls (ms) to avoid rate limiting
  delayBetweenCalls: 1500,
  // Only sync cards from these series (fan-made cards sold on eBay)
  enabledSeries: ["wm", "ash"],
};

/**
 * Check if a card needs a price update
 */
function needsPriceUpdate(
  existingPrice: Awaited<ReturnType<typeof getCardPriceDocument>>,
): boolean {
  if (!existingPrice) return true;

  const fetchedAt = new Date(existingPrice.fetched_at);
  const now = new Date();
  const daysSinceUpdate =
    (now.getTime() - fetchedAt.getTime()) / (1000 * 60 * 60 * 24);

  return daysSinceUpdate >= SYNC_CONFIG.staleDays;
}

/**
 * Get cards that should be synced
 */
async function getCardsToSync(): Promise<Card[]> {
  const allCards = loadAllCards();

  // Filter to enabled series only
  const eligibleCards = allCards.filter((card) =>
    SYNC_CONFIG.enabledSeries.includes(card.series_short_name),
  );

  // Get existing priced card IDs
  const pricedCardIds = await getAllPricedCardIds();

  // Prioritize cards without prices, then cards with stale prices
  const cardsWithoutPrices: Card[] = [];
  const cardsToCheck: Card[] = [];

  for (const card of eligibleCards) {
    if (!pricedCardIds.has(card.id)) {
      cardsWithoutPrices.push(card);
    } else {
      cardsToCheck.push(card);
    }
  }

  // Check which existing cards need updates
  const cardsNeedingUpdate: Card[] = [];
  for (const card of cardsToCheck) {
    const existingPrice = await getCardPriceDocument(card.id);
    if (needsPriceUpdate(existingPrice)) {
      cardsNeedingUpdate.push(card);
    }
  }

  // Combine: new cards first, then stale cards
  const combined = [...cardsWithoutPrices, ...cardsNeedingUpdate];

  // Limit to max per run
  return combined.slice(0, SYNC_CONFIG.maxCardsPerRun);
}

/**
 * Sync prices for a batch of cards
 */
async function syncPrices(
  cards: Card[],
  apiKey: string,
): Promise<{
  success: number;
  noResults: number;
  errors: number;
  details: Array<{ cardId: string; cardName: string; status: string }>;
}> {
  const results = {
    success: 0,
    noResults: 0,
    errors: 0,
    details: [] as Array<{ cardId: string; cardName: string; status: string }>,
  };

  for (let i = 0; i < cards.length; i++) {
    const card = cards[i];
    const cardName =
      typeof card.name === "string"
        ? card.name
        : card.name.en || card.name.ja || "Unknown";

    console.log(
      `[${i + 1}/${cards.length}] Fetching price for: ${cardName} (${card.series_short_name})`,
    );

    try {
      const fetchResult = await fetchEbayPrice(card, apiKey);
      const priceDoc = buildCardPriceDocument(card, fetchResult);
      await saveCardPrice(priceDoc);

      if (fetchResult.status === "success") {
        results.success++;
        console.log(
          `  ✓ Success: $${fetchResult.priceData.median_price?.toFixed(2) ?? "N/A"} median (${fetchResult.priceData.sample_size} sales)`,
        );
      } else if (fetchResult.status === "no_results") {
        results.noResults++;
        console.log(`  - No results found`);
      } else {
        results.errors++;
        console.log(`  ✗ Error: ${fetchResult.errorMessage}`);
      }

      results.details.push({
        cardId: card.id,
        cardName,
        status: fetchResult.status,
      });
    } catch (error) {
      results.errors++;
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      console.error(`  ✗ Exception: ${errorMsg}`);
      results.details.push({
        cardId: card.id,
        cardName,
        status: `error: ${errorMsg}`,
      });
    }

    // Rate limiting delay (skip on last iteration)
    if (i < cards.length - 1) {
      await delay(SYNC_CONFIG.delayBetweenCalls);
    }
  }

  return results;
}

/**
 * Scheduled price sync - runs weekly on Mondays at 8 AM UTC
 * (Monday 12:00 AM PST / 3:00 AM EST)
 * This timing captures weekend eBay sales that typically end Sunday afternoon
 */
export const scheduledPriceSync = onSchedule(
  {
    schedule: "0 8 * * 1", // Cron: 8 AM UTC every Monday
    region: "us-central1",
    memory: "512MiB",
    timeoutSeconds: 540, // 9 minutes max
    secrets: [rapidApiKey],
  },
  async () => {
    console.log("Starting scheduled price sync (Monday 8 AM UTC)...");

    const apiKey = rapidApiKey.value();
    if (!apiKey) {
      console.error("RAPIDAPI_KEY secret not configured");
      return;
    }

    const cardsToSync = await getCardsToSync();
    console.log(`Found ${cardsToSync.length} cards needing price updates`);

    if (cardsToSync.length === 0) {
      console.log("No cards need updating. Sync complete.");
      // Log even when no updates needed
      await logSyncRun({
        timestamp: new Date().toISOString(),
        trigger: "scheduled",
        cardsProcessed: 0,
        success: 0,
        noResults: 0,
        errors: 0,
        updatedCards: [],
      });
      return;
    }

    const results = await syncPrices(cardsToSync, apiKey);

    console.log("\n=== Sync Complete ===");
    console.log(`Success: ${results.success}`);
    console.log(`No Results: ${results.noResults}`);
    console.log(`Errors: ${results.errors}`);

    // Log sync results to Firestore
    await logSyncRun({
      timestamp: new Date().toISOString(),
      trigger: "scheduled",
      cardsProcessed: cardsToSync.length,
      success: results.success,
      noResults: results.noResults,
      errors: results.errors,
      updatedCards: results.details
        .filter((d) => d.status === "success")
        .map((d) => ({ cardId: d.cardId, cardName: d.cardName })),
    });
  },
);

/**
 * Manual trigger endpoint for testing (requires authentication in production)
 */
export const triggerPriceSync = onRequest(
  {
    region: "us-central1",
    memory: "512MiB",
    timeoutSeconds: 540,
    secrets: [rapidApiKey],
  },
  async (req, res) => {
    // Simple auth check - in production, use proper authentication
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const apiKey = rapidApiKey.value();
    if (!apiKey) {
      res.status(500).json({ error: "RAPIDAPI_KEY not configured" });
      return;
    }

    // Allow specifying max cards via query param (up to 200 for manual triggers)
    const maxCards = Math.min(
      parseInt(req.query.max as string) || SYNC_CONFIG.maxCardsPerRun,
      200,
    );

    // Force refresh ignores staleness and syncs all eligible cards
    const forceRefresh = req.query.forceRefresh === "true";

    console.log(
      `Manual price sync triggered (max: ${maxCards} cards, forceRefresh: ${forceRefresh})`,
    );

    let limitedCards: Card[];
    if (forceRefresh) {
      // Get all eligible cards regardless of existing prices
      const allCards = loadAllCards();
      const eligibleCards = allCards.filter((card) =>
        SYNC_CONFIG.enabledSeries.includes(card.series_short_name),
      );
      limitedCards = eligibleCards.slice(0, maxCards);
    } else {
      const cardsToSync = await getCardsToSync();
      limitedCards = cardsToSync.slice(0, maxCards);
    }

    if (limitedCards.length === 0) {
      res.json({
        message: "No cards need updating",
        cardsProcessed: 0,
      });
      return;
    }

    const results = await syncPrices(limitedCards, apiKey);

    res.json({
      message: "Price sync complete",
      cardsProcessed: limitedCards.length,
      results: {
        success: results.success,
        noResults: results.noResults,
        errors: results.errors,
      },
      details: results.details,
    });
  },
);

/**
 * Sync a single card's price (for on-demand updates)
 */
export const syncSingleCardPrice = onRequest(
  {
    region: "us-central1",
    memory: "256MiB",
    timeoutSeconds: 30,
    secrets: [rapidApiKey],
  },
  async (req, res) => {
    const cardId = req.query.cardId as string;
    if (!cardId) {
      res.status(400).json({ error: "cardId query parameter required" });
      return;
    }

    const apiKey = rapidApiKey.value();
    if (!apiKey) {
      res.status(500).json({ error: "RAPIDAPI_KEY not configured" });
      return;
    }

    const allCards = loadAllCards();
    const card = allCards.find((c) => c.id === cardId);

    if (!card) {
      res.status(404).json({ error: "Card not found" });
      return;
    }

    const cardName =
      typeof card.name === "string"
        ? card.name
        : card.name.en || card.name.ja || "Unknown";

    console.log(`Fetching price for card: ${cardName}`);

    const fetchResult = await fetchEbayPrice(card, apiKey);
    const priceDoc = buildCardPriceDocument(card, fetchResult);
    await saveCardPrice(priceDoc);

    res.json({
      cardId: card.id,
      cardName,
      status: fetchResult.status,
      prices: fetchResult.priceData,
      searchQuery: fetchResult.searchQuery,
      recentSales: fetchResult.recentSales.slice(0, 5),
    });
  },
);

/**
 * Backfill eBay search URLs for existing price documents
 * One-time migration endpoint
 */
export const backfillPriceUrls = onRequest(
  {
    region: "us-central1",
    memory: "256MiB",
    timeoutSeconds: 60,
    invoker: "public",
  },
  async (req, res) => {
    // Simple auth check
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    console.log("Starting eBay URL backfill...");

    const result = await backfillEbayUrls(buildEbaySearchUrl);

    console.log(`Backfill complete: ${result.updated} updated, ${result.skipped} skipped`);

    res.json({
      message: "Backfill complete",
      ...result,
    });
  },
);

/**
 * Export prices from Firestore card_prices collection to cards.json files
 *
 * This script:
 * 1. Reads all card prices from Firestore
 * 2. For each series (wm, ash), loads cards.json
 * 3. Adds average_price field to each card (0 if no price data)
 * 4. Writes updated cards.json back to disk
 *
 * Usage: npx tsx scripts/export-prices-to-json.ts
 *
 * Requires: GOOGLE_APPLICATION_CREDENTIALS env var pointing to service account key
 * Or run from a machine with default Firebase credentials
 */

import admin from "firebase-admin";
import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Series that have price data
const PRICED_SERIES = ["wm", "ash"];

// Path to data directory
const DATA_DIR = join(__dirname, "../data");

interface RawCard {
  id: string;
  [key: string]: unknown;
}

interface CardPrice {
  card_id: string;
  prices: {
    average_price: number | null;
  };
}

// Initialize Firebase Admin
function initFirebase() {
  if (admin.apps.length > 0) {
    return admin.firestore();
  }

  // Try to use service account key from config directory
  const serviceAccountPath = join(__dirname, "../config/serviceAccountKey.json");

  try {
    const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, "utf-8"));
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log("Initialized Firebase with service account key");
  } catch {
    // Fall back to default credentials (for Cloud Functions environment)
    admin.initializeApp();
    console.log("Initialized Firebase with default credentials");
  }

  return admin.firestore();
}

async function loadPricesFromFirestore(
  db: admin.firestore.Firestore
): Promise<Map<string, number>> {
  console.log("Loading prices from Firestore...");

  const pricesMap = new Map<string, number>();
  const snapshot = await db.collection("card_prices").get();

  for (const doc of snapshot.docs) {
    const data = doc.data() as CardPrice;
    const avgPrice = data.prices?.average_price;

    // Only include cards with actual price data
    if (avgPrice !== null && avgPrice !== undefined && avgPrice > 0) {
      // Round to 2 decimal places
      pricesMap.set(data.card_id, Math.round(avgPrice * 100) / 100);
    }
  }

  console.log(`Loaded ${pricesMap.size} cards with price data`);
  return pricesMap;
}

function updateCardsJson(
  series: string,
  pricesMap: Map<string, number>
): { updated: number; total: number } {
  const filePath = join(DATA_DIR, series, "cards.json");

  console.log(`\nProcessing ${series}/cards.json...`);

  let cards: RawCard[];
  try {
    const content = readFileSync(filePath, "utf-8");
    cards = JSON.parse(content) as RawCard[];
  } catch (err) {
    console.error(`Failed to read ${filePath}:`, err);
    return { updated: 0, total: 0 };
  }

  let updated = 0;

  for (const card of cards) {
    const price = pricesMap.get(card.id);

    if (price !== undefined) {
      card.average_price = price;
      updated++;
    } else {
      // Set to 0 if no price data (or remove if previously had a price)
      card.average_price = 0;
    }
  }

  // Write back to file with nice formatting
  writeFileSync(filePath, JSON.stringify(cards, null, 2) + "\n", "utf-8");

  console.log(`  Updated: ${updated}/${cards.length} cards with prices`);
  return { updated, total: cards.length };
}

async function main() {
  console.log("=== Export Prices to JSON ===\n");

  const db = initFirebase();
  const pricesMap = await loadPricesFromFirestore(db);

  let totalUpdated = 0;
  let totalCards = 0;

  for (const series of PRICED_SERIES) {
    const result = updateCardsJson(series, pricesMap);
    totalUpdated += result.updated;
    totalCards += result.total;
  }

  console.log("\n=== Summary ===");
  console.log(`Total cards processed: ${totalCards}`);
  console.log(`Cards with prices: ${totalUpdated}`);
  console.log(`Cards without prices: ${totalCards - totalUpdated}`);

  // Exit cleanly
  process.exit(0);
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});

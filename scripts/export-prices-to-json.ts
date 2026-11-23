import admin from "firebase-admin";
import { execFileSync } from "child_process";
import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { initFirebase } from "./lib/firebaseAdmin";
import { PRICED_SERIES } from "../gaichu-api/src/config/pricedSeries.js";
import {
  priceToPublish,
  type SourcePrice,
} from "../gaichu-api/src/services/gridPriceRule.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Path to data directory
const DATA_DIR = join(__dirname, "../data");

interface RawCard {
  id: string;
  number?: number;
  [key: string]: unknown;
}

interface CardPrice {
  card_id: string;
  prices: {
    average_price: number | null;
    sample_size?: number | null;
  };
}

async function loadPricesFromFirestore(
  db: admin.firestore.Firestore,
): Promise<Map<string, SourcePrice>> {
  console.log("Loading prices from Firestore...");

  const pricesMap = new Map<string, SourcePrice>();
  const snapshot = await db
    .collection("card_prices")
    .select("card_id", "prices.average_price", "prices.sample_size")
    .get();

  for (const doc of snapshot.docs) {
    const data = doc.data() as CardPrice;
    const avgPrice = data.prices?.average_price;

    // Only include cards with actual price data
    if (avgPrice !== null && avgPrice !== undefined && avgPrice > 0) {
      pricesMap.set(data.card_id, {
        average: avgPrice,
        sampleSize: data.prices?.sample_size,
      });
    }
  }

  console.log(`Loaded ${pricesMap.size} cards with price data`);
  return pricesMap;
}

function updateCardsJson(
  series: string,
  pricesMap: Map<string, SourcePrice>,
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
    // Tygadu cards 1-30 (non-holo) are not price-tracked
    if (series === "tygadu" && card.number !== undefined && card.number < 31) {
      card.average_price = 0;
      continue;
    }

    const source = pricesMap.get(card.id);
    const current =
      typeof card.average_price === "number" ? card.average_price : undefined;
    const price = source ? priceToPublish(source, current) : null;

    if (price !== null) {
      card.average_price = price;
      updated++;
    } else if (card.average_price === undefined) {
      // Only set 0 for cards that never had a price
      card.average_price = 0;
    }
  }

  writeFileSync(filePath, JSON.stringify(cards) + "\n", "utf-8");

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

  // Format files with prettier
  const filePaths = PRICED_SERIES.map((s) => join(DATA_DIR, s, "cards.json"));
  execFileSync("npx", ["prettier", "--write", ...filePaths], {
    stdio: "inherit",
  });

  process.exit(0);
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});

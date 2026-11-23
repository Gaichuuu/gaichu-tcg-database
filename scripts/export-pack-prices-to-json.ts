import admin from "firebase-admin";
import { execFileSync } from "child_process";
import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { initFirebase } from "./lib/firebaseAdmin";
import {
  priceToPublish,
  type SourcePrice,
} from "../gaichu-api/src/services/gridPriceRule.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DATA_DIR = join(__dirname, "../data");
const SETS_PATH = join(DATA_DIR, "sets.json");

interface RawSet {
  id: string;
  pack_art?: unknown;
  pack_average_price?: number;
  [key: string]: unknown;
}

interface PackPrice {
  set_id: string;
  prices: { average_price: number | null; sample_size?: number | null };
}

async function loadPackPrices(
  db: admin.firestore.Firestore,
): Promise<Map<string, SourcePrice>> {
  console.log("Loading pack prices from Firestore...");
  const pricesMap = new Map<string, SourcePrice>();
  const snapshot = await db
    .collection("pack_prices")
    .select("set_id", "prices.average_price", "prices.sample_size")
    .get();
  for (const doc of snapshot.docs) {
    const data = doc.data() as PackPrice;
    const avg = data.prices?.average_price;
    if (avg !== null && avg !== undefined && avg > 0) {
      pricesMap.set(data.set_id, {
        average: avg,
        sampleSize: data.prices?.sample_size,
      });
    }
  }
  console.log(`Loaded ${pricesMap.size} packs with price data`);
  return pricesMap;
}

async function main() {
  console.log("=== Export Pack Prices to JSON ===\n");
  const db = initFirebase();
  const pricesMap = await loadPackPrices(db);

  const sets = JSON.parse(readFileSync(SETS_PATH, "utf-8")) as RawSet[];

  let updated = 0;
  let packCount = 0;
  for (const set of sets) {
    if (!set.pack_art) continue; // only sets with a pack
    packCount++;
    const source = pricesMap.get(set.id);
    const price = source
      ? priceToPublish(source, set.pack_average_price)
      : null;
    if (price !== null) {
      set.pack_average_price = price;
      updated++;
    } else if (set.pack_average_price === undefined) {
      set.pack_average_price = 0;
    }
  }

  writeFileSync(SETS_PATH, JSON.stringify(sets) + "\n", "utf-8");
  console.log(`\nUpdated ${updated}/${packCount} packs with prices`);

  execFileSync("npx", ["prettier", "--write", SETS_PATH], { stdio: "inherit" });
  process.exit(0);
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});

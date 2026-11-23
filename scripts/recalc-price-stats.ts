import type { Firestore } from "firebase-admin/firestore";
import {
  calculatePriceStats,
  mergeSales,
} from "../gaichu-api/src/services/priceStats.js";
import type { EbaySale } from "../gaichu-api/src/types/price.js";
import { initFirebase } from "./lib/firebaseAdmin";

const DRY_RUN = process.argv.includes("--dry-run");

interface PriceDoc {
  card_name?: string;
  pack_name?: string;
  series_short_name?: string;
  all_sales?: EbaySale[];
  recent_sales?: EbaySale[];
  prices?: { average_price: number | null; response_url?: string };
}

async function recalcCollection(
  db: Firestore,
  collection: "card_prices" | "pack_prices",
): Promise<[number, number]> {
  const snapshot = await db.collection(collection).get();

  let changed = 0;
  for (const doc of snapshot.docs) {
    const data = doc.data() as PriceDoc;
    const storedSales = data.all_sales ?? data.recent_sales ?? [];

    const mergedSales = mergeSales(storedSales, []);
    const prices = calculatePriceStats(mergedSales);
    if (data.prices?.response_url) {
      prices.response_url = data.prices.response_url;
    }

    const oldAvg = data.prices?.average_price ?? null;
    const salesDropped = storedSales.length - mergedSales.length;
    if (prices.average_price === oldAvg && salesDropped === 0) {
      continue;
    }

    changed++;
    const kept = new Set(mergedSales);
    const dropped = storedSales.filter((s) => !kept.has(s));
    const name = data.card_name ?? data.pack_name ?? doc.id;
    console.log(
      `${data.series_short_name}/${name}: $${oldAvg} -> $${prices.average_price} ` +
        `(sales ${storedSales.length} -> ${mergedSales.length})`,
    );
    for (const s of dropped) {
      console.log(`    dropped: $${s.sale_price} ${s.date_sold} "${s.title}"`);
    }

    if (!DRY_RUN) {
      await doc.ref.update({
        all_sales: mergedSales,
        recent_sales: mergedSales.slice(0, 10),
        prices,
        updated_at: new Date().toISOString(),
      });
    }
  }
  return [changed, snapshot.size];
}

async function main() {
  console.log(`=== Recalculate price stats ${DRY_RUN ? "(dry run)" : ""}===`);

  const db = initFirebase();
  for (const collection of ["card_prices", "pack_prices"] as const) {
    console.log(`\n== ${collection}`);
    const [changed, total] = await recalcCollection(db, collection);
    console.log(
      `${changed}/${total} documents ${DRY_RUN ? "would change" : "updated"}`,
    );
  }
  process.exit(0);
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});

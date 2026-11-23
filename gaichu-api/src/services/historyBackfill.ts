import type { EbayPriceData, EbaySale } from "../types/index.js";
import { calculatePriceStats, mergeSales } from "./priceStats.js";

/** Snapshots run Mondays at 9 AM UTC; backfilled weeks use the same instant. */
const SNAPSHOT_HOUR_UTC = 9;

/** Every snapshot instant (Monday 09:00 UTC) */
export function snapshotInstants(from: Date, to: Date): Date[] {
  const start = new Date(
    Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), from.getUTCDate()),
  );
  const daysSinceMonday = (start.getUTCDay() + 6) % 7;
  start.setUTCDate(start.getUTCDate() - daysSinceMonday);
  start.setUTCHours(SNAPSHOT_HOUR_UTC);

  const out: Date[] = [];
  for (const d = start; d.getTime() <= to.getTime(); ) {
    out.push(new Date(d));
    d.setUTCDate(d.getUTCDate() + 7);
  }
  return out;
}

export function statsAsOf(sales: EbaySale[], asOf: Date): EbayPriceData {
  const known = sales.filter((s) => Date.parse(s.date_sold) <= asOf.getTime());
  return calculatePriceStats(mergeSales([], known, asOf));
}

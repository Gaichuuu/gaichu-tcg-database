import admin from "firebase-admin";
import { existsSync, readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

import {
  fetchEbayPrice,
  fetchEbayPackPrice,
  buildCardPriceDocument,
  buildPackPriceDocument,
  type SoldFetchResult,
} from "../gaichu-api/src/services/ebayPriceService.js";
import {
  calculatePriceStats,
  mergeSales,
} from "../gaichu-api/src/services/priceStats.js";
import {
  snapshotInstants,
  statsAsOf,
} from "../gaichu-api/src/services/historyBackfill.js";
import {
  getIsoWeekKey,
  isoWeekMonday,
} from "../gaichu-api/src/utils/isoWeek.js";
import {
  loadAllCards,
  loadSets,
} from "../gaichu-api/src/services/dataLoader.js";
import type { EbaySale } from "../gaichu-api/src/types/price.js";
import { initFirebase } from "./lib/firebaseAdmin";
import { PRICED_SERIES } from "../gaichu-api/src/config/pricedSeries.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const arg = (name: string) =>
  process.argv.find((a) => a.startsWith(`--${name}=`))?.split("=")[1];
const DRY_RUN = process.argv.includes("--dry-run");
const FROM = new Date(`${arg("from") ?? "2026-07-06"}T00:00:00Z`);
const ONLY = arg("only");
const LIMIT = arg("limit") ? Number(arg("limit")) : Infinity;
const MAX_PAGES = arg("max-pages") ? Number(arg("max-pages")) : 10;
const WINDOW_DAYS = 90;
const DELAY_MS = 300;

interface StoredPriceDoc {
  series_short_name: string;
  all_sales?: EbaySale[];
  recent_sales?: EbaySale[];
  prices?: { response_url?: string };
}

interface Kind {
  label: "cards" | "packs";
  priceCollection: string;
  historyCollection: string;
  idField: "card_id" | "set_id";
  items: () => Array<{ id: string; name: string; series: string }>;
  requireStored: boolean;
  newDoc: (id: string, result: SoldFetchResult) => object;
  fetch: (
    id: string,
    key: string,
    dateFrom: string,
  ) => Promise<SoldFetchResult>;
}

function depthSummary(sales: EbaySale[]): string {
  if (sales.length === 0) return "no sales in range";
  const months = new Map<string, number>();
  let oldest = sales[0].date_sold;
  for (const s of sales) {
    if (Date.parse(s.date_sold) < Date.parse(oldest)) oldest = s.date_sold;
    const month = new Date(s.date_sold).toISOString().slice(0, 7);
    months.set(month, (months.get(month) ?? 0) + 1);
  }
  const perMonth = [...months.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([m, n]) => `${m}:${n}`)
    .join(" ");
  return `oldest ${new Date(oldest).toISOString().slice(0, 10)} · ${perMonth}`;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const ymd = (d: Date) => d.toISOString().slice(0, 10);

async function backfillKind(
  db: admin.firestore.Firestore,
  kind: Kind,
  apiKey: string,
): Promise<{
  items: number;
  withSales: number;
  weeks: number;
  errors: number;
}> {
  const priced = await db.collection(kind.priceCollection).get();
  const stored = new Map(
    priced.docs.map((d) => [d.id, d.data() as StoredPriceDoc]),
  );
  const items = kind
    .items()
    .filter((i) => !kind.requireStored || stored.has(i.id))
    .slice(0, LIMIT);

  const now = new Date();
  const weeks = snapshotInstants(FROM, now);
  const fetchFrom = new Date(FROM);
  fetchFrom.setUTCDate(fetchFrom.getUTCDate() - WINDOW_DAYS);

  console.log(
    `\n== ${kind.label}: ${items.length} items, ${weeks.length} weeks ` +
      `(${ymd(weeks[0])} → ${ymd(weeks[weeks.length - 1])}), sales from ${ymd(fetchFrom)}`,
  );

  const totals = { items: items.length, withSales: 0, weeks: 0, errors: 0 };

  for (const [index, item] of items.entries()) {
    const existing: StoredPriceDoc | undefined = stored.get(item.id);
    const result = await kind.fetch(item.id, apiKey, ymd(fetchFrom));
    const prefix = `[${index + 1}/${items.length}] ${item.name}`;

    if (result.status === "error") {
      totals.errors++;
      console.error(`${prefix}: ✗ ${result.errorMessage}`);
      await sleep(DELAY_MS);
      continue;
    }
    if (result.recentSales.length > 0) totals.withSales++;

    const allSales = [
      ...(existing?.all_sales ?? existing?.recent_sales ?? []),
      ...result.recentSales,
    ];
    const createdAt = now.toISOString();
    const historyRef = db
      .collection(kind.historyCollection)
      .doc(item.id)
      .collection("snapshots");
    const existingWeeks = new Set(
      (await historyRef.select().get()).docs.map((d) => d.id),
    );

    const batch = db.batch();
    let last = "";
    let kept = 0;
    for (const instant of weeks) {
      const stats = statsAsOf(allSales, instant);
      const week = getIsoWeekKey(instant);
      if (stats.sample_size === 0 && existingWeeks.has(week)) {
        kept++;
        continue;
      }
      batch.set(
        db
          .collection(kind.historyCollection)
          .doc(item.id)
          .collection("snapshots")
          .doc(week),
        {
          [kind.idField]: item.id,
          series_short_name: item.series,
          week,
          snapshot_date: isoWeekMonday(instant),
          average_price: stats.average_price,
          median_price: stats.median_price,
          min_price: stats.min_price,
          max_price: stats.max_price,
          sample_size: stats.sample_size,
          source: "trawl-backfill",
          created_at: createdAt,
        },
      );
      last =
        stats.average_price != null
          ? `$${stats.average_price.toFixed(2)} (${stats.sample_size})`
          : "no sales";
    }

    const mergedSales = mergeSales(
      existing?.all_sales ?? existing?.recent_sales ?? [],
      result.recentSales,
      now,
    );
    const prices = calculatePriceStats(mergedSales);
    const fresh = kind.newDoc(item.id, result) as {
      prices: { response_url?: string };
    };
    const responseUrl =
      existing?.prices?.response_url ?? fresh.prices.response_url;
    if (responseUrl) prices.response_url = responseUrl;
    batch.set(
      db.collection(kind.priceCollection).doc(item.id),
      {
        ...(existing ? {} : fresh),
        all_sales: mergedSales,
        recent_sales: mergedSales.slice(0, 10),
        prices,
        status: result.status,
        fetched_at: createdAt,
        updated_at: createdAt,
      },
      { merge: true },
    );

    console.log(
      `${prefix}: ${result.recentSales.length} fetched, ${depthSummary(result.recentSales)}` +
        ` → latest week ${last}` +
        (kept > 0 ? `, kept ${kept} existing week(s) with no new sales` : ""),
    );
    if (!DRY_RUN) {
      await batch.commit();
      totals.weeks += weeks.length - kept;
    }
    await sleep(DELAY_MS);
  }
  return totals;
}

function readApiKey(): string | undefined {
  if (process.env.RAPIDAPI_KEY) return process.env.RAPIDAPI_KEY.trim();
  for (const rel of ["../.deploy.env", "../gaichu-api/.secret.local"]) {
    const file = join(__dirname, rel);
    if (!existsSync(file)) continue;
    const line = readFileSync(file, "utf8")
      .split(/\r?\n/)
      .find((l) => l.startsWith("RAPIDAPI_KEY="));
    if (line) {
      return line
        .slice("RAPIDAPI_KEY=".length)
        .trim()
        .replace(/^["']|["']$/g, "");
    }
  }
  return undefined;
}

async function main() {
  const apiKey = readApiKey();
  if (!apiKey) {
    console.error(
      "RAPIDAPI_KEY is not set: export it, or add a RAPIDAPI_KEY=... line to .deploy.env.",
    );
    process.exit(1);
  }
  if (!/^[\x21-\x7e]+$/.test(apiKey) || apiKey.length < 20) {
    console.error(
      "RAPIDAPI_KEY doesn't look like a RapidAPI key (expected a long ASCII " +
        "string, e.g. from RapidAPI → Apps → your app → Authorization).",
    );
    process.exit(1);
  }
  if (Number.isNaN(FROM.getTime())) {
    console.error("--from must be YYYY-MM-DD");
    process.exit(1);
  }

  const db = initFirebase();
  console.log(DRY_RUN ? "DRY RUN: nothing will be written." : "Writing.");

  const cards = loadAllCards();
  const cardsById = new Map(cards.map((c) => [c.id, c]));
  const sets = loadSets();
  const setsById = new Map(sets.map((s) => [s.id, s]));

  const kinds: Kind[] = [
    {
      label: "cards",
      priceCollection: "card_prices",
      historyCollection: "card_price_history",
      idField: "card_id",
      requireStored: true,
      newDoc: (id, result) =>
        buildCardPriceDocument(cardsById.get(id)!, result),
      items: () =>
        cards.map((c) => ({
          id: c.id,
          series: c.series_short_name,
          name:
            typeof c.name === "string"
              ? c.name
              : (c.name.en ?? c.name.ja ?? c.id),
        })),
      fetch: (id, key, dateFrom) =>
        fetchEbayPrice(cardsById.get(id)!, key, {
          dateFrom,
          maxPages: MAX_PAGES,
        }),
    },
    {
      label: "packs",
      priceCollection: "pack_prices",
      historyCollection: "pack_price_history",
      idField: "set_id",
      requireStored: false,
      newDoc: (id, result) => buildPackPriceDocument(setsById.get(id)!, result),
      items: () =>
        sets
          .filter(
            (s) => PRICED_SERIES.includes(s.series_short_name) && !!s.pack_art,
          )
          .map((s) => ({
            id: s.id,
            series: s.series_short_name,
            name: `${s.name} pack`,
          })),
      fetch: (id, key, dateFrom) =>
        fetchEbayPackPrice(setsById.get(id)!, key, {
          dateFrom,
          maxPages: MAX_PAGES,
        }),
    },
  ];

  let errors = 0;
  for (const kind of kinds) {
    if (ONLY && ONLY !== kind.label) continue;
    const t = await backfillKind(db, kind, apiKey);
    errors += t.errors;
    console.log(
      `== ${kind.label} done: ${t.withSales}/${t.items} found sales, ` +
        `${t.weeks} snapshots written, ${t.errors} errors`,
    );
  }
  if (errors > 0) process.exitCode = 1;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

import type { EbayPriceData, EbaySale } from "../types/index.js";

/** Rolling window for sales data (in days) */
export const ROLLING_WINDOW_DAYS = 90;

export const MIN_SALES_TO_RETAIN = 5;

const MULTI_ITEM_TITLE_PATTERN = new RegExp(
  `\\b(${[
    "lot",
    "lots",
    "bundle",
    "collection",
    "complete",
    "repack",
    "choose",
    "pick",
    "picks",
    "ecto",
    "packs",
  ].join("|")})\\b`,
  "i",
);

export function isLikelyMultiItemListing(title: string): boolean {
  return MULTI_ITEM_TITLE_PATTERN.test(title);
}

function medianOfSorted(sorted: number[]): number {
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function removeOutliers(sorted: number[]): number[] {
  if (sorted.length < 3) return sorted;

  if (sorted.length < 4) {
    const med = medianOfSorted(sorted);
    if (med <= 0) return sorted;
    const kept = sorted.filter((p) => p <= med * 4 && p >= med / 4);
    return kept.length ? kept : sorted;
  }

  const quantile = (q: number): number => {
    const pos = (sorted.length - 1) * q;
    const base = Math.floor(pos);
    const rest = pos - base;
    return sorted[base + 1] !== undefined
      ? sorted[base] + rest * (sorted[base + 1] - sorted[base])
      : sorted[base];
  };

  const q1 = quantile(0.25);
  const q3 = quantile(0.75);
  const iqr = q3 - q1;
  const lo = q1 - 1.5 * iqr;
  const hi = q3 + 1.5 * iqr;
  const kept = sorted.filter((p) => p >= lo && p <= hi);
  return kept.length ? kept : sorted;
}

export function calculatePriceStats(sales: EbaySale[]): EbayPriceData {
  if (sales.length === 0) {
    return {
      average_price: null,
      median_price: null,
      min_price: null,
      max_price: null,
      sample_size: 0,
    };
  }

  const allPrices = sales.map((s) => s.sale_price).sort((a, b) => a - b);
  const prices = removeOutliers(allPrices);
  const sum = prices.reduce((a, b) => a + b, 0);

  return {
    average_price: Math.round((sum / prices.length) * 100) / 100,
    median_price: medianOfSorted(prices),
    min_price: prices[0],
    max_price: prices[prices.length - 1],
    sample_size: prices.length,
  };
}

function extractEbayItemId(link: string): string {
  const match = link.match(/\/itm\/(\d+)/);
  return match ? match[1] : link; // Fall back to full link if no match
}

function saleDay(dateSold: string): string {
  if (/^\d{4}-\d{2}-\d{2}/.test(dateSold)) return dateSold.slice(0, 10);
  const d = new Date(dateSold);
  if (Number.isNaN(d.getTime())) return dateSold;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function saleKey(sale: EbaySale): string {
  return `${extractEbayItemId(sale.link)}|${saleDay(sale.date_sold)}`;
}

const isIsoDate = (d: string) => /^\d{4}-\d{2}-\d{2}T/.test(d);
const DAY_MS = 86_400_000;

function dropLegacyTwins(sales: EbaySale[]): EbaySale[] {
  const preciseByItem = new Map<string, number[]>();
  for (const s of sales) {
    if (!isIsoDate(s.date_sold)) continue;
    const id = extractEbayItemId(s.link);
    const times = preciseByItem.get(id) ?? [];
    times.push(Date.parse(s.date_sold));
    preciseByItem.set(id, times);
  }
  return sales.filter((s) => {
    if (isIsoDate(s.date_sold)) return true;
    const times = preciseByItem.get(extractEbayItemId(s.link));
    if (!times) return true;
    const t = Date.parse(s.date_sold);
    if (Number.isNaN(t)) return true;
    return !times.some((p) => Math.abs(p - t) <= DAY_MS * 1.5);
  });
}

export function mergeSales(
  existingSales: EbaySale[],
  newSales: EbaySale[],
  now: Date = new Date(),
): EbaySale[] {
  const salesByItemId = new Map<string, EbaySale>();
  for (const sale of existingSales) {
    salesByItemId.set(saleKey(sale), sale);
  }
  for (const sale of newSales) {
    salesByItemId.set(saleKey(sale), sale);
  }

  const cutoffDate = new Date(now);
  cutoffDate.setDate(cutoffDate.getDate() - ROLLING_WINDOW_DAYS);

  return dropLegacyTwins(Array.from(salesByItemId.values()))
    .filter((sale) => !isLikelyMultiItemListing(sale.title))
    .sort(
      (a, b) =>
        new Date(b.date_sold).getTime() - new Date(a.date_sold).getTime(),
    )
    .filter(
      (sale, index) =>
        index < MIN_SALES_TO_RETAIN || new Date(sale.date_sold) >= cutoffDate,
    );
}

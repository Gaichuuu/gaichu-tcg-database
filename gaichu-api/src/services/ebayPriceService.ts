import type {
  Card,
  Set,
  EbayPriceData,
  EbaySale,
  CardPrice,
  PackPrice,
} from "../types/index.js";
import { calculatePriceStats, saleKey } from "./priceStats.js";
import { expandQuery, excludeFor } from "./soldQuery.js";
import { searchSold } from "./trawlClient.js";

const SYNC_WINDOW_DAYS = 90;

/** Map series short names to searchable names on eBay
 * Uses eBay OR syntax: (term1,term2)
 */
const SERIES_NAME_MAP: Record<string, string> = {
  wm: '"wrenny moo"',
  ash: '"after skool hobby"',
  oz: "openzoo",
  mz: "metazoo",
  disgruntled: '("disgruntled games",disgruntledgames)',
  tygadu: "tygadu",
};

/** Map set short names to eBay-friendly search terms
 * Uses eBay OR syntax: (term1,term2)
 */
const SET_NAME_MAP: Record<string, Record<string, string>> = {
  wm: {
    set1: '("set 1","series 1")',
  },
};

/** Default keywords to exclude from searches. */
const DEFAULT_EXCLUDED_KEYWORDS = [
  "lot",
  "bundle",
  "complete",
  "ecto",
  "repack",
  "collection",
  "choose",
  "pick",
];

/** Set-specific excluded keywords */
const SET_EXCLUDED_KEYWORDS: Record<string, string[]> = {
  "wm-set1": ["first"],
  "ash-series1": ["ditto", "genetic"],
};

/** Series that rely on card name/number alone */
const SERIES_WITHOUT_SET_IDENTIFIER = new Set(["ash", "tygadu"]);

/** Card-specific search name overrides */
const CARD_NAME_OVERRIDES: Record<string, string> = {
  "ash-series1-0": "charizard Nagaba",
  "ash-series1-1": '("umbreon","moonbreon")',
  "ash-series1-2": "charizard #2",
  "ash-series1-3": "birthday pikachu",
  "ash-series1-7": "mew #7",
  "ash-series1-8": "Latias & Latios",
  "ash-series1-9": "Solgaleo & Lunala",
  "ash-series1-10": "scream pikachu",
  "ash-series1-18": "bubble mew",
  "ash-series1-21": "pikachu #21",
  "ash-series1-22": '("bubble mewtwo","mewtwo ex")',
  "ash-series1-29": "eeveelutions",
  "ash-series1-30": "Moltres & Zapdos & Articuno",
  "ash-series1-31": '("crystal charizard","charizard #31")',
  "ash-series1-35": '("psyduck","scream psyduck")',
  "ash-series1-40": "poncho charizard",
  "ash-series1-41": "poncho mega charizard",
  "ash-series1-42": "poncho gyarados",
  "ash-series1-43": "poncho lucario",
};

/** Card-specific search name overrides by card ID */
const CARD_ID_OVERRIDES: Record<string, string> = {
  "7f9beef6-8d2d-4e40-b585-b50d314c6001": "ditto #44",
  "e5cb691d-7845-4f19-8f38-60abe476924d": "pikachu ditto",
  "5f4c8b63-05e2-42a0-9179-60edcdbd76fb": "bulbasaur ditto",
  "e7502969-7dc4-4222-a6d3-a8ac26d0c6b3": "charizard ditto",
  "09a2848d-06f7-46cb-9e14-490b8e04e172": "gengar ditto",
  "78a02344-0c51-48ef-b22c-d5892e98ce3e": "ditto secret",
};

/** Card-specific excluded keywords */
const CARD_EXCLUDED_KEYWORDS: Record<string, string[]> = {
  "wm-set1-7": ["Alolan"],
  "wm-set1-38": ["signed"],
  "ash-series1-40": ["mega"],
};

function resolveCardName(card: Card): string {
  return typeof card.name === "string"
    ? card.name
    : card.name.en || card.name.ja || "";
}

function getCardKey(card: Card): string {
  return `${card.series_short_name}-${card.set_short_name}-${card.number}`;
}

function getSetKey(card: Card): string {
  return `${card.series_short_name}-${card.set_short_name}`;
}

function getSearchCardName(card: Card): string {
  if (CARD_ID_OVERRIDES[card.id]) {
    return CARD_ID_OVERRIDES[card.id];
  }

  const cardKey = getCardKey(card);
  if (CARD_NAME_OVERRIDES[cardKey]) {
    return CARD_NAME_OVERRIDES[cardKey];
  }

  if (card.parody && card.series_short_name !== "ash") {
    return card.parody;
  }

  return resolveCardName(card);
}

export function buildSearchQuery(card: Card): string {
  const parts: string[] = [];

  // 1. Series name (e.g., "wrenny moo")
  const seriesName =
    SERIES_NAME_MAP[card.series_short_name] || card.series_short_name;
  parts.push(seriesName);

  // 2. Card name (with series-specific formatting)
  const cardName = getSearchCardName(card);
  if (cardName) {
    parts.push(cardName);
  }

  // 3. Set identifier for specificity
  if (
    card.set_short_name &&
    !SERIES_WITHOUT_SET_IDENTIFIER.has(card.series_short_name)
  ) {
    const seriesSetMap = SET_NAME_MAP[card.series_short_name];
    const setName =
      seriesSetMap?.[card.set_short_name] ||
      card.set_short_name.replace(/^set(\d+)$/i, "set $1");
    parts.push(setName);
  }

  return parts.join(" ");
}

export function getExcludedKeywords(card?: Card): string {
  const keywords = [...DEFAULT_EXCLUDED_KEYWORDS];

  if (!card) return keywords.join(" ");

  const setExclusions = SET_EXCLUDED_KEYWORDS[getSetKey(card)];
  if (setExclusions) {
    const isDittoCard = card.series_short_name === "ash" && card.number === 44;
    const filteredExclusions = isDittoCard
      ? setExclusions.filter((kw) => kw !== "ditto")
      : setExclusions;
    keywords.push(...filteredExclusions);
  }

  const cardExclusions = CARD_EXCLUDED_KEYWORDS[getCardKey(card)];
  if (cardExclusions) {
    keywords.push(...cardExclusions);
  }

  return keywords.join(" ");
}

/**
 * Build an eBay search URL for completed listings
 * This links users directly to eBay's sold items search
 */
export function buildEbaySearchUrl(searchQuery: string): string {
  const params = new URLSearchParams({
    _nkw: searchQuery,
    LH_Complete: "1", // Completed listings
    LH_Sold: "1", // Sold items only
  });
  return `https://www.ebay.com/sch/i.html?${params.toString()}`;
}

const EMPTY_PRICE_DATA: EbayPriceData = {
  average_price: null,
  median_price: null,
  min_price: null,
  max_price: null,
  sample_size: 0,
};

export interface SoldFetchOptions {
  /** Earliest sale date (YYYY-MM-DD) */
  dateFrom?: string;
  maxPages?: number;
}

export interface SoldFetchResult {
  priceData: EbayPriceData;
  recentSales: EbaySale[];
  searchQuery: string;
  excludedKeywords: string;
  status: "success" | "no_results" | "error";
  errorMessage?: string;
}

function windowStart(days: number, now: Date = new Date()): string {
  const d = new Date(now);
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString().slice(0, 10);
}

export async function fetchSoldSales(
  searchQuery: string,
  excludedKeywords: string,
  category: string | undefined,
  apiKey: string,
  options: SoldFetchOptions = {},
): Promise<SoldFetchResult> {
  const base = { searchQuery, excludedKeywords };
  const bySale = new Map<string, EbaySale>();

  try {
    for (const query of expandQuery(searchQuery)) {
      const exclude = excludeFor(query, excludedKeywords);
      console.log(
        "sold /search:",
        JSON.stringify({ query, exclude, category: category ?? null }),
      );
      const results = await searchSold(
        {
          query,
          exclude: exclude || undefined,
          category,
          dateFrom: options.dateFrom ?? windowStart(SYNC_WINDOW_DAYS),
          maxPages: options.maxPages ?? 1,
        },
        apiKey,
      );
      console.log(`  ${results.length} sales`);
      for (const r of results) {
        const sale: EbaySale = {
          title: r.title,
          sale_price: r.sale_price,
          date_sold: r.date_sold,
          link: r.item_link,
        };
        bySale.set(saleKey(sale), sale);
      }
    }
  } catch (error) {
    return {
      ...base,
      priceData: { ...EMPTY_PRICE_DATA },
      recentSales: [],
      status: "error",
      errorMessage: error instanceof Error ? error.message : "Unknown error",
    };
  }

  const recentSales = [...bySale.values()].sort(
    (a, b) => Date.parse(b.date_sold) - Date.parse(a.date_sold),
  );
  if (recentSales.length === 0) {
    return {
      ...base,
      priceData: { ...EMPTY_PRICE_DATA },
      recentSales,
      status: "no_results",
    };
  }
  return {
    ...base,
    priceData: calculatePriceStats(recentSales),
    recentSales,
    status: "success",
  };
}

export function fetchEbayPrice(
  card: Card,
  apiKey: string,
  options?: SoldFetchOptions,
): Promise<SoldFetchResult> {
  return fetchSoldSales(
    buildSearchQuery(card),
    getExcludedKeywords(card),
    undefined,
    apiKey,
    options,
  );
}

/**
 * Build a CardPrice document from API response
 */
export function buildCardPriceDocument(
  card: Card,
  fetchResult: SoldFetchResult,
): CardPrice {
  const now = new Date().toISOString();
  const cardName = resolveCardName(card);

  const ebaySearchUrl = buildEbaySearchUrl(fetchResult.searchQuery);

  const doc: CardPrice = {
    card_id: card.id,
    series_short_name: card.series_short_name,
    set_short_name: card.set_short_name,
    card_name: cardName,
    prices: {
      ...fetchResult.priceData,
      response_url: fetchResult.priceData.response_url ?? ebaySearchUrl,
    },
    all_sales: fetchResult.recentSales,
    recent_sales: fetchResult.recentSales.slice(0, 10),
    search_query_used: fetchResult.searchQuery,
    excluded_keywords_used: fetchResult.excludedKeywords,
    fetched_at: now,
    created_at: now,
    updated_at: now,
    status: fetchResult.status,
  };

  if (fetchResult.errorMessage) {
    doc.error_message = fetchResult.errorMessage;
  }

  return doc;
}

/** Sealed-pack pricing */
const PACK_SEARCH_OVERRIDES: Record<string, string> = {
  "wm-set2": '"wrenny moo" ("set 2","series 2","2nd series") pack',
  "ash-series1": '"after skool hobby" "generation one" pack',
  "ash-series2": '"after skool hobby" "genetic mystery" pack',
  "tygadu-set1": 'tygadu ("booster pack","sealed booster pack","sealed pack")',
};

/** Keywords to exclude for sealed single-pack searches */
const PACK_EXCLUDED_KEYWORDS = [
  ...DEFAULT_EXCLUDED_KEYWORDS,
  "box",
  "case",
  "display",
  "packs",
];

/** Per-set extra excluded keywords */
const PACK_EXCLUDED_OVERRIDES: Record<string, string[]> = {
  "tygadu-set1": ["holo"],
};

function getPackKey(set: Set): string {
  return `${set.series_short_name}-${set.short_name}`;
}

export function buildPackSearchQuery(set: Set): string {
  const override = PACK_SEARCH_OVERRIDES[getPackKey(set)];
  if (override) return override;

  const parts: string[] = [];

  parts.push(SERIES_NAME_MAP[set.series_short_name] || set.series_short_name);

  const seriesSetMap = SET_NAME_MAP[set.series_short_name];
  const setName =
    seriesSetMap?.[set.short_name] ||
    set.short_name.replace(/^set(\d+)$/i, "set $1");
  parts.push(setName);

  parts.push("pack");

  return parts.join(" ");
}

export function getPackExcludedKeywords(set?: Set): string {
  const keywords = [...PACK_EXCLUDED_KEYWORDS];
  if (set) {
    const extra = PACK_EXCLUDED_OVERRIDES[getPackKey(set)];
    if (extra) keywords.push(...extra);
  }
  return keywords.join(" ");
}

/** Build an eBay sold-listings URL for a pack search */
export function buildPackEbaySearchUrl(searchQuery: string): string {
  const params = new URLSearchParams({
    _nkw: searchQuery,
    LH_Complete: "1",
    LH_Sold: "1",
  });
  return `https://www.ebay.com/sch/i.html?${params.toString()}`;
}

/** Fetch sold-price data for a sealed pack */
export function fetchEbayPackPrice(
  set: Set,
  apiKey: string,
  options?: SoldFetchOptions,
): Promise<SoldFetchResult> {
  return fetchSoldSales(
    buildPackSearchQuery(set),
    getPackExcludedKeywords(set),
    undefined,
    apiKey,
    options,
  );
}

/** Build a PackPrice document from a fetch result */
export function buildPackPriceDocument(
  set: Set,
  fetchResult: SoldFetchResult,
): PackPrice {
  const now = new Date().toISOString();
  const ebaySearchUrl = buildPackEbaySearchUrl(fetchResult.searchQuery);

  const doc: PackPrice = {
    set_id: set.id,
    series_short_name: set.series_short_name,
    set_short_name: set.short_name,
    pack_name: `${set.name} pack`,
    prices: {
      ...fetchResult.priceData,
      response_url: fetchResult.priceData.response_url ?? ebaySearchUrl,
    },
    all_sales: fetchResult.recentSales,
    recent_sales: fetchResult.recentSales.slice(0, 10),
    search_query_used: fetchResult.searchQuery,
    excluded_keywords_used: fetchResult.excludedKeywords,
    fetched_at: now,
    created_at: now,
    updated_at: now,
    status: fetchResult.status,
  };

  if (fetchResult.errorMessage) {
    doc.error_message = fetchResult.errorMessage;
  }

  return doc;
}

/**
 * Delay helper for rate limiting
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

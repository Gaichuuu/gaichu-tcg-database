/**
 * Price data types for eBay price integration
 */

/** Price data returned from eBay API */
export interface EbayPriceData {
  average_price: number | null;
  median_price: number | null;
  min_price: number | null;
  max_price: number | null;
  sample_size: number;
  response_url?: string;
}

/** Individual sale record from eBay */
export interface EbaySale {
  title: string;
  sale_price: number;
  date_sold: string;
  link: string;
}

/** Full price document stored in Firestore */
export interface CardPrice {
  card_id: string;
  series_short_name: string;
  set_short_name: string;
  card_name: string;

  prices: EbayPriceData;

  /** Rolling 90-day window of all sales (deduplicated by link) */
  all_sales: EbaySale[];

  /** Top 10 most recent sales (for quick display) */
  recent_sales: EbaySale[];

  search_query_used: string;
  excluded_keywords_used: string;

  fetched_at: string;
  created_at: string;
  updated_at: string;

  status: "success" | "no_results" | "error";
  error_message?: string;
}

/** Frontend-friendly price summary */
export interface CardPriceSummary {
  average_price: number | null;
  median_price: number | null;
  min_price: number | null;
  max_price: number | null;
  sample_size: number;
  last_updated: string;
  /** ISO date of the newest recorded sale, or null when none. */
  last_sale_date: string | null;
  ebay_search_url?: string;
}

/** One weekly price snapshot (a doc in card_price_history/{cardId}/snapshots). */
export interface WeeklyPriceSnapshot {
  card_id: string;
  series_short_name: string;
  week: string; // "2026-W22"
  snapshot_date: string; // ISO date (YYYY-MM-DD) of that week's Monday
  average_price: number | null;
  median_price: number | null;
  min_price: number | null;
  max_price: number | null;
  sample_size: number;
  source: "sync" | "git-backfill" | "trawl-backfill";
  created_at: string;
}

/** API response for a card's price history. */
export interface PriceHistoryResponse {
  card_id: string;
  range: string;
  snapshots: WeeklyPriceSnapshot[];
}

/** Sealed-pack price document stored in Firestore */
export interface PackPrice {
  set_id: string;
  series_short_name: string;
  set_short_name: string;
  pack_name: string;

  prices: EbayPriceData;

  /** Rolling 90-day window of all sales (deduplicated by link) */
  all_sales: EbaySale[];

  /** Top 10 most recent sales (for quick display) */
  recent_sales: EbaySale[];

  search_query_used: string;
  excluded_keywords_used: string;

  fetched_at: string;
  created_at: string;
  updated_at: string;

  status: "success" | "no_results" | "error";
  error_message?: string;
}

/** Frontend price summary for a pack: the same shape as a card's. */
export type PackPriceSummary = CardPriceSummary;

/** One weekly pack price snapshot (pack_price_history/{setId}/snapshots). */
export interface WeeklyPackPriceSnapshot {
  set_id: string;
  series_short_name: string;
  week: string; // "2026-W22"
  snapshot_date: string; // ISO date (YYYY-MM-DD) of that week's Monday
  average_price: number | null;
  median_price: number | null;
  min_price: number | null;
  max_price: number | null;
  sample_size: number;
  source: "sync" | "git-backfill" | "trawl-backfill";
  created_at: string;
}

/** API response for a pack's price history. */
export interface PackPriceHistoryResponse {
  set_id: string;
  range: string;
  snapshots: WeeklyPackPriceSnapshot[];
}

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

/** Raw response from RapidAPI eBay Average Selling Price endpoint */
export interface EbayApiResponse {
  success: boolean;
  average_price?: number;
  median_price?: number;
  min_price?: number;
  max_price?: number;
  results?: number;
  response_url?: string;
  products?: Array<{
    title: string;
    sale_price: number;
    date_sold: string;
    link: string;
  }>;
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
  ebay_search_url?: string;
}

/** Request body for eBay API */
export interface EbaySearchRequest {
  keywords: string;
  max_search_results: string;
  category_id: string;
  remove_outliers: string;
  site_id: string;
  excluded_keywords?: string;
}

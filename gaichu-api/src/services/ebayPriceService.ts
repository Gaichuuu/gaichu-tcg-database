import type {
  Card,
  EbayApiResponse,
  EbayPriceData,
  EbaySale,
  EbaySearchRequest,
  CardPrice,
} from "../types/index.js";

const RAPIDAPI_HOST = "ebay-average-selling-price.p.rapidapi.com";
const CATEGORY_ID = "183454"; // CCG Individual Cards
const MAX_SEARCH_RESULTS = "60";

/** Map series short names to searchable names on eBay
 * Uses eBay OR syntax: (term1,term2) matches either variant
 * This catches listings using "wrenny moo" OR "wrennymoo", etc.
 */
const SERIES_NAME_MAP: Record<string, string> = {
  wm: '("wrenny moo",wrennymoo)',
  // ASH: Unlike Wrenny Moo, sellers consistently use "After Skool Hobby" with spaces.
  // The no-spaces variant "afterskoolhobby" returns unrelated generic Pokemon cards.
  ash: '"after skool hobby"',
  oz: "openzoo",
  mz: "metazoo",
  disgruntled: '("disgruntled games",disgruntledgames)',
};

/** Map set short names to eBay-friendly search terms
 * eBay sellers use product names like "Generation One" rather than internal names like "series1"
 */
const SET_NAME_MAP: Record<string, Record<string, string>> = {
  ash: {
    series1: '"generation one"',
    og: '"generation one"',
    series2: '"genetic mystery"',
    sticker: "sticker",
  },
};

/** Default keywords to exclude from searches */
// Keep exclusions minimal to avoid filtering out valid listings
// The API seems to do word-level matching, so "complete set" might also exclude "Set 1"
const DEFAULT_EXCLUDED_KEYWORDS = [
  "lot",
  "bundle",
  "complete",
  "ecto",
  "repack",
];

/** Series-specific excluded keywords */
const SERIES_EXCLUDED_KEYWORDS: Record<string, string[]> = {
  // "first" excludes first print/edition cards which are priced differently
  wm: ["first"],
};

/** Card-specific excluded keywords
 * Key format: "series-set-number" (e.g., "wm-set1-7")
 */
const CARD_EXCLUDED_KEYWORDS: Record<string, string[]> = {
  // WM Set 1 #7 (Raichu) - exclude "Alolan" to avoid Alolan Raichu listings
  "wm-set1-7": ["Alolan"],
};

/**
 * Get the card name to use in search query
 * Handles series-specific formatting
 */
function getSearchCardName(card: Card): string {
  let cardName: string;

  if (card.series_short_name === "ash") {
    // ASH: Always use the card name, not parody name
    // The "?" suffix (e.g., "Pikachu?") indicates a Ditto card and is the unique identifier
    // Multiple cards share the same parody (e.g., 6 different "Ditto" cards all numbered #44)
    cardName =
      typeof card.name === "string"
        ? card.name
        : card.name.en || card.name.ja || "";

    // Remove ? from card names for search (e.g., "Pikachu?" becomes "Pikachu")
    if (cardName.endsWith("?")) {
      cardName = cardName.slice(0, -1);
    }
  } else {
    // For other series, use parody name if available (what eBay sellers actually list)
    if (card.parody) {
      cardName = card.parody;
    } else {
      cardName =
        typeof card.name === "string"
          ? card.name
          : card.name.en || card.name.ja || "";
    }
  }

  return cardName;
}

/**
 * Get the card number identifier for the search query
 * Different series use different formats:
 * - WM: No card number (sellers don't consistently use it)
 * - ASH: "#44" format, or "Nagaba" for card 0
 */
function getCardNumberIdentifier(card: Card): string | null {
  if (!card.number && card.number !== 0) return null;

  if (card.series_short_name === "ash") {
    // ASH: Card 0 is the Nagaba promo (e.g., "Charizard 0/44")
    if (card.number === 0) {
      return "Nagaba";
    }
    // ASH: "#44" format for other cards
    return `#${card.number}`;
  }

  // WM and other series: no card number in search
  return null;
}

/**
 * Build a search query for a card
 *
 * For fan-made cards, eBay sellers typically list by the parody name (e.g., "Charizard")
 * rather than the custom card name (e.g., "Trumpety"). So we prioritize parody names.
 *
 * Series-specific formats:
 * - WM: 'wrennymoo Pidgey 16/50 set 1' (excludes "first" for reprint differentiation)
 * - ASH: 'after skool hobby Ditto #44 "generation one"' (card 0 uses "Nagaba" instead)
 */
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

  // 3. Card number identifier (series-specific format)
  const numberIdentifier = getCardNumberIdentifier(card);
  if (numberIdentifier) {
    parts.push(numberIdentifier);
  }

  // 4. Set identifier for specificity
  //    Use SET_NAME_MAP if available, otherwise convert "set1" to "set 1" format
  if (card.set_short_name) {
    const seriesSetMap = SET_NAME_MAP[card.series_short_name];
    const setName =
      seriesSetMap?.[card.set_short_name] ||
      card.set_short_name.replace(/^set(\d+)$/i, "set $1");
    parts.push(setName);
  }

  return parts.join(" ");
}

/**
 * Get excluded keywords for a card
 * Combines default, series-specific, and card-specific exclusions
 */
export function getExcludedKeywords(card?: Card): string {
  const keywords = [...DEFAULT_EXCLUDED_KEYWORDS];

  if (!card) return keywords.join(" ");

  // Add series-specific exclusions
  const seriesExclusions = SERIES_EXCLUDED_KEYWORDS[card.series_short_name];
  if (seriesExclusions) {
    keywords.push(...seriesExclusions);
  }

  // Add card-specific exclusions (key format: "series-set-number")
  const cardKey = `${card.series_short_name}-${card.set_short_name}-${card.number}`;
  const cardExclusions = CARD_EXCLUDED_KEYWORDS[cardKey];
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
    _sacat: CATEGORY_ID,
    LH_Complete: "1", // Completed listings
    LH_Sold: "1", // Sold items only
  });
  return `https://www.ebay.com/sch/i.html?${params.toString()}`;
}

/**
 * Fetch price data from eBay API for a single card
 */
export async function fetchEbayPrice(
  card: Card,
  apiKey: string,
): Promise<{
  priceData: EbayPriceData;
  recentSales: EbaySale[];
  searchQuery: string;
  excludedKeywords: string;
  status: "success" | "no_results" | "error";
  errorMessage?: string;
}> {
  const searchQuery = buildSearchQuery(card);
  const excludedKeywords = getExcludedKeywords(card);

  const requestBody: EbaySearchRequest = {
    keywords: searchQuery,
    max_search_results: MAX_SEARCH_RESULTS,
    category_id: CATEGORY_ID,
    remove_outliers: "true",
    site_id: "0", // US
    excluded_keywords: excludedKeywords,
  };

  console.log("eBay API Request:", JSON.stringify(requestBody));

  try {
    const response = await fetch(
      `https://${RAPIDAPI_HOST}/findCompletedItems`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-rapidapi-host": RAPIDAPI_HOST,
          "x-rapidapi-key": apiKey,
        },
        body: JSON.stringify(requestBody),
      },
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const data = (await response.json()) as EbayApiResponse;

    console.log(
      "eBay API Response:",
      JSON.stringify({
        success: data.success,
        results: data.results,
        average_price: data.average_price,
      }),
    );

    if (!data.success) {
      return {
        priceData: {
          average_price: null,
          median_price: null,
          min_price: null,
          max_price: null,
          sample_size: 0,
        },
        recentSales: [],
        searchQuery,
        excludedKeywords,
        status: "error",
        errorMessage: "API returned success: false",
      };
    }

    const sampleSize = data.results ?? data.products?.length ?? 0;

    if (sampleSize === 0) {
      return {
        priceData: {
          average_price: null,
          median_price: null,
          min_price: null,
          max_price: null,
          sample_size: 0,
        },
        recentSales: [],
        searchQuery,
        excludedKeywords,
        status: "no_results",
      };
    }

    const priceData: EbayPriceData = {
      average_price: data.average_price ?? null,
      median_price: data.median_price ?? null,
      min_price: data.min_price ?? null,
      max_price: data.max_price ?? null,
      sample_size: sampleSize,
    };
    // Only include response_url if it exists (Firestore doesn't accept undefined)
    if (data.response_url) {
      priceData.response_url = data.response_url;
    }

    // Get all sales from API (for rolling window merge)
    const recentSales: EbaySale[] = (data.products ?? []).map((p) => ({
      title: p.title,
      sale_price: p.sale_price,
      date_sold: p.date_sold,
      link: p.link,
    }));

    return {
      priceData,
      recentSales,
      searchQuery,
      excludedKeywords,
      status: "success",
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return {
      priceData: {
        average_price: null,
        median_price: null,
        min_price: null,
        max_price: null,
        sample_size: 0,
      },
      recentSales: [],
      searchQuery,
      excludedKeywords,
      status: "error",
      errorMessage,
    };
  }
}

/**
 * Build a CardPrice document from API response
 */
export function buildCardPriceDocument(
  card: Card,
  fetchResult: Awaited<ReturnType<typeof fetchEbayPrice>>,
): CardPrice {
  const now = new Date().toISOString();
  const cardName =
    typeof card.name === "string"
      ? card.name
      : card.name.en || card.name.ja || "";

  // Always generate eBay search URL from our search query
  const ebaySearchUrl = buildEbaySearchUrl(fetchResult.searchQuery);

  const doc: CardPrice = {
    card_id: card.id,
    series_short_name: card.series_short_name,
    set_short_name: card.set_short_name,
    card_name: cardName,
    prices: {
      ...fetchResult.priceData,
      response_url: ebaySearchUrl,
    },
    all_sales: fetchResult.recentSales, // All fetched sales for rolling window merge
    recent_sales: fetchResult.recentSales.slice(0, 10),
    search_query_used: fetchResult.searchQuery,
    excluded_keywords_used: fetchResult.excludedKeywords,
    fetched_at: now,
    created_at: now,
    updated_at: now,
    status: fetchResult.status,
  };

  // Only include error_message if it exists (Firestore doesn't accept undefined)
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

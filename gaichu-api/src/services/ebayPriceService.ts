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
 * Uses eBay OR syntax: (term1,term2)
 */
const SERIES_NAME_MAP: Record<string, string> = {
  wm: '("wrenny moo",wrennymoo)',
  ash: '"after skool hobby"',
  oz: "openzoo",
  mz: "metazoo",
  disgruntled: '("disgruntled games",disgruntledgames)',
};

/** Map set short names to eBay-friendly search terms
 * eBay sellers use product names like "Generation One" rather than internal names like "series1"
 * Uses eBay OR syntax: (term1,term2)
 */
const SET_NAME_MAP: Record<string, Record<string, string>> = {
  wm: {
    set1: '("set 1","series 1")',
  },
  ash: {
    series1: '"generation one"',
    og: '"generation one"',
    series2: '"genetic mystery"',
    sticker: "sticker",
  },
};

/** Default keywords to exclude from searches */
const DEFAULT_EXCLUDED_KEYWORDS = [
  "lot",
  "bundle",
  "complete",
  "ecto",
  "repack",
];

/** Series-specific excluded keywords */
const SERIES_EXCLUDED_KEYWORDS: Record<string, string[]> = {
  wm: ["first"],
  ash: ["ditto"],
};

/** ASH card name overrides for eBay search */
const ASH_CARD_NAME_MAP: Record<string, string> = {
  "______'s Pikachu": '"birthday pikachu"',
};

/** Card-specific search name overrides */
const CARD_NAME_OVERRIDES: Record<string, string> = {
  "ash-series1-0": "Charizard Nagaba",
  "ash-series1-2": "Charizard #2",
  "ash-series1-10": "scream pikachu",
  "ash-series1-18": "bubble mew",
  "ash-series1-21": "pikachu #21",
  "ash-series1-29": "eeveelutions",
  "ash-series1-31": "charizard #31",
  "ash-series1-40": "poncho charizard",
  "ash-series1-41": "poncho mega charizard",
  "ash-series1-42": "poncho gyarados",
  "ash-series1-43": "poncho lucario",
};

/** Card-specific search name overrides by card ID */
const CARD_ID_OVERRIDES: Record<string, string> = {
  "78a02344-0c51-48ef-b22c-d5892e98ce3e": "ditto secret",
};

/** Card-specific excluded keywords */
const CARD_EXCLUDED_KEYWORDS: Record<string, string[]> = {
  "wm-set1-7": ["Alolan"],
  "wm-set1-38": ["signed"],
  "ash-series1-40": ["mega"],
};

function getSearchCardName(card: Card): string {
  if (CARD_ID_OVERRIDES[card.id]) {
    return CARD_ID_OVERRIDES[card.id];
  }

  const cardKey = `${card.series_short_name}-${card.set_short_name}-${card.number}`;
  if (CARD_NAME_OVERRIDES[cardKey]) {
    return CARD_NAME_OVERRIDES[cardKey];
  }

  let cardName: string;

  if (card.series_short_name === "ash") {
    cardName =
      typeof card.name === "string"
        ? card.name
        : card.name.en || card.name.ja || "";

    if (ASH_CARD_NAME_MAP[cardName]) {
      return ASH_CARD_NAME_MAP[cardName];
    }
    if (cardName.endsWith("?")) {
      cardName = `${cardName.slice(0, -1)} ditto`;
    }
  } else {
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

/* Get the card number identifier for the search query */
function getCardNumberIdentifier(card: Card): string | null {
  if (!card.number && card.number !== 0) return null;

  if (card.series_short_name === "ash") {
    if (card.number === 0) {
      return "Nagaba";
    }
    return `#${card.number}`;
  }
  return null;
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

  // 3. Card number identifier (series-specific format)
  const cardKey = `${card.series_short_name}-${card.set_short_name}-${card.number}`;
  const hasOverride =
    !!CARD_ID_OVERRIDES[card.id] || !!CARD_NAME_OVERRIDES[cardKey];
  if (card.series_short_name === "ash" && !hasOverride) {
    const numberIdentifier = getCardNumberIdentifier(card);
    if (numberIdentifier) {
      parts.push(numberIdentifier);
    }
  }

  // 4. Set identifier for specificity
  if (card.set_short_name && card.series_short_name !== "ash") {
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

  const seriesExclusions = SERIES_EXCLUDED_KEYWORDS[card.series_short_name];
  if (seriesExclusions) {
    const isDittoCard = card.series_short_name === "ash" && card.number === 44;
    const filteredExclusions = isDittoCard
      ? seriesExclusions.filter((kw) => kw !== "ditto")
      : seriesExclusions;
    keywords.push(...filteredExclusions);
  }

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

const EMPTY_PRICE_DATA: EbayPriceData = {
  average_price: null,
  median_price: null,
  min_price: null,
  max_price: null,
  sample_size: 0,
};

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
        priceData: { ...EMPTY_PRICE_DATA },
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
        priceData: { ...EMPTY_PRICE_DATA },
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
      priceData: { ...EMPTY_PRICE_DATA },
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

/**
 * Delay helper for rate limiting
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

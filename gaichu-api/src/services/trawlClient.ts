const RAPIDAPI_HOST = "ebay-average-selling-price.p.rapidapi.com";
const BASE_URL = `https://${RAPIDAPI_HOST}`;
const PAGE_SIZE = 100;

export interface TrawlSoldResult {
  title: string;
  sale_price: number;
  shipping_price: number | null;
  date_sold: string; // ISO
  item_id: string;
  item_link: string;
}

interface SearchResponse {
  page: number;
  count: number;
  results: TrawlSoldResult[];
}

export interface SoldSearch {
  query: string;
  exclude?: string;
  category?: string;
  dateFrom?: string;
  maxPages?: number;
}

export class TrawlError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "TrawlError";
  }
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const MIN_REQUEST_GAP_MS = 1100;
const MAX_RETRIES = 3;
let lastRequestAt = 0;

export function resetThrottle(): void {
  lastRequestAt = 0;
}

async function throttle(): Promise<void> {
  const wait = lastRequestAt + MIN_REQUEST_GAP_MS - Date.now();
  if (wait > 0) await sleep(wait);
  lastRequestAt = Date.now();
}

async function errorDetail(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as {
      error?: string;
      message?: string;
    };
    const detail = body.error ?? body.message;
    if (detail) return `${response.status}: ${detail}`;
  } catch {
    // Non-JSON error body
  }
  return `${response.status} ${response.statusText}`;
}

function isTransient(status: number, detail: string, retryAfter: boolean) {
  if (status === 503) return true;
  if (status !== 429) return false;
  return retryAfter || /per second/i.test(detail);
}

async function fetchPage(
  params: URLSearchParams,
  apiKey: string,
): Promise<TrawlSoldResult[]> {
  for (let attempt = 0; ; attempt++) {
    await throttle();
    const response = await fetch(`${BASE_URL}/search?${params.toString()}`, {
      headers: {
        "x-rapidapi-host": RAPIDAPI_HOST,
        "x-rapidapi-key": apiKey,
      },
    });

    if (response.ok) {
      const data = (await response.json()) as SearchResponse;
      return data.results ?? [];
    }

    const retryAfter = response.headers.get("retry-after");
    const detail = await errorDetail(response);
    if (
      attempt < MAX_RETRIES &&
      isTransient(response.status, detail, retryAfter !== null)
    ) {
      await sleep(retryAfter ? Number(retryAfter) * 1000 : 1000 * 2 ** attempt);
      continue;
    }
    throw new TrawlError(`sold search failed (${detail})`, response.status);
  }
}

export async function searchSold(
  search: SoldSearch,
  apiKey: string,
): Promise<TrawlSoldResult[]> {
  const params = new URLSearchParams({
    query: search.query,
    site: "EBAY_US",
    limit: String(PAGE_SIZE),
  });
  if (search.exclude) params.set("exclude", search.exclude);
  if (search.category) params.set("category", search.category);
  if (search.dateFrom) params.set("date_from", search.dateFrom);

  const all: TrawlSoldResult[] = [];
  const maxPages = search.maxPages ?? 1;
  for (let page = 1; page <= maxPages; page++) {
    params.set("page", String(page));
    const results = await fetchPage(params, apiKey);
    all.push(...results);
    if (results.length < PAGE_SIZE) break;
  }
  return all;
}

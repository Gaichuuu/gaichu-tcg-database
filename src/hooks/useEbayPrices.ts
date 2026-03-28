import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { THIRTY_MINUTES, ONE_HOUR } from "@/utils/TimeUtils";

export interface EbayPriceData {
  average_price: number | null;
  median_price: number | null;
  min_price: number | null;
  max_price: number | null;
  sample_size: number;
  last_updated: string;
  ebay_search_url?: string;
}

interface ApiResponse {
  success: boolean;
  data: EbayPriceData | null;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

async function fetchEbayPrices(cardId: string): Promise<EbayPriceData | null> {
  const url = `${API_BASE_URL}/v1/prices/${cardId}`;
  const response = await fetch(url);

  if (!response.ok) {
    if (response.status === 404) {
      return null;
    }
    throw new Error(`Failed to fetch prices: ${response.status}`);
  }

  const json = (await response.json()) as ApiResponse;
  return json.data;
}

export function useEbayPrices(
  cardId: string,
  seriesShortName: string,
): UseQueryResult<EbayPriceData | null, Error> {
  // Only enable for series with eBay price data
  const enabled = Boolean(cardId) && ["ash", "wm", "tygadu"].includes(seriesShortName);

  return useQuery<EbayPriceData | null, Error>({
    queryKey: ["ebayPrices", cardId],
    queryFn: () => fetchEbayPrices(cardId),
    enabled,
    staleTime: THIRTY_MINUTES,
    gcTime: ONE_HOUR,
    retry: 1,
  });
}

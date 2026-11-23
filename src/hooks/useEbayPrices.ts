import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { THIRTY_MINUTES, ONE_HOUR } from "@/utils/TimeUtils";
import { isPricedSeries } from "@/hooks/usePriceHistory";
import { fetchApiData } from "@/utils/apiFetch";

export interface EbayPriceData {
  average_price: number | null;
  median_price: number | null;
  min_price: number | null;
  max_price: number | null;
  sample_size: number;
  last_updated: string;
  last_sale_date?: string | null;
  ebay_search_url?: string;
}

const fetchEbayPrices = (cardId: string): Promise<EbayPriceData | null> =>
  fetchApiData<EbayPriceData | null>(`/v1/prices/${cardId}`, "prices", null);

export function useEbayPrices(
  cardId: string,
  seriesShortName: string,
): UseQueryResult<EbayPriceData | null, Error> {
  // Only enable for series with eBay price data
  const enabled = Boolean(cardId) && isPricedSeries(seriesShortName);

  return useQuery<EbayPriceData | null, Error>({
    queryKey: ["ebayPrices", cardId],
    queryFn: () => fetchEbayPrices(cardId),
    enabled,
    staleTime: THIRTY_MINUTES,
    gcTime: ONE_HOUR,
    retry: 1,
  });
}

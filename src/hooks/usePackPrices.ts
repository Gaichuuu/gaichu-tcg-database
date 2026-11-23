import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { THIRTY_MINUTES, ONE_HOUR } from "@/utils/TimeUtils";
import {
  isPricedSeries,
  type SnapshotPoint,
  type SnapshotSource,
} from "@/hooks/usePriceHistory";
import type { EbayPriceData } from "@/hooks/useEbayPrices";
import { fetchApiData } from "@/utils/apiFetch";

export interface PackPriceSnapshot extends SnapshotPoint {
  set_id: string;
  series_short_name: string;
  median_price: number | null;
  min_price: number | null;
  max_price: number | null;
  sample_size: number;
  source: SnapshotSource;
  created_at: string;
}

const fetchPackPrice = (setId: string): Promise<EbayPriceData | null> =>
  fetchApiData<EbayPriceData | null>(
    `/v1/pack-prices/${setId}`,
    "pack price",
    null,
  );

async function fetchPackPriceHistory(
  setId: string,
): Promise<PackPriceSnapshot[]> {
  const data = await fetchApiData<{ snapshots: PackPriceSnapshot[] } | null>(
    `/v1/pack-prices/${setId}/history?range=MAX`,
    "pack price history",
    null,
  );
  return data?.snapshots ?? [];
}

export function usePackPrice(
  setId: string,
  seriesShortName: string,
): UseQueryResult<EbayPriceData | null, Error> {
  const enabled = Boolean(setId) && isPricedSeries(seriesShortName);
  return useQuery<EbayPriceData | null, Error>({
    queryKey: ["packPrice", setId],
    queryFn: () => fetchPackPrice(setId),
    enabled,
    staleTime: THIRTY_MINUTES,
    gcTime: ONE_HOUR,
    retry: 1,
  });
}

export function usePackPriceHistory(
  setId: string,
  seriesShortName: string,
): UseQueryResult<PackPriceSnapshot[], Error> {
  const enabled = Boolean(setId) && isPricedSeries(seriesShortName);
  return useQuery<PackPriceSnapshot[], Error>({
    queryKey: ["packPriceHistory", setId],
    queryFn: () => fetchPackPriceHistory(setId),
    enabled,
    staleTime: THIRTY_MINUTES,
    gcTime: ONE_HOUR,
    retry: 1,
  });
}

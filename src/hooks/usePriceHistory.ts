import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { THIRTY_MINUTES, ONE_HOUR } from "@/utils/TimeUtils";
import type { ChartPoint } from "@/utils/priceChart";
import { fetchApiData } from "@/utils/apiFetch";

export type PriceRange = "3M" | "6M" | "12M" | "MAX";

export interface PriceSnapshot {
  card_id: string;
  series_short_name: string;
  week: string;
  snapshot_date: string;
  average_price: number | null;
  median_price: number | null;
  min_price: number | null;
  max_price: number | null;
  sample_size: number;
  source: SnapshotSource;
  created_at: string;
}

export type SnapshotSource = "sync" | "git-backfill" | "trawl-backfill";
export const PRICED_SERIES = ["ash", "wm", "tygadu"];

export interface SnapshotPoint {
  average_price: number | null;
  snapshot_date: string;
  week: string;
}

export function selectChartPoints(snapshots: SnapshotPoint[]): ChartPoint[] {
  const sorted = [...snapshots].sort((a, b) =>
    a.snapshot_date.localeCompare(b.snapshot_date),
  );
  const out: ChartPoint[] = [];
  let last: number | null = null;
  for (const s of sorted) {
    const valid =
      typeof s.average_price === "number" && s.average_price > 0
        ? s.average_price
        : null;
    const value: number | null = valid ?? last;
    if (value === null) continue;
    last = value;
    out.push({ value, date: s.snapshot_date, week: s.week });
  }
  return out;
}

async function fetchPriceHistory(cardId: string): Promise<PriceSnapshot[]> {
  const data = await fetchApiData<{ snapshots: PriceSnapshot[] } | null>(
    `/v1/prices/${cardId}/history?range=MAX`,
    "price history",
    null,
  );
  return data?.snapshots ?? [];
}

export function isPricedSeries(seriesShortName: string): boolean {
  return PRICED_SERIES.includes(seriesShortName);
}

export function usePriceHistory(
  cardId: string,
  seriesShortName: string,
): UseQueryResult<PriceSnapshot[], Error> {
  const enabled = Boolean(cardId) && isPricedSeries(seriesShortName);
  return useQuery<PriceSnapshot[], Error>({
    queryKey: ["priceHistory", cardId],
    queryFn: () => fetchPriceHistory(cardId),
    enabled,
    staleTime: THIRTY_MINUTES,
    gcTime: ONE_HOUR,
    retry: 1,
  });
}

export const MIN_SALES_TO_REPRICE = 2;

export const toCents = (n: number): number => Math.round(n * 100) / 100;

export interface SourcePrice {
  average: number | null | undefined;
  sampleSize: number | null | undefined;
}

export function priceToPublish(
  source: SourcePrice,
  current: number | null | undefined,
): number | null {
  if (typeof source.average !== "number" || !(source.average > 0)) return null;
  const hasCurrent = typeof current === "number" && current > 0;
  if (hasCurrent && (source.sampleSize ?? 0) < MIN_SALES_TO_REPRICE) {
    return null;
  }
  return toCents(source.average);
}

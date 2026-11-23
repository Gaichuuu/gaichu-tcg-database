import { describe, it, expect } from "vitest";
import { selectChartPoints, type PriceSnapshot } from "@/hooks/usePriceHistory";

const snap = (over: Partial<PriceSnapshot>): PriceSnapshot => ({
  card_id: "c1",
  series_short_name: "ash",
  week: "2026-W04",
  snapshot_date: "2026-01-19",
  average_price: 50,
  median_price: null,
  min_price: null,
  max_price: null,
  sample_size: 0,
  source: "git-backfill",
  created_at: "2026-06-01T00:00:00.000Z",
  ...over,
});

describe("selectChartPoints", () => {
  it("keeps only snapshots with a positive average_price, in date order", () => {
    const out = selectChartPoints([
      snap({
        week: "2026-W06",
        snapshot_date: "2026-02-02",
        average_price: 47,
      }),
      snap({
        week: "2026-W04",
        snapshot_date: "2026-01-19",
        average_price: 50,
      }),
    ]);
    expect(out.map((p) => p.value)).toEqual([50, 47]);
    expect(out.map((p) => p.week)).toEqual(["2026-W04", "2026-W06"]);
  });

  it("carries the previous value forward when a later snapshot is 0/null (data error)", () => {
    const out = selectChartPoints([
      snap({
        week: "2026-W04",
        snapshot_date: "2026-01-19",
        average_price: 50,
      }),
      snap({ week: "2026-W05", snapshot_date: "2026-01-26", average_price: 0 }),
      snap({
        week: "2026-W06",
        snapshot_date: "2026-02-02",
        average_price: null,
      }),
      snap({
        week: "2026-W07",
        snapshot_date: "2026-02-09",
        average_price: 45,
      }),
    ]);
    expect(out.map((p) => p.value)).toEqual([50, 50, 50, 45]);
  });

  it("skips leading invalid snapshots when there is no prior value to carry", () => {
    const out = selectChartPoints([
      snap({ average_price: null }),
      snap({ week: "2026-W05", snapshot_date: "2026-01-26", average_price: 0 }),
      snap({
        week: "2026-W06",
        snapshot_date: "2026-02-02",
        average_price: 12,
      }),
    ]);
    expect(out).toHaveLength(1);
    expect(out[0].value).toBe(12);
  });
});

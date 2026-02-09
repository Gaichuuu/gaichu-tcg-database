// Mock Firebase before importing functions
vi.mock("@/lib/firebase", () => ({ database: {} }));
vi.mock("firebase/firestore/lite", () => ({
  collection: vi.fn(),
  getDocs: vi.fn(),
}));

import { mergeWithSeriesId } from "@/services/CollectionSeriesService";
import type { CollectionSeries } from "@/types/CollectionSeries";
import type { CollectionSet } from "@/types/CollectionSet";

describe("mergeWithSeriesId", () => {
  const makeSeries = (
    overrides?: Partial<CollectionSeries>,
  ): CollectionSeries => ({
    id: "series-1",
    sort_by: 1,
    short_name: "ash",
    name: "Ash Series",
    logo: "https://example.com/logo.png",
    ...overrides,
  });

  const makeSet = (overrides?: Partial<CollectionSet>): CollectionSet => ({
    id: "set-1",
    short_name: "base",
    series_short_name: "ash",
    series_id: "series-1",
    logo: "https://example.com/set-logo.png",
    name: "Base Set",
    sort_by: 1,
    ...overrides,
  });

  it("maps each series to its matching sets by series_id", () => {
    const series = [
      makeSeries({ id: "series-1", short_name: "ash" }),
      makeSeries({ id: "series-2", short_name: "wm" }),
    ];
    const sets = [
      makeSet({ id: "set-1", series_id: "series-1" }),
      makeSet({ id: "set-2", series_id: "series-1" }),
      makeSet({ id: "set-3", series_id: "series-2" }),
    ];

    const result = mergeWithSeriesId(series, sets);

    expect(result).toHaveLength(2);
    expect(result[0].series.id).toBe("series-1");
    expect(result[0].sets).toHaveLength(2);
    expect(result[1].series.id).toBe("series-2");
    expect(result[1].sets).toHaveLength(1);
  });

  it("sorts sets within each series by sort_by ascending", () => {
    const series = [makeSeries({ id: "series-1" })];
    const sets = [
      makeSet({ id: "set-1", series_id: "series-1", sort_by: 3 }),
      makeSet({ id: "set-2", series_id: "series-1", sort_by: 1 }),
      makeSet({ id: "set-3", series_id: "series-1", sort_by: 2 }),
    ];

    const result = mergeWithSeriesId(series, sets);

    expect(result[0].sets[0].sort_by).toBe(1);
    expect(result[0].sets[1].sort_by).toBe(2);
    expect(result[0].sets[2].sort_by).toBe(3);
  });

  it("returns empty sets array when no sets match", () => {
    const series = [makeSeries({ id: "series-1" })];
    const sets = [makeSet({ id: "set-1", series_id: "series-2" })];

    const result = mergeWithSeriesId(series, sets);

    expect(result).toHaveLength(1);
    expect(result[0].sets).toEqual([]);
  });

  it("handles empty series array", () => {
    const series: CollectionSeries[] = [];
    const sets = [makeSet()];

    const result = mergeWithSeriesId(series, sets);

    expect(result).toEqual([]);
  });

  it("handles empty sets array", () => {
    const series = [
      makeSeries({ id: "series-1" }),
      makeSeries({ id: "series-2" }),
    ];
    const sets: CollectionSet[] = [];

    const result = mergeWithSeriesId(series, sets);

    expect(result).toHaveLength(2);
    expect(result[0].sets).toEqual([]);
    expect(result[1].sets).toEqual([]);
  });

  it("preserves series properties", () => {
    const series = [
      makeSeries({
        id: "series-1",
        short_name: "ash",
        name: "Ash Series",
        logo: "https://example.com/logo.png",
        sort_by: 5,
      }),
    ];
    const sets: CollectionSet[] = [];

    const result = mergeWithSeriesId(series, sets);

    expect(result[0].series).toEqual(series[0]);
  });
});

import { describe, it, expect } from "vitest";
import { snapshotInstants, statsAsOf } from "./historyBackfill.js";
import type { EbaySale } from "../types/index.js";

const sale = (id: string, date: string, price: number): EbaySale => ({
  title: `Card ${id}`,
  sale_price: price,
  date_sold: date,
  link: `https://www.ebay.com/itm/${id}`,
});

describe("snapshotInstants", () => {
  it("lists each Monday 09:00 UTC from the start week through `to`", () => {
    const weeks = snapshotInstants(
      new Date("2026-07-08T00:00:00Z"), // a Wednesday
      new Date("2026-07-27T10:00:00Z"), // a Monday, after 9 AM
    );
    expect(weeks.map((d) => d.toISOString())).toEqual([
      "2026-07-06T09:00:00.000Z",
      "2026-07-13T09:00:00.000Z",
      "2026-07-20T09:00:00.000Z",
      "2026-07-27T09:00:00.000Z",
    ]);
  });

  it("excludes a Monday whose 9 AM hasn't happened yet", () => {
    const weeks = snapshotInstants(
      new Date("2026-07-20T00:00:00Z"),
      new Date("2026-07-27T08:00:00Z"),
    );
    expect(weeks).toHaveLength(1);
  });
});

describe("statsAsOf", () => {
  const sales = [
    sale("1", "2026-07-01T00:00:00.000Z", 10),
    sale("2", "2026-07-10T00:00:00.000Z", 20),
    sale("3", "2026-08-20T00:00:00.000Z", 40),
  ];

  it("ignores sales that happened after the snapshot", () => {
    const stats = statsAsOf(sales, new Date("2026-07-13T09:00:00Z"));
    expect(stats.sample_size).toBe(2);
  });

  it("includes later sales for later snapshots", () => {
    const stats = statsAsOf(sales, new Date("2026-08-24T09:00:00Z"));
    expect(stats.sample_size).toBe(3);
  });

  it("dedupes the same eBay item seen from two sources", () => {
    const dup = [
      ...sales,
      { ...sales[0], link: "https://www.ebay.com/itm/1?_skw=other" },
    ];
    expect(statsAsOf(dup, new Date("2026-07-13T09:00:00Z")).sample_size).toBe(
      2,
    );
  });

  it("returns empty stats before any sale", () => {
    const stats = statsAsOf(sales, new Date("2026-06-01T09:00:00Z"));
    expect(stats.sample_size).toBe(0);
    expect(stats.average_price).toBeNull();
  });
});

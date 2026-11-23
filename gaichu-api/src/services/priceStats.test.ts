import { describe, it, expect } from "vitest";

import {
  calculatePriceStats,
  isLikelyMultiItemListing,
  mergeSales,
  MIN_SALES_TO_RETAIN,
} from "./priceStats.js";
import type { EbaySale } from "../types/index.js";

const NOW = new Date("2026-06-09T00:00:00Z");

function daysAgo(days: number): string {
  const d = new Date(NOW);
  d.setDate(d.getDate() - days);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

let itemId = 1000;
function sale(over: Partial<EbaySale>): EbaySale {
  itemId++;
  return {
    title: "Wrenny Moo Butterfree Card 15/50 Series 1 Pokemon Derpy Parody TCG",
    sale_price: 10,
    date_sold: daysAgo(5),
    link: `https://www.ebay.com/itm/${itemId}?_skw=foo`,
    ...over,
  };
}

describe("isLikelyMultiItemListing", () => {
  it("flags pick-your-card / multi-card storefront listings", () => {
    expect(
      isLikelyMultiItemListing(
        "MASSIVE Collection of Wrenny Moo Cards – Pick Your Cards! Read Description!",
      ),
    ).toBe(true);
    expect(
      isLikelyMultiItemListing(
        "You Choose! Wrenny Moo Custom Parody Pokemon Cards - Set 1 - Non-Holo",
      ),
    ).toBe(true);
    expect(isLikelyMultiItemListing("Wrenny Moo Gastly lot of 5")).toBe(true);
    expect(
      isLikelyMultiItemListing(
        "WRENNY MOO SERIES 1 AND SERIES 2 Pokemon Trading Cards Pack Parody SEALED PACKS",
      ),
    ).toBe(true);
    expect(
      isLikelyMultiItemListing(
        "Wrenny Moo Pokemon Parody Sealed Set 1 Booster Pack (7 Cards)",
      ),
    ).toBe(false);
    expect(isLikelyMultiItemListing("Wrenny Moo complete set bundle")).toBe(
      true,
    );
  });

  it("does not flag single-card listings", () => {
    expect(
      isLikelyMultiItemListing(
        "Wrenny Moo Butterfree Card 15/50 Series 1 Pokemon Derpy Parody TCG",
      ),
    ).toBe(false);
    expect(
      isLikelyMultiItemListing(
        "Gastly 19/50 - Series 1 - Wrenny Moo Pokemon Card - NM",
      ),
    ).toBe(false);
    expect(
      isLikelyMultiItemListing("Completed grading Pikachu picked-up fresh"),
    ).toBe(false);
  });
});

describe("calculatePriceStats", () => {
  it("returns nulls for an empty window", () => {
    expect(calculatePriceStats([])).toEqual({
      average_price: null,
      median_price: null,
      min_price: null,
      max_price: null,
      sample_size: 0,
    });
  });

  it("trims a single extreme sale via the IQR fence (n >= 4)", () => {
    const sales = [12, 15, 20.68, 303.26].map((p) => sale({ sale_price: p }));
    const stats = calculatePriceStats(sales);
    expect(stats.average_price).toBeCloseTo(15.89, 2);
    expect(stats.sample_size).toBe(3);
  });
});

describe("mergeSales", () => {
  it("dedupes by eBay item id across fetches", () => {
    const a = sale({ link: "https://www.ebay.com/itm/123?x=1" });
    const b = sale({ link: "https://www.ebay.com/itm/123?x=2", sale_price: 9 });
    const merged = mergeSales([a], [b], NOW);
    expect(merged).toHaveLength(1);
  });

  it("keeps separate sales of one multi-quantity listing", () => {
    const a = sale({
      link: "https://www.ebay.com/itm/555",
      date_sold: daysAgo(3),
    });
    const b = sale({
      link: "https://www.ebay.com/itm/555",
      date_sold: daysAgo(9),
    });
    expect(mergeSales([], [a, b], NOW)).toHaveLength(2);
  });

  it("matches a sale across the old and new date formats", () => {
    const old = sale({
      link: "https://www.ebay.com/itm/777?_skw=a",
      date_sold: "Jul 9, 2026",
    });
    const fresh = sale({
      link: "https://www.ebay.com/itm/777",
      date_sold: "2026-07-09T16:11:00.000Z",
    });
    expect(
      mergeSales([old], [fresh], new Date("2026-07-20T00:00:00Z")),
    ).toHaveLength(1);
  });

  it("matches a legacy-dated sale to its UTC twin on the next day", () => {
    const old = sale({
      link: "https://www.ebay.com/itm/888?_skw=a",
      date_sold: "Jul 9, 2026",
    });
    const fresh = sale({
      link: "https://www.ebay.com/itm/888",
      date_sold: "2026-07-10T06:00:00.000Z",
    });
    const merged = mergeSales([old], [fresh], new Date("2026-07-20T00:00:00Z"));
    expect(merged).toHaveLength(1);
    expect(merged[0].date_sold).toBe("2026-07-10T06:00:00.000Z");
  });

  it("keeps a legacy sale of the same item a week apart (a separate buyer)", () => {
    const old = sale({
      link: "https://www.ebay.com/itm/889",
      date_sold: "Jul 1, 2026",
    });
    const fresh = sale({
      link: "https://www.ebay.com/itm/889",
      date_sold: "2026-07-10T06:00:00.000Z",
    });
    expect(
      mergeSales([old], [fresh], new Date("2026-07-20T00:00:00Z")),
    ).toHaveLength(2);
  });

  it("drops multi-item listings, including ones already stored", () => {
    const stored = sale({
      title: "MASSIVE Collection of Wrenny Moo Cards – Pick Your Cards!",
      sale_price: 151.96,
    });
    const fresh = sale({ sale_price: 3.25 });
    const merged = mergeSales([stored], [fresh], NOW);
    expect(merged).toHaveLength(1);
    expect(merged[0].sale_price).toBe(3.25);
  });

  it("drops sales older than 90 days when the window is healthy", () => {
    const sales = [5, 15, 25, 40, 60, 95, 120].map((age) =>
      sale({ date_sold: daysAgo(age) }),
    );
    const merged = mergeSales(sales, [], NOW);
    expect(merged).toHaveLength(5);
  });

  it("retains the most recent sales when the 90-day window runs dry", () => {
    // Eevee regression: window collapses to one fresh outlier; the older
    // sales must stick around so the outlier trim still has a baseline.
    const oldSales = [12, 15, 20.68].map((p, i) =>
      sale({ sale_price: p, date_sold: daysAgo(100 + i) }),
    );
    const outlier = sale({ sale_price: 303.26, date_sold: daysAgo(10) });
    const merged = mergeSales(oldSales, [outlier], NOW);
    expect(merged).toHaveLength(4);

    const stats = calculatePriceStats(merged);
    expect(stats.average_price).toBeCloseTo(15.89, 2);
  });

  it("never retains more than MIN_SALES_TO_RETAIN stale sales", () => {
    const oldSales = Array.from({ length: 8 }, (_, i) =>
      sale({ date_sold: daysAgo(120 + i) }),
    );
    const merged = mergeSales(oldSales, [], NOW);
    expect(merged).toHaveLength(MIN_SALES_TO_RETAIN);
  });

  it("sorts results newest first", () => {
    const older = sale({ date_sold: daysAgo(30) });
    const newer = sale({ date_sold: daysAgo(2) });
    const merged = mergeSales([older], [newer], NOW);
    expect(merged[0].date_sold).toBe(newer.date_sold);
  });
});

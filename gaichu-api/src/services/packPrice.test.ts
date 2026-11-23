import { describe, it, expect } from "vitest";

import {
  buildPackSearchQuery,
  getPackExcludedKeywords,
  buildPackEbaySearchUrl,
  buildPackPriceDocument,
} from "./ebayPriceService.js";
import type { Set, EbayPriceData, EbaySale } from "../types/index.js";

const makeSet = (over: Partial<Set> = {}): Set => ({
  id: "set-uuid",
  series_short_name: "wm",
  series_id: "series-uuid",
  short_name: "set1",
  sort_by: 1,
  name: "Set One",
  logo: "logo.jpg",
  pack_art: { url: "pack.jpg" },
  ...over,
});

describe("buildPackSearchQuery", () => {
  it("combines series name, mapped set name, and 'pack'", () => {
    expect(buildPackSearchQuery(makeSet())).toBe(
      '"wrenny moo" ("set 1","series 1") pack',
    );
  });

  it("falls back to 'set N' formatting when no set mapping exists", () => {
    expect(
      buildPackSearchQuery(
        makeSet({ series_short_name: "tygadu", short_name: "set2" }),
      ),
    ).toBe("tygadu set 2 pack");
  });
});

describe("getPackExcludedKeywords", () => {
  it("excludes box/case/display in addition to the card defaults", () => {
    const kw = getPackExcludedKeywords();
    expect(kw).toContain("box");
    expect(kw).toContain("case");
    expect(kw).toContain("lot");
  });
});

describe("buildPackEbaySearchUrl", () => {
  it("builds a sold/completed eBay search URL", () => {
    const url = buildPackEbaySearchUrl("wrenny moo set 1 pack");
    expect(url).toContain("https://www.ebay.com/sch/i.html?");
    expect(url).toContain("LH_Sold=1");
    expect(url).toContain("LH_Complete=1");
  });
});

describe("buildPackPriceDocument", () => {
  it("maps the fetch result onto a PackPrice keyed by set id", () => {
    const priceData: EbayPriceData = {
      average_price: 25,
      median_price: 24,
      min_price: 20,
      max_price: 30,
      sample_size: 4,
    };
    const sales: EbaySale[] = [
      {
        title: "wrenny moo set 1 pack sealed",
        sale_price: 25,
        date_sold: "Jun 1, 2026",
        link: "https://www.ebay.com/itm/123",
      },
    ];
    const doc = buildPackPriceDocument(makeSet(), {
      priceData,
      recentSales: sales,
      searchQuery: "q",
      excludedKeywords: "lot box",
      status: "success",
    });

    expect(doc.set_id).toBe("set-uuid");
    expect(doc.series_short_name).toBe("wm");
    expect(doc.pack_name).toBe("Set One pack");
    expect(doc.all_sales).toHaveLength(1);
    expect(doc.prices.response_url).toContain("ebay.com");
    expect(doc.status).toBe("success");
  });
});

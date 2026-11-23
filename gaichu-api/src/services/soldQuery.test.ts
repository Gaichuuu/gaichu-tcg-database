import { describe, it, expect } from "vitest";
import { expandQuery, excludeFor } from "./soldQuery.js";
import { buildSearchQuery, buildPackSearchQuery } from "./ebayPriceService.js";
import type { Card, Set } from "../types/index.js";

describe("expandQuery", () => {
  it("unquotes phrases", () => {
    expect(expandQuery('"after skool hobby" Blastoise')).toEqual([
      "after skool hobby Blastoise",
    ]);
  });

  it("expands an OR group into one query per choice", () => {
    expect(expandQuery('("wrenny moo",wrennymoo) Gengar')).toEqual([
      "wrenny moo Gengar",
      "wrennymoo Gengar",
    ]);
  });

  it("takes the cross product of several OR groups", () => {
    expect(
      expandQuery('("wrenny moo",wrennymoo) Gengar ("set 1","series 1")'),
    ).toEqual([
      "wrenny moo Gengar set 1",
      "wrenny moo Gengar series 1",
      "wrennymoo Gengar set 1",
      "wrennymoo Gengar series 1",
    ]);
  });

  it("drops standalone symbols trawl can't match as words", () => {
    expect(expandQuery('"after skool hobby" Latias & Latios')).toEqual([
      "after skool hobby Latias Latios",
    ]);
  });

  it("passes a plain query through unchanged", () => {
    expect(expandQuery("tygadu Anya Forger")).toEqual(["tygadu Anya Forger"]);
  });

  it("rejects an unbalanced group instead of searching garbage", () => {
    expect(() => expandQuery('("wrenny moo",wrennymoo')).toThrow();
  });
});

describe("excludeFor", () => {
  it("drops exclude words the query asks for (trawl 400s on overlap)", () => {
    expect(
      excludeFor("after skool hobby pikachu ditto", "lot ditto genetic"),
    ).toBe("lot genetic");
  });
  it("keeps everything when nothing overlaps", () => {
    expect(excludeFor("tygadu Edward Elric", "lot bundle")).toBe("lot bundle");
  });
});

describe("every configured search expands cleanly", () => {
  const card = (over: Partial<Card>): Card =>
    ({
      id: "x",
      name: { en: "Gengar" },
      number: 5,
      series_short_name: "wm",
      set_short_name: "set1",
      ...over,
    }) as Card;

  it("card queries", () => {
    for (const c of [
      card({}),
      card({ series_short_name: "ash", set_short_name: "series1", number: 1 }),
      card({ series_short_name: "ash", set_short_name: "series1", number: 22 }),
      card({ series_short_name: "tygadu", parody: "Anya Forger" }),
    ]) {
      const queries = expandQuery(buildSearchQuery(c));
      expect(queries.length).toBeGreaterThan(0);
      for (const q of queries) expect(q).not.toMatch(/["(),]/);
    }
  });

  it("pack queries", () => {
    for (const [series, short] of [
      ["wm", "set2"],
      ["ash", "series1"],
      ["ash", "series2"],
      ["tygadu", "set1"],
      ["wm", "set1"],
    ]) {
      const set = { series_short_name: series, short_name: short } as Set;
      const queries = expandQuery(buildPackSearchQuery(set));
      expect(queries.length).toBeGreaterThan(0);
      for (const q of queries) expect(q).not.toMatch(/["(),]/);
    }
  });
});

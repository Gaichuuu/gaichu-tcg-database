import { describe, it, expect } from "vitest";
import type { CollectionCard } from "@/types/CollectionCard";
import type { SetAndCard } from "@/types/MergedCollection";
import {
  flattenSeriesCards,
  parseHp,
  collectVariants,
  matchesQuery,
  filterCards,
  sortCards,
  DEFAULT_FILTERS,
} from "@/utils/cardFilters";

const card = (over: Partial<CollectionCard>): CollectionCard =>
  ({
    id: "x",
    number: 1,
    sort_by: 1,
    name: { en: "x" },
    set_ids: [],
    ...over,
  }) as unknown as CollectionCard;

const setAndCard = (setId: string, cards: CollectionCard[]): SetAndCard =>
  ({ set: { id: setId, short_name: setId, name: setId }, cards }) as SetAndCard;

describe("flattenSeriesCards", () => {
  it("flattens cards across sets and dedupes by id", () => {
    const a = card({ id: "a", set_ids: ["s1", "s2"] });
    const b = card({ id: "b", set_ids: ["s2"] });
    const result = flattenSeriesCards([
      setAndCard("s1", [a]),
      setAndCard("s2", [a, b]),
    ]);
    expect(result.map((c) => c.id).sort()).toEqual(["a", "b"]);
  });
});

describe("parseHp", () => {
  it("parses numeric hp strings and defaults non-numeric to 0", () => {
    expect(parseHp("110")).toBe(110);
    expect(parseHp("")).toBe(0);
    expect(parseHp(undefined)).toBe(0);
    expect(parseHp("abc")).toBe(0);
  });
});

describe("collectVariants", () => {
  it("returns distinct sorted non-empty variant values", () => {
    const cards = [
      card({ variant: "Holo" }),
      card({ variant: "Normal" }),
      card({ variant: "Holo" }),
      card({ variant: undefined }),
    ];
    expect(collectVariants(cards)).toEqual(["Holo", "Normal"]);
  });
});

describe("matchesQuery", () => {
  it("AND-matches every word against the card search text", () => {
    const c = card({ name: { en: "Star Girl" }, parody: "Usagi" });
    expect(matchesQuery(c, "")).toBe(true);
    expect(matchesQuery(c, "star girl")).toBe(true);
    expect(matchesQuery(c, "star usagi")).toBe(true);
    expect(matchesQuery(c, "star dragon")).toBe(false);
  });
});

describe("filterCards", () => {
  const cards = [
    card({
      id: "1",
      set_ids: ["s1"],
      variant: "Normal",
      hp: "70",
      name: { en: "Aa" },
    }),
    card({
      id: "2",
      set_ids: ["s2"],
      variant: "Holo",
      hp: "120",
      name: { en: "Bb" },
    }),
    card({
      id: "3",
      set_ids: ["s1"],
      variant: "Holo",
      hp: "30",
      name: { en: "Cc" },
    }),
  ];

  it("filters by set ids", () => {
    const r = filterCards(cards, { ...DEFAULT_FILTERS, setIds: ["s1"] });
    expect(r.map((c) => c.id)).toEqual(["1", "3"]);
  });
  it("matches nothing when every set is unchecked", () => {
    expect(filterCards(cards, { ...DEFAULT_FILTERS, setIds: [] })).toEqual([]);
  });
  it("matches every set when there is no set filter", () => {
    expect(filterCards(cards, DEFAULT_FILTERS)).toHaveLength(cards.length);
  });

  it("filters by variant", () => {
    const r = filterCards(cards, { ...DEFAULT_FILTERS, variant: "Holo" });
    expect(r.map((c) => c.id)).toEqual(["2", "3"]);
  });

  it("filters by price range", () => {
    const priced = [
      card({ id: "1", average_price: 5 }),
      card({ id: "2", average_price: 50 }),
      card({ id: "3", average_price: 200 }),
    ];
    expect(
      filterCards(priced, { ...DEFAULT_FILTERS, minPrice: 10 }).map(
        (c) => c.id,
      ),
    ).toEqual(["2", "3"]);
    expect(
      filterCards(priced, { ...DEFAULT_FILTERS, maxPrice: 100 }).map(
        (c) => c.id,
      ),
    ).toEqual(["1", "2"]);
    expect(
      filterCards(priced, {
        ...DEFAULT_FILTERS,
        minPrice: 10,
        maxPrice: 100,
      }).map((c) => c.id),
    ).toEqual(["2"]);
  });

  it("combines filters (AND)", () => {
    const r = filterCards(cards, {
      ...DEFAULT_FILTERS,
      setIds: ["s1"],
      variant: "Holo",
    });
    expect(r.map((c) => c.id)).toEqual(["3"]);
  });
});

describe("sortCards", () => {
  const cards = [
    card({ id: "1", sort_by: 3, average_price: 70, name: { en: "Cherry" } }),
    card({ id: "2", sort_by: 1, average_price: 120, name: { en: "Apple" } }),
    card({ id: "3", sort_by: 2, average_price: 30, name: { en: "Banana" } }),
  ];

  it("sorts by card number (sort_by) by default", () => {
    expect(sortCards(cards, "number").map((c) => c.id)).toEqual([
      "2",
      "3",
      "1",
    ]);
  });
  it("sorts by name A→Z", () => {
    expect(sortCards(cards, "name-asc").map((c) => c.id)).toEqual([
      "2",
      "3",
      "1",
    ]);
  });
  it("sorts by name Z→A", () => {
    expect(sortCards(cards, "name-desc").map((c) => c.id)).toEqual([
      "1",
      "3",
      "2",
    ]);
  });
  it("sorts by price high→low", () => {
    expect(sortCards(cards, "price-desc").map((c) => c.id)).toEqual([
      "2",
      "1",
      "3",
    ]);
  });
  it("sorts by price low→high", () => {
    expect(sortCards(cards, "price-asc").map((c) => c.id)).toEqual([
      "3",
      "1",
      "2",
    ]);
  });
  it("keeps unpriced cards last in both price directions", () => {
    const withUnpriced = [
      card({ id: "u1", sort_by: 0, name: { en: "Unpriced" } }),
      ...cards,
      card({ id: "u2", sort_by: 4, average_price: 0, name: { en: "Zero" } }),
    ];
    expect(sortCards(withUnpriced, "price-asc").map((c) => c.id)).toEqual([
      "3",
      "1",
      "2",
      "u1",
      "u2",
    ]);
    expect(sortCards(withUnpriced, "price-desc").map((c) => c.id)).toEqual([
      "2",
      "1",
      "3",
      "u1",
      "u2",
    ]);
  });
  it("does not mutate the input array", () => {
    const input = [...cards];
    sortCards(input, "name-asc");
    expect(input.map((c) => c.id)).toEqual(["1", "2", "3"]);
  });
});

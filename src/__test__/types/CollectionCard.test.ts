import {
  toI18nMap,
  normalizeCollectionCard,
  normalizeCollectionList,
  type RawCollectionCard,
} from "@/types/CollectionCard";

describe("toI18nMap", () => {
  it("returns empty object for null", () => {
    expect(toI18nMap(null as unknown as Record<string, string>)).toEqual({});
  });

  it("returns empty object for undefined", () => {
    expect(toI18nMap(undefined)).toEqual({});
  });

  it("converts string to object with en key", () => {
    expect(toI18nMap("Fire Dragon")).toEqual({ en: "Fire Dragon" });
  });

  it("passes through record unchanged", () => {
    const record = { en: "Fire Dragon", ja: "ファイアドラゴン" };
    expect(toI18nMap(record)).toEqual(record);
  });
});

describe("normalizeCollectionCard", () => {
  const makeRawCard = (
    overrides?: Partial<RawCollectionCard>,
  ): RawCollectionCard => ({
    id: "test-id",
    total_cards_count: 50,
    number: 1,
    sort_by: 1,
    name: "Test Card",
    image: "https://example.com/card.png",
    rarity: "common",
    set_short_name: "base",
    series_short_name: "ash",
    illustrators: [],
    set_ids: ["set-1"],
    sets: [{ name: "Base Set", image: "https://example.com/set.png" }],
    thumb: "https://example.com/thumb.png",
    variant: "normal",
    ...overrides,
  });

  it("converts string name to i18n object with en key", () => {
    const raw = makeRawCard({ name: "Fire Dragon" });
    const result = normalizeCollectionCard(raw);
    expect(result.name).toEqual({ en: "Fire Dragon" });
  });

  it("passes through record name unchanged", () => {
    const name = { en: "Fire Dragon", ja: "ファイアドラゴン" };
    const raw = makeRawCard({ name });
    const result = normalizeCollectionCard(raw);
    expect(result.name).toEqual(name);
  });

  it("converts string description to i18n object", () => {
    const raw = makeRawCard({ description: "A fiery beast" });
    const result = normalizeCollectionCard(raw);
    expect(result.description).toEqual({ en: "A fiery beast" });
  });

  it("normalizes attack names to i18n objects", () => {
    const raw = makeRawCard({
      attacks: [
        {
          name: "Flame Burst",
          effect: "Does 50 damage",
          damage: "50",
        },
      ],
    });
    const result = normalizeCollectionCard(raw);
    expect(result.attacks?.[0].name).toEqual({ en: "Flame Burst" });
  });

  it("normalizes attack effects to i18n objects", () => {
    const raw = makeRawCard({
      attacks: [
        {
          name: "Flame Burst",
          effect: "Does 50 damage",
          damage: "50",
        },
      ],
    });
    const result = normalizeCollectionCard(raw);
    expect(result.attacks?.[0].effect).toEqual({ en: "Does 50 damage" });
  });

  it("defaults attack costs to empty array when missing", () => {
    const raw = makeRawCard({
      attacks: [
        {
          name: "Flame Burst",
          effect: "Does 50 damage",
          damage: "50",
        },
      ],
    });
    const result = normalizeCollectionCard(raw);
    expect(result.attacks?.[0].costs).toEqual([]);
  });

  it("preserves attack costs when provided", () => {
    const raw = makeRawCard({
      attacks: [
        {
          name: "Flame Burst",
          effect: "Does 50 damage",
          damage: "50",
          costs: ["fire", "fire"],
        },
      ],
    });
    const result = normalizeCollectionCard(raw);
    expect(result.attacks?.[0].costs).toEqual(["fire", "fire"]);
  });

  it("handles missing attacks as empty array", () => {
    const raw = makeRawCard({ attacks: undefined });
    const result = normalizeCollectionCard(raw);
    expect(result.attacks).toEqual([]);
  });

  it("preserves all other fields unchanged", () => {
    const raw = makeRawCard({
      parody: "Charizard",
      hp: "120",
      type: "fire",
      average_price: 12.5,
    });
    const result = normalizeCollectionCard(raw);
    expect(result.parody).toBe("Charizard");
    expect(result.hp).toBe("120");
    expect(result.type).toBe("fire");
    expect(result.average_price).toBe(12.5);
  });
});

describe("normalizeCollectionList", () => {
  const makeRawCard = (
    overrides?: Partial<RawCollectionCard>,
  ): RawCollectionCard => ({
    id: "test-id",
    total_cards_count: 50,
    number: 1,
    sort_by: 1,
    name: "Test Card",
    image: "https://example.com/card.png",
    rarity: "common",
    set_short_name: "base",
    series_short_name: "ash",
    illustrators: [],
    set_ids: ["set-1"],
    sets: [{ name: "Base Set", image: "https://example.com/set.png" }],
    thumb: "https://example.com/thumb.png",
    variant: "normal",
    ...overrides,
  });

  it("maps array of raw cards to normalized cards", () => {
    const raws = [
      makeRawCard({ id: "card-1", name: "Card 1" }),
      makeRawCard({ id: "card-2", name: "Card 2" }),
    ];
    const result = normalizeCollectionList(raws);
    expect(result).toHaveLength(2);
    expect(result[0].name).toEqual({ en: "Card 1" });
    expect(result[1].name).toEqual({ en: "Card 2" });
  });

  it("returns empty array for empty input", () => {
    const result = normalizeCollectionList([]);
    expect(result).toEqual([]);
  });
});

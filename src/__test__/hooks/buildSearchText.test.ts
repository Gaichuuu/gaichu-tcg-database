import { buildSearchText } from "@/hooks/useCardSearch";
import { makeCard } from "@/__test__/__mock__/collectionCardMock";
import type { Locale } from "@/i18n";

describe("buildSearchText", () => {
  const locale: Locale = "en";

  it("includes English name", () => {
    const card = makeCard({ name: { en: "Fire Dragon" } });
    const result = buildSearchText(card, locale);
    expect(result).toContain("fire dragon");
  });

  it("includes Japanese name", () => {
    const card = makeCard({
      name: { en: "Fire Dragon", ja: "ファイアドラゴン" },
    });
    const result = buildSearchText(card, locale);
    expect(result).toContain("ファイアドラゴン");
  });

  it("includes description resolved via locale", () => {
    const card = makeCard({
      description: { en: "A fiery beast", ja: "炎の獣" },
    });
    const result = buildSearchText(card, "en");
    expect(result).toContain("a fiery beast");
  });

  it("includes attack names", () => {
    const card = makeCard({
      attacks: [
        {
          name: { en: "Flame Burst" },
          effect: { en: "Does 50 damage" },
          costs: [],
        },
      ],
    });
    const result = buildSearchText(card, locale);
    expect(result).toContain("flame burst");
  });

  it("includes attack effects", () => {
    const card = makeCard({
      attacks: [
        {
          name: { en: "Flame Burst" },
          effect: { en: "Does 50 damage" },
          costs: [],
        },
      ],
    });
    const result = buildSearchText(card, locale);
    expect(result).toContain("does 50 damage");
  });

  it("includes parody", () => {
    const card = makeCard({ parody: "Charizard" });
    const result = buildSearchText(card, locale);
    expect(result).toContain("charizard");
  });

  it("includes rarity", () => {
    const card = makeCard({ rarity: "rare" });
    const result = buildSearchText(card, locale);
    expect(result).toContain("rare");
  });

  it("includes type", () => {
    const card = makeCard({ type: "fire" });
    const result = buildSearchText(card, locale);
    expect(result).toContain("fire");
  });

  it("includes effect", () => {
    const card = makeCard({ effect: "Water shield" });
    const result = buildSearchText(card, locale);
    expect(result).toContain("water shield");
  });

  it("includes note", () => {
    const card = makeCard({ note: "Promo only" });
    const result = buildSearchText(card, locale);
    expect(result).toContain("promo only");
  });

  it("includes hp", () => {
    const card = makeCard({ hp: "120" });
    const result = buildSearchText(card, locale);
    expect(result).toContain("120");
  });

  it("includes color", () => {
    const card = makeCard({ color: "yellow" });
    const result = buildSearchText(card, locale);
    expect(result).toContain("yellow");
  });

  it("includes variant", () => {
    const card = makeCard({ variant: "holo" });
    const result = buildSearchText(card, locale);
    expect(result).toContain("holo");
  });

  it("includes illustrators", () => {
    const card = makeCard({ illustrators: ["Artist One", "Artist Two"] });
    const result = buildSearchText(card, locale);
    expect(result).toContain("artist one");
    expect(result).toContain("artist two");
  });

  it("includes series_short_name", () => {
    const card = makeCard({ series_short_name: "ash" });
    const result = buildSearchText(card, locale);
    expect(result).toContain("ash");
  });

  it("includes set_short_name", () => {
    const card = makeCard({ set_short_name: "base" });
    const result = buildSearchText(card, locale);
    expect(result).toContain("base");
  });

  it("includes first set name", () => {
    const card = makeCard({
      sets: [
        { name: "Base Set", image: "url" },
        { name: "Expansion", image: "url" },
      ],
    });
    const result = buildSearchText(card, locale);
    expect(result).toContain("base set");
  });

  it("returns lowercase string", () => {
    const card = makeCard({
      name: { en: "FIRE DRAGON" },
      parody: "CHARIZARD",
    });
    const result = buildSearchText(card, locale);
    expect(result).toBe(result.toLowerCase());
  });

  it("handles card with no optional fields (minimal card)", () => {
    const card = makeCard({
      name: { en: "Minimal Card" },
      description: undefined,
      attacks: undefined,
      parody: undefined,
      type: undefined,
      effect: undefined,
      note: undefined,
      hp: undefined,
      color: undefined,
      illustrators: [],
    });
    const result = buildSearchText(card, locale);
    expect(result).toContain("minimal card");
    expect(result).toContain("ash"); // series_short_name
    expect(result).toContain("base"); // set_short_name
  });

  it("handles empty attacks array", () => {
    const card = makeCard({
      name: { en: "Test Card" },
      attacks: [],
    });
    const result = buildSearchText(card, locale);
    expect(result).toContain("test card");
  });

  it("handles attacks with Japanese-only text", () => {
    const card = makeCard({
      attacks: [
        {
          name: { ja: "水鉄砲" },
          effect: { ja: "20ダメージ" },
          costs: [],
        },
      ],
    });
    const resultJa = buildSearchText(card, "ja");
    expect(resultJa).toContain("水鉄砲");
    expect(resultJa).toContain("20ダメージ");
  });

  it("handles missing set names gracefully", () => {
    const card = makeCard({ sets: [] });
    const result = buildSearchText(card, locale);
    expect(result).toBeTruthy();
    expect(result).not.toContain("undefined");
  });
});

// Mock dependencies before importing functions
vi.mock("@/hooks/useCollection", () => ({ useSeries: vi.fn() }));
vi.mock("@/services/CollectionSetService", () => ({ fetchSets: vi.fn() }));
vi.mock("@/services/JsonCollectionSetService", () => ({ getJsonSet: vi.fn() }));
vi.mock("@/services/Constants", () => ({ IS_USE_LOCAL_DATA: false }));

import { hasValidImage, shuffle, toEnName } from "@/hooks/useShowcaseCards";
import { makeCard } from "@/__test__/__mock__/collectionCardMock";

describe("hasValidImage", () => {
  it("returns true for normal image URL", () => {
    const card = makeCard({ image: "https://example.com/card.png" });
    expect(hasValidImage(card)).toBe(true);
  });

  it("returns false for image with asterisk", () => {
    const card = makeCard({ image: "https://example.com/*card.png" });
    expect(hasValidImage(card)).toBe(false);
  });

  it("returns false for image with asterisk in middle", () => {
    const card = makeCard({ image: "https://example.com/card*.png" });
    expect(hasValidImage(card)).toBe(false);
  });

  it("returns false for image ending in /00.jpg", () => {
    const card = makeCard({ image: "https://example.com/00.jpg" });
    expect(hasValidImage(card)).toBe(false);
  });

  it("returns true for image ending in /01.jpg", () => {
    const card = makeCard({ image: "https://example.com/01.jpg" });
    expect(hasValidImage(card)).toBe(true);
  });
});

describe("shuffle", () => {
  it("returns array of same length", () => {
    const input = [1, 2, 3, 4, 5];
    const result = shuffle(input, Math.random);
    expect(result).toHaveLength(5);
  });

  it("does not mutate original array", () => {
    const input = [1, 2, 3, 4, 5];
    const original = [...input];
    shuffle(input, Math.random);
    expect(input).toEqual(original);
  });

  it("contains all original elements", () => {
    const input = [1, 2, 3, 4, 5];
    const result = shuffle(input, Math.random);
    expect(result.sort()).toEqual([1, 2, 3, 4, 5]);
  });

  it("is deterministic with same RNG function", () => {
    const input = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

    // Create deterministic RNG
    const makeRng = () => {
      let seed = 12345;
      return () => {
        seed = (seed * 16807) % 2147483647;
        return (seed - 1) / 2147483646;
      };
    };

    const result1 = shuffle(input, makeRng());
    const result2 = shuffle(input, makeRng());
    expect(result1).toEqual(result2);
  });

  it("handles empty array", () => {
    const result = shuffle([], Math.random);
    expect(result).toEqual([]);
  });

  it("handles single element array", () => {
    const result = shuffle([1], Math.random);
    expect(result).toEqual([1]);
  });
});

describe("toEnName", () => {
  it("returns en value when present", () => {
    const name = { en: "Fire Dragon" };
    expect(toEnName(name)).toBe("Fire Dragon");
  });

  it("falls back to ja value when en is missing", () => {
    const name = { ja: "炎" };
    expect(toEnName(name)).toBe("炎");
  });

  it("returns first available value when en is missing", () => {
    const name = { ja: "炎の竜" };
    expect(toEnName(name)).toBe("炎の竜");
  });

  it("returns empty string for empty object", () => {
    expect(toEnName({})).toBe("");
  });

  it("returns empty string for undefined", () => {
    expect(toEnName(undefined as unknown as Record<string, string>)).toBe("");
  });

  it("handles string input", () => {
    expect(toEnName("Fire Dragon" as unknown as Record<string, string>)).toBe("Fire Dragon");
  });

  it("prefers en over ja when both present", () => {
    const name = { en: "Fire Dragon", ja: "ファイアドラゴン" };
    expect(toEnName(name)).toBe("Fire Dragon");
  });
});

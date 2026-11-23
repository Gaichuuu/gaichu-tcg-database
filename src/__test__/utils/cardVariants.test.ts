import { describe, it, expect } from "vitest";
import type { CollectionCard } from "@/types/CollectionCard";
import { variantKey, findVariants } from "@/utils/cardVariants";

const card = (over: Partial<CollectionCard>): CollectionCard =>
  ({
    id: "x",
    number: 1,
    sort_by: 1,
    name: { en: "x" },
    set_ids: [],
    ...over,
  }) as unknown as CollectionCard;

describe("variantKey", () => {
  it("combines lowercased english name + parody", () => {
    expect(variantKey(card({ name: { en: "Cutie" }, parody: "Sailor" }))).toBe(
      "cutie|sailor",
    );
  });
  it("falls back to ja name and empty parody", () => {
    expect(variantKey(card({ name: { ja: "キュー" } }))).toBe("キュー|");
  });
});

describe("findVariants", () => {
  const all = [
    card({
      id: "1",
      name: { en: "Cutie" },
      parody: "Sailor",
      variant: "Normal",
      sort_by: 1,
    }),
    card({
      id: "2",
      name: { en: "Cutie" },
      parody: "Sailor",
      variant: "Holo",
      sort_by: 31,
    }),
    card({
      id: "3",
      name: { en: "Onii" },
      parody: "Itachi",
      variant: "Normal",
      sort_by: 2,
    }),
  ];

  it("returns all siblings sharing name+parody, sorted by sort_by", () => {
    const result = findVariants(all, all[1]); // the Holo Cutie
    expect(result.map((c) => c.id)).toEqual(["1", "2"]);
  });

  it("returns a single-element list when the card has no siblings", () => {
    expect(findVariants(all, all[2]).map((c) => c.id)).toEqual(["3"]);
  });

  it("always includes the focused card even if not present in the list", () => {
    const lonely = card({ id: "9", name: { en: "Ghost" }, parody: "X" });
    expect(findVariants(all, lonely).map((c) => c.id)).toEqual(["9"]);
  });
});

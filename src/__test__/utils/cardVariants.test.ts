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
      "cutie|sailor||",
    );
  });
  it("falls back to ja name and empty parody", () => {
    expect(variantKey(card({ name: { ja: "キュー" } }))).toBe("キュー|||");
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

describe("findVariants with same-named but different cards", () => {
  const attack = (name: string, costs: string[] = [], damage?: string) => ({
    name: { en: name },
    effect: {},
    costs,
    damage,
  });
  const charizard = (
    id: string,
    sort_by: number,
    hp: string,
    attacks: ReturnType<typeof attack>[],
  ) =>
    card({
      id,
      sort_by,
      name: { en: "Charizard" },
      parody: "Charizard",
      hp,
      attacks,
    });

  const fire = ["Fire", "Fire", "Fire", "Fire"];
  const all = [
    charizard("0", 0.1, "120", [
      attack("PKM POWER ~ Energy Burn"),
      attack("Fire Spin", fire, "100 dmg"),
    ]),
    charizard("2", 2, "120", [
      attack("Pokemon Power: Energy Burn"),
      attack("Fire Spin", fire, "100"),
    ]),
    charizard("31", 31, "110", [
      attack("Poke-BODY: Crystal Type"),
      attack("Fire Blast", ["Fire", "Fire", "Fighting"], "40"),
    ]),
  ];

  it("groups printings whose only difference is how a power is worded", () => {
    expect(findVariants(all, all[0]).map((c) => c.id)).toEqual(["0", "2"]);
  });

  it("separates a same-named card with different HP and attacks", () => {
    expect(findVariants(all, all[2]).map((c) => c.id)).toEqual(["31"]);
  });

  it("separates same-HP cards whose attacks differ", () => {
    const poncho = (id: string, second: string) =>
      card({
        id,
        name: { en: "Poncho-wearing Pikachu" },
        parody: "Pikachu",
        hp: "70",
        attacks: [
          attack("Pika Punch", ["Lightning"], "30"),
          attack(second, ["Fire", "Fire"], "100"),
        ],
      });
    const ponchos = [
      poncho("40", "Crimson Dive?"),
      poncho("41", "Wild Blaze?"),
    ];
    expect(findVariants(ponchos, ponchos[0]).map((c) => c.id)).toEqual(["40"]);
  });
});

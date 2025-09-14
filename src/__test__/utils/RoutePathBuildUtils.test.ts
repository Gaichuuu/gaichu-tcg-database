import {
  CardDetailPath,
  getCardDetailPath,
  parseSortAndNameRegex,
} from "@/utils/RoutePathBuildUtils";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { getBreadcrumbItems } from "@/utils/RoutePathBuildUtils";

describe("getBreadcrumbItems", () => {
  it("returns breadcrumbs for a simple set path", () => {
    const items = getBreadcrumbItems("/cards/mz/sets/promo");
    expect(items).toEqual([
      { label: "cards", routeTo: "/cards" },
      { label: "mz", routeTo: "/cards/mz" },
      { label: "promo", routeTo: undefined },
    ]);
  });

  it('includes decoded segments and filters out "sets" & "card"', () => {
    const path = "/cards/my%20series/sets/my%20set/card/1.5_My%20Card";
    const items = getBreadcrumbItems(path);
    expect(items).toEqual([
      { label: "cards", routeTo: "/cards" },
      { label: "my series", routeTo: "/cards/my%20series" },
      { label: "my set", routeTo: "/cards/my%20series/sets/my%20set" },
      { label: "My Card", routeTo: undefined },
    ]);
  });

  it("handles trailing slash without producing empty items", () => {
    const items = getBreadcrumbItems("/cards/mz/sets/promo/");
    expect(items).toEqual([
      { label: "cards", routeTo: "/cards" },
      { label: "mz", routeTo: "/cards/mz" },
      { label: "promo", routeTo: undefined },
    ]);
  });

  it("handle Pack Art or Card Back page", () => {
    const packItems = getBreadcrumbItems("/cards/mz/sets/promo/pack-art");
    expect(packItems).toEqual([
      { label: "cards", routeTo: "/cards" },
      { label: "mz", routeTo: "/cards/mz" },
      { label: "promo", routeTo: "/cards/mz/sets/promo" },
      { label: "Pack Art", routeTo: undefined },
    ]);

    const backItems = getBreadcrumbItems("/cards/mz/sets/promo/card-back");
    expect(backItems).toEqual([
      { label: "cards", routeTo: "/cards" },
      { label: "mz", routeTo: "/cards/mz" },
      { label: "promo", routeTo: "/cards/mz/sets/promo" },
      { label: "Card Back", routeTo: undefined },
    ]);
  });

  it("throws if the last segment is not in the expected format", () => {
    expect(() =>
      getBreadcrumbItems("/cards/mz/sets/promo/card/invalidFormat"),
    ).toThrowError(/Invalid format: invalidFormat/);
  });
});

describe("parseSortAndNameRegex", () => {
  it("parses a decimal sortBy and simple name", () => {
    const { sortBy, cardName } = parseSortAndNameRegex("99.1_testname");
    expect(sortBy).toBe(99.1);
    expect(cardName).toBe("testname");
  });

  it("parses an integer sortBy and name", () => {
    const { sortBy, cardName } = parseSortAndNameRegex("42_test");
    expect(sortBy).toBe(42);
    expect(cardName).toBe("test");
  });

  it("includes additional underscores in the cardName", () => {
    const { sortBy, cardName } = parseSortAndNameRegex("3.14_My_Card_Name");
    expect(sortBy).toBe(3.14);
    expect(cardName).toBe("My_Card_Name");
  });

  it("throws on missing underscore", () => {
    expect(() => parseSortAndNameRegex("991testname")).toThrowError(
      /Invalid format: 991testname/,
    );
  });

  it("throws when sortBy is non-numeric", () => {
    expect(() => parseSortAndNameRegex("abc_name")).toThrowError(
      /Invalid format: abc_name/,
    );
  });

  it("throws when name part is empty", () => {
    expect(() => parseSortAndNameRegex("12_")).toThrowError(
      /Invalid format: 12_/,
    );
  });
});

vi.mock("react-router-dom", async () => {
  // grab the real module so we don’t break other exports
  const actual =
    await vi.importActual<typeof import("react-router-dom")>(
      "react-router-dom",
    );
  return {
    ...actual,
    // replace generatePath with a vi.fn
    generatePath: vi.fn(
      (pattern: string, params: Record<string, string>) =>
        `${pattern}/${params.seriesShortName}/${params.setShortName}/${params.sortByAndCardName}`,
    ),
  };
});

import { generatePath } from "react-router-dom";

describe("getCardDetailPath", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("encodes params and calls generatePath correctly", () => {
    const card = {
      series_short_name: "My Series test",
      set_short_name: "Set/One",
      sortBy: 10,
      name: "Card Name",
    } as any;

    const expectedParams = {
      seriesShortName: encodeURIComponent(card.series_short_name),
      setShortName: encodeURIComponent(card.set_short_name),
      sortByAndCardName: encodeURIComponent(`${card.sortBy}_${card.name}`),
    };

    const path = getCardDetailPath(card);

    expect(generatePath).toHaveBeenCalledOnce();
    expect(generatePath).toHaveBeenCalledWith(CardDetailPath, expectedParams);

    expect(path).toBe(
      `${CardDetailPath}/${expectedParams.seriesShortName}/${expectedParams.setShortName}/${expectedParams.sortByAndCardName}`,
    );
  });
});

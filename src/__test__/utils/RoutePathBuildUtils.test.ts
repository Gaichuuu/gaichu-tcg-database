import {
  CardDetailPath,
  getCardDetailPath,
  parseSortAndNameRegex,
} from "@/utils/RoutePathBuildUtils";
import { beforeEach, describe, expect, it, vi } from "vitest";

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

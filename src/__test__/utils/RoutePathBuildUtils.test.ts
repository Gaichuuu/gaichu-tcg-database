import { parseSortAndNameRegex } from "@/utils/RoutePathBuildUtils";
import { describe, expect, it } from "vitest";

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

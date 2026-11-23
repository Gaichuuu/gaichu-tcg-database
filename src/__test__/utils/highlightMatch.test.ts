import { describe, it, expect } from "vitest";
import { highlightMatch } from "@/utils/highlightMatch";

describe("highlightMatch", () => {
  it("splits around a case-insensitive match, preserving original case", () => {
    expect(highlightMatch("Fire Dragon", "dra")).toEqual({
      pre: "Fire ",
      match: "Dra",
      post: "gon",
    });
  });

  it("prefers the whole query over individual words", () => {
    expect(highlightMatch("Fire Dragon", "fire dra").match).toBe("Fire Dra");
  });

  it("falls back to the first matching word of a multi-word query", () => {
    expect(highlightMatch("Fire Dragon", "holo dragon").match).toBe("Dragon");
  });

  it("returns the full text unhighlighted when nothing matches", () => {
    expect(highlightMatch("Fire Dragon", "zzz")).toEqual({
      pre: "Fire Dragon",
      match: "",
      post: "",
    });
  });

  it("ignores a blank query", () => {
    expect(highlightMatch("Fire Dragon", "   ").match).toBe("");
  });
});

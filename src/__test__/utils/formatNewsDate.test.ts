import { describe, it, expect } from "vitest";
import { formatNewsDate } from "@/utils/formatNewsDate";

describe("formatNewsDate", () => {
  it("shows the date a post was dated with, not the day before", () => {
    expect(formatNewsDate(Date.parse("2026-11-16"))).toBe("2026.11.16");
  });

  it("pads month and day", () => {
    expect(formatNewsDate(Date.parse("2026-03-04"))).toBe("2026.03.04");
  });
});

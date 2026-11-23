import { describe, it, expect } from "vitest";
import { isLikelySourceOutage, OUTAGE_MIN_CARDS } from "./syncHealth.js";

describe("isLikelySourceOutage", () => {
  it("flags a full-size run with zero successes", () => {
    expect(isLikelySourceOutage(55, 0)).toBe(true);
  });
  it("does not flag a run where any card found sales", () => {
    expect(isLikelySourceOutage(55, 1)).toBe(false);
  });
  it("does not flag small runs (single-series or single-card syncs)", () => {
    expect(isLikelySourceOutage(OUTAGE_MIN_CARDS - 1, 0)).toBe(false);
  });
});

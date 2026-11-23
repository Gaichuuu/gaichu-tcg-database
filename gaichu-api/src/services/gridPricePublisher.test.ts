import { describe, it, expect } from "vitest";
import { planPublish, toCents } from "./gridPricePublisher.js";
import { priceToPublish, MIN_SALES_TO_REPRICE } from "./gridPriceRule.js";

const src = (average: number | null, sampleSize = 5) => ({
  average,
  sampleSize,
});

describe("planPublish", () => {
  const target = new Map<string, number | null | undefined>([
    ["a", 10],
    ["b", 39.98],
    ["c", undefined],
    ["d", 5],
    ["gengar", 19.68],
  ]);

  it("updates changed prices, rounded to cents", () => {
    const plan = planPublish(new Map([["b", src(24.9876)]]), target);
    expect(plan.updates).toEqual([{ id: "b", value: 24.99 }]);
  });

  it("fills in a price the grid doesn't have yet, even from one sale", () => {
    expect(planPublish(new Map([["c", src(12, 1)]]), target).updates).toEqual([
      { id: "c", value: 12 },
    ]);
  });

  it("keeps an existing price when the window has a single sale", () => {
    const plan = planPublish(new Map([["gengar", src(0.8, 1)]]), target);
    expect(plan.updates).toEqual([]);
    expect(plan.thinSample).toBe(1);
  });

  it("leaves unchanged prices alone", () => {
    const plan = planPublish(new Map([["a", src(10.001)]]), target);
    expect(plan.updates).toEqual([]);
    expect(plan.unchanged).toBe(1);
  });

  it("keeps the last known price when there are no sales", () => {
    const plan = planPublish(
      new Map([
        ["d", src(null)],
        ["a", src(0)],
      ]),
      target,
    );
    expect(plan.updates).toEqual([]);
    expect(plan.noPrice).toBe(2);
  });

  it("never creates docs for ids the grid doesn't know", () => {
    const plan = planPublish(new Map([["zzz", src(50)]]), target);
    expect(plan.updates).toEqual([]);
    expect(plan.missing).toBe(1);
  });
});

describe("priceToPublish", () => {
  it(`moves an existing price only with ${MIN_SALES_TO_REPRICE}+ sales`, () => {
    expect(priceToPublish(src(0.8, 1), 19.68)).toBeNull();
    expect(priceToPublish(src(15, 2), 19.68)).toBe(15);
  });
});

describe("toCents", () => {
  it("rounds to two decimals", () => {
    expect(toCents(16.666)).toBe(16.67);
  });
});

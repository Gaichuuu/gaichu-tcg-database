import { describe, it, expect } from "vitest";
import {
  buildChartGeometry,
  sampleLine,
  summarizePoints,
  type ChartPoint,
  buildXTicks,
  formatTickDate,
  pointsInRange,
} from "@/utils/priceChart";

const pts: ChartPoint[] = [
  { value: 50, date: "2026-01-19", week: "2026-W04" },
  { value: 40, date: "2026-03-23", week: "2026-W13" },
  { value: 44.25, date: "2026-05-25", week: "2026-W22" },
];

describe("buildChartGeometry", () => {
  it("maps the lowest value to the bottom and highest to the top of the plot", () => {
    const g = buildChartGeometry(pts, { width: 600, height: 200, padding: 24 });
    const top = g.plotted.find((p) => p.value === 50)!;
    const bottom = g.plotted.find((p) => p.value === 40)!;
    expect(top.y).toBeLessThan(bottom.y); // smaller y == higher on screen
    expect(g.min).toBe(40);
    expect(g.max).toBe(50);
  });

  it("spaces points evenly across the plot width, left to right", () => {
    const g = buildChartGeometry(pts, { width: 600, height: 200, padding: 24 });
    const xs = g.plotted.map((p) => p.x);
    expect(xs[0]).toBeLessThan(xs[1]);
    expect(xs[1]).toBeLessThan(xs[2]);
    expect(xs[0]).toBeCloseTo(24); // first point at left padding
    expect(xs[2]).toBeCloseTo(576); // last point at width - padding
  });

  it("produces a smooth path beginning with M and one cubic segment per gap", () => {
    const g = buildChartGeometry(pts, { width: 600, height: 200, padding: 24 });
    expect(g.linePath.startsWith("M")).toBe(true);
    expect((g.linePath.match(/C/g) ?? []).length).toBe(2); // 3 points -> 2 curves
  });

  it("passes the curve through every point (each point's coords end a segment)", () => {
    const g = buildChartGeometry(pts, { width: 600, height: 200, padding: 24 });
    // last plotted point's coords must appear as the final curve endpoint
    const last = g.plotted[g.plotted.length - 1];
    expect(
      g.linePath.trim().endsWith(`${last.x.toFixed(2)} ${last.y.toFixed(2)}`),
    ).toBe(true);
  });

  it("flattens a single point to the vertical middle without dividing by zero", () => {
    const g = buildChartGeometry(
      [{ value: 10, date: "2026-01-01", week: "2026-W01" }],
      {
        width: 600,
        height: 200,
        padding: 24,
      },
    );
    expect(g.plotted).toHaveLength(1);
    expect(Number.isFinite(g.plotted[0].y)).toBe(true);
    expect(g.plotted[0].y).toBeCloseTo(100); // mid-height when min === max
  });
});

describe("sampleLine", () => {
  const g = buildChartGeometry(pts, { width: 600, height: 200, padding: 24 });

  it("interpolates the value halfway between two points", () => {
    const midX = (g.plotted[0].x + g.plotted[1].x) / 2;
    const s = sampleLine(g.plotted, midX)!;
    expect(s.value).toBeCloseTo((50 + 40) / 2); // 45
    expect(s.x).toBeCloseTo(midX);
  });

  it("interpolates the date halfway between two points", () => {
    const midX = (g.plotted[0].x + g.plotted[1].x) / 2;
    const s = sampleLine(g.plotted, midX)!;
    expect(s.date >= "2026-01-19").toBe(true);
    expect(s.date <= "2026-03-23").toBe(true);
    expect(s.date.startsWith("2026-02")).toBe(true); // ~midpoint, in February
  });

  it("clamps to the first value when x is left of the data", () => {
    const s = sampleLine(g.plotted, -100)!;
    expect(s.value).toBe(50);
  });

  it("clamps to the last value when x is right of the data", () => {
    const s = sampleLine(g.plotted, 99999)!;
    expect(s.value).toBeCloseTo(44.25);
  });

  it("returns null for an empty series", () => {
    expect(sampleLine([], 100)).toBeNull();
  });
});

describe("summarizePoints", () => {
  it("computes current value plus change in dollars and percent over the period", () => {
    const s = summarizePoints(pts)!;
    expect(s.current).toBeCloseTo(44.25);
    expect(s.first).toBe(50);
    expect(s.changeAbs).toBeCloseTo(-5.75);
    expect(s.changePct).toBeCloseTo(-11.5);
  });

  it("returns null when there are no points", () => {
    expect(summarizePoints([])).toBeNull();
  });

  it("reports zero change for a single point", () => {
    const s = summarizePoints([
      { value: 30, date: "2026-01-01", week: "2026-W01" },
    ])!;
    expect(s.current).toBe(30);
    expect(s.changeAbs).toBe(0);
    expect(s.changePct).toBe(0);
  });
});

describe("buildChartGeometry options", () => {
  const insets = { top: 14, right: 12, bottom: 30, left: 44 };

  it("honours per-side insets", () => {
    const g = buildChartGeometry(pts, {
      width: 600,
      height: 220,
      padding: insets,
    });
    expect(g.plotted[0].x).toBeCloseTo(44);
    expect(g.plotted[g.plotted.length - 1].x).toBeCloseTo(588);
  });

  it("draws straight segments when curve is linear", () => {
    const g = buildChartGeometry(pts, {
      width: 600,
      height: 220,
      padding: insets,
      curve: "linear",
    });
    expect(g.linePath).not.toContain("C");
    expect((g.linePath.match(/L/g) ?? []).length).toBe(pts.length - 1);
  });

  it("spreads yTickCount ticks across the padded range", () => {
    const g = buildChartGeometry(pts, {
      width: 600,
      height: 220,
      padding: insets,
      yTickCount: 4,
      valuePadding: 0.1,
    });
    expect(g.yTicks).toHaveLength(4);
    // padded range keeps data off the plot edges
    const ys = g.plotted.map((p) => p.y);
    expect(Math.min(...ys)).toBeGreaterThan(14);
    expect(Math.max(...ys)).toBeLessThan(220 - 30);
  });
});

describe("buildXTicks", () => {
  it("returns first/last anchored ticks with short dates for short ranges", () => {
    const g = buildChartGeometry(pts, { width: 600, height: 220, padding: 24 });
    const ticks = buildXTicks(g.plotted, 5);
    expect(ticks[0].align).toBe("start");
    expect(ticks[ticks.length - 1].align).toBe("end");
    expect(ticks.length).toBeLessThanOrEqual(pts.length);
    expect(ticks[0].label).toMatch(/^[A-Z][a-z]{2} \d{1,2}$/);
  });

  it("uses Mon 'YY labels for long ranges", () => {
    expect(formatTickDate("2025-01-06", true)).toBe("Jan '25");
  });
});

describe("pointsInRange", () => {
  const now = new Date("2026-06-15T12:00:00Z");

  it("keeps everything for MAX", () => {
    expect(pointsInRange(pts, "MAX", now)).toEqual(pts);
  });

  it("keeps only points inside the last N months", () => {
    // 3M back from Jun 15 is Mar 15: Mar 23 and May 25 stay, Jan 19 goes.
    expect(pointsInRange(pts, "3M", now).map((p) => p.date)).toEqual([
      "2026-03-23",
      "2026-05-25",
    ]);
  });
});

describe("sampleLine dates", () => {
  it("reads the same calendar day in every timezone", () => {
    const plotted = [
      { ...pts[0], x: 0, y: 0 },
      { ...pts[1], x: 100, y: 0 },
    ];
    expect(sampleLine(plotted, 0)?.date).toBe("2026-01-19");
  });
});

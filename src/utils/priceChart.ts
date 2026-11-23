import { formatUsd } from "./money";

export interface ChartPoint {
  value: number;
  date: string; // YYYY-MM-DD
  week: string; // e.g. "2026-W22"
}

export interface PlottedPoint extends ChartPoint {
  x: number;
  y: number;
}

export interface YTick {
  y: number;
  label: string;
}

export interface ChartGeometry {
  linePath: string;
  areaPath: string;
  plotted: PlottedPoint[];
  yTicks: YTick[];
  min: number;
  max: number;
}

export interface ChartInsets {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface ChartDims {
  width: number;
  height: number;
  padding: number | ChartInsets;
  curve?: "smooth" | "linear";
  yTickCount?: number;
  valuePadding?: number;
}

export interface XTick {
  x: number;
  label: string;
  align: "start" | "middle" | "end";
}

function toInsets(padding: number | ChartInsets): ChartInsets {
  return typeof padding === "number"
    ? { top: padding, right: padding, bottom: padding, left: padding }
    : padding;
}

function formatChartPrice(value: number): string {
  return formatUsd(value, { cents: false });
}

export interface LineSample {
  x: number;
  value: number;
  date: string;
}

export function sampleLine(
  plotted: PlottedPoint[],
  x: number,
): LineSample | null {
  if (plotted.length === 0) return null;
  const first = plotted[0];
  const last = plotted[plotted.length - 1];
  if (plotted.length === 1) {
    return { x: first.x, value: first.value, date: first.date };
  }

  const cx = Math.min(Math.max(x, first.x), last.x);
  let i = 0;
  while (i < plotted.length - 2 && plotted[i + 1].x < cx) i++;
  const a = plotted[i];
  const b = plotted[i + 1];
  const span = b.x - a.x || 1;
  const t = (cx - a.x) / span;

  const value = a.value + (b.value - a.value) * t;
  const da = new Date(`${a.date}T00:00:00Z`).getTime();
  const db = new Date(`${b.date}T00:00:00Z`).getTime();
  const date = new Date(da + (db - da) * t).toISOString().slice(0, 10);

  return { x: cx, value, date };
}

const RANGE_MONTHS: Record<string, number> = { "3M": 3, "6M": 6, "12M": 12 };

export function pointsInRange(
  points: ChartPoint[],
  range: string,
  now: Date = new Date(),
): ChartPoint[] {
  const months = RANGE_MONTHS[range];
  if (!months) return points;
  const from = new Date(now);
  from.setMonth(from.getMonth() - months);
  const cutoff = from.toISOString().slice(0, 10);
  return points.filter((p) => p.date >= cutoff);
}

export interface PriceSummary {
  current: number;
  first: number;
  changeAbs: number;
  changePct: number;
}

export function summarizePoints(points: ChartPoint[]): PriceSummary | null {
  if (points.length === 0) return null;
  const first = points[0].value;
  const current = points[points.length - 1].value;
  const changeAbs = current - first;
  const changePct = first !== 0 ? (changeAbs / first) * 100 : 0;
  return { current, first, changeAbs, changePct };
}

function linearPath(pts: PlottedPoint[]): string {
  return pts
    .map((p, i) => `${i ? "L" : "M"}${p.x.toFixed(2)} ${p.y.toFixed(2)}`)
    .join(" ");
}

function smoothPath(pts: PlottedPoint[]): string {
  if (pts.length === 0) return "";
  const head = `M${pts[0].x.toFixed(2)} ${pts[0].y.toFixed(2)}`;
  if (pts.length === 1) return head;

  let d = head;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C${cp1x.toFixed(2)} ${cp1y.toFixed(2)} ${cp2x.toFixed(2)} ${cp2y.toFixed(2)} ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
  }
  return d;
}

export function buildChartGeometry(
  points: ChartPoint[],
  {
    width,
    height,
    padding,
    curve = "smooth",
    yTickCount,
    valuePadding = 0,
  }: ChartDims,
): ChartGeometry {
  const inset = toInsets(padding);
  const values = points.map((p) => p.value);
  const min = values.length ? Math.min(...values) : 0;
  const max = values.length ? Math.max(...values) : 0;
  const pad = (max - min) * valuePadding;
  const lo = min - pad;
  const hi = max + pad;
  const span = hi - lo;

  const plotW = width - inset.left - inset.right;
  const plotH = height - inset.top - inset.bottom;
  const baseline = height - inset.bottom;

  const xFor = (i: number): number => {
    if (points.length <= 1) return inset.left;
    return inset.left + (plotW * i) / (points.length - 1);
  };
  const yFor = (value: number): number => {
    if (span === 0) return inset.top + plotH / 2;
    return inset.top + plotH * (1 - (value - lo) / span);
  };

  const plotted: PlottedPoint[] = points.map((p, i) => ({
    ...p,
    x: xFor(i),
    y: yFor(p.value),
  }));

  const linePath =
    curve === "linear" ? linearPath(plotted) : smoothPath(plotted);

  const areaPath = plotted.length
    ? `${linePath} L${plotted[plotted.length - 1].x.toFixed(2)} ${baseline.toFixed(
        2,
      )} L${plotted[0].x.toFixed(2)} ${baseline.toFixed(2)} Z`
    : "";

  let yTicks: YTick[];
  if (span === 0) {
    yTicks = [{ y: inset.top + plotH / 2, label: formatChartPrice(max) }];
  } else if (yTickCount && yTickCount >= 2) {
    yTicks = Array.from({ length: yTickCount }, (_, k) => {
      const v = lo + (span * k) / (yTickCount - 1);
      return { y: yFor(v), label: formatChartPrice(v) };
    });
  } else {
    yTicks = [
      { y: yFor(max), label: formatChartPrice(max) },
      {
        y: yFor(min + (max - min) / 2),
        label: formatChartPrice(min + (max - min) / 2),
      },
      { y: yFor(min), label: formatChartPrice(min) },
    ];
  }

  return { linePath, areaPath, plotted, yTicks, min, max };
}

export function buildXTicks(
  plotted: PlottedPoint[],
  count = 5,
  longRangeThreshold = 30,
): XTick[] {
  if (plotted.length === 0) return [];
  const long = plotted.length > longRangeThreshold;
  const n = Math.min(count, plotted.length);
  const seen = new Set<number>();
  const ticks: XTick[] = [];
  for (let k = 0; k < n; k++) {
    const i = n === 1 ? 0 : Math.round((k * (plotted.length - 1)) / (n - 1));
    if (seen.has(i)) continue;
    seen.add(i);
    const p = plotted[i];
    ticks.push({
      x: p.x,
      label: formatTickDate(p.date, long),
      align: k === 0 ? "start" : k === n - 1 ? "end" : "middle",
    });
  }
  return ticks;
}

export function formatTickDate(iso: string, long: boolean): string {
  const d = new Date(`${iso}T00:00:00`);
  if (!long) {
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }
  const month = d.toLocaleDateString("en-US", { month: "short" });
  return `${month} '${String(d.getFullYear()).slice(-2)}`;
}

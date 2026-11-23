import React, { useMemo, useState } from "react";
import {
  buildChartGeometry,
  buildXTicks,
  formatTickDate,
  sampleLine,
  type ChartPoint,
} from "@/utils/priceChart";
import { formatUsd } from "@/utils/money";

interface PriceHistoryChartProps {
  points: ChartPoint[];
}

const WIDTH = 600;
const HEIGHT = 220;
const INSETS = { top: 14, right: 12, bottom: 30, left: 44 };
const BASELINE = HEIGHT - INSETS.bottom;

const pct = (v: number, of: number) => `${(v / of) * 100}%`;

const X_ALIGN = {
  start: "none",
  middle: "translateX(-50%)",
  end: "translateX(-100%)",
} as const;

const PriceHistoryChart: React.FC<PriceHistoryChartProps> = ({ points }) => {
  const [hoverX, setHoverX] = useState<number | null>(null);

  const geo = useMemo(
    () =>
      buildChartGeometry(points, {
        width: WIDTH,
        height: HEIGHT,
        padding: INSETS,
        curve: "linear",
        yTickCount: 4,
        valuePadding: 0.1,
      }),
    [points],
  );
  const xTicks = useMemo(() => buildXTicks(geo.plotted, 5), [geo]);

  const handleMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    if (rect.width === 0) return;
    setHoverX(((e.clientX - rect.left) / rect.width) * WIDTH);
  };

  const sample = hoverX === null ? null : sampleLine(geo.plotted, hoverX);
  const tooltipText = sample
    ? `${formatUsd(sample.value)} · ${formatTickDate(sample.date, false)}`
    : "";
  const tooltipW = tooltipText.length * 6.6 + 16;

  return (
    <div className="bg-mainBg border-bevelShadow2 relative border">
      <svg
        key={`${points.length}-${points[0]?.date ?? ""}`}
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="anim-draw block h-auto w-full overflow-visible"
        role="img"
        aria-label="Weekly average price history"
        onMouseMove={handleMove}
        onMouseLeave={() => setHoverX(null)}
      >
        {geo.yTicks.map((tick, i) => (
          <line
            key={`y${i}`}
            x1={INSETS.left}
            x2={WIDTH - INSETS.right}
            y1={tick.y}
            y2={tick.y}
            className="stroke-bevelShadow2"
            strokeDasharray="3 3"
            strokeWidth={1}
            vectorEffect="non-scaling-stroke"
          />
        ))}
        {xTicks.map((tick, i) => (
          <line
            key={`x${i}`}
            x1={tick.x}
            x2={tick.x}
            y1={BASELINE + 2}
            y2={BASELINE + 6}
            className="stroke-mutedLabel"
            strokeWidth={1}
            vectorEffect="non-scaling-stroke"
          />
        ))}

        {geo.areaPath && (
          <path d={geo.areaPath} className="fill-accentGreen/10" />
        )}
        <path
          d={geo.linePath}
          fill="none"
          className="stroke-accentGreen"
          strokeWidth={2}
          strokeLinejoin="miter"
          vectorEffect="non-scaling-stroke"
        />

        {sample && (
          <g pointerEvents="none">
            <line
              x1={sample.x}
              x2={sample.x}
              y1={INSETS.top}
              y2={BASELINE}
              className="stroke-accentAmber/60"
              strokeWidth={1}
              strokeDasharray="3 2"
            />
            <rect
              x={sample.x - tooltipW / 2}
              y={4}
              width={tooltipW}
              height={22}
              className="fill-windowBg stroke-accentAmber"
              strokeWidth={1}
            />
            <text
              x={sample.x}
              y={19}
              textAnchor="middle"
              className="fill-primaryText font-mono text-[11px] font-bold"
            >
              {tooltipText}
            </text>
          </g>
        )}
      </svg>

      <div
        aria-hidden
        className="font-display text-secondaryText pointer-events-none absolute inset-0 text-[10px] leading-none"
      >
        {geo.yTicks.map((tick, i) => (
          <span
            key={`yl${i}`}
            className="absolute left-1.5 -translate-y-1/2"
            style={{ top: pct(tick.y, HEIGHT) }}
          >
            {tick.label}
          </span>
        ))}
        {xTicks.map((tick, i) => (
          <span
            key={`xl${i}`}
            className={`absolute bottom-1.25 whitespace-nowrap ${
              tick.align === "middle" && i % 2 === 1 ? "max-sm:hidden" : ""
            }`}
            style={{ left: pct(tick.x, WIDTH), transform: X_ALIGN[tick.align] }}
          >
            {tick.label}
          </span>
        ))}
      </div>
    </div>
  );
};

export default PriceHistoryChart;

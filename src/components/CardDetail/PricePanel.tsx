import React, { useMemo } from "react";
import { Tile, SegmentedControl, SectionHeading } from "@/components/ui";
import type { PriceRange } from "@/hooks/usePriceHistory";
import {
  pointsInRange,
  summarizePoints,
  type ChartPoint,
} from "@/utils/priceChart";
import { formatUsd } from "@/utils/money";
import PriceHistoryChart from "./PriceHistoryChart";

const PRICE_RANGES: {
  value: PriceRange;
  label: string;
  period: string;
}[] = [
  { value: "3M", label: "3M", period: "past 3M" },
  { value: "6M", label: "6M", period: "past 6M" },
  { value: "12M", label: "1Y", period: "past 1Y" },
  { value: "MAX", label: "MAX", period: "all time" },
];

interface PricePanelProps {
  label: string;
  rangeAriaLabel: string;
  range: PriceRange;
  onRange: (r: PriceRange) => void;
  points: ChartPoint[];
  isLoading: boolean;
  error: boolean;
  fallbackAverage?: number;
  sales: React.ReactNode;
}

const EmptyChart: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="border-bevelShadow2 text-secondaryText flex min-h-30 flex-1 flex-col items-center justify-center gap-1 border border-dashed p-4 text-center text-sm">
    {children}
  </div>
);

const PricePanel: React.FC<PricePanelProps> = ({
  label,
  rangeAriaLabel,
  range,
  onRange,
  points: allPoints,
  isLoading,
  error,
  fallbackAverage,
  sales,
}) => {
  const points = useMemo(
    () => pointsInRange(allPoints, range),
    [allPoints, range],
  );
  const hasChart = points.length >= 2;
  const hasHistory = allPoints.length >= 2;
  const summary = useMemo(() => summarizePoints(points), [points]);
  const periodLabel =
    PRICE_RANGES.find((r) => r.value === range)?.period ?? "the period";
  const up = (summary?.changeAbs ?? 0) >= 0;

  return (
    <section className="flex flex-col gap-3.5">
      <SectionHeading
        label={label}
        action={
          hasHistory && (
            <SegmentedControl
              ariaLabel={rangeAriaLabel}
              options={PRICE_RANGES.map(({ value, label: l }) => ({
                value,
                label: l,
              }))}
              value={range}
              onChange={onRange}
            />
          )
        }
      >
        価格
      </SectionHeading>

      <Tile className="grid gap-6 p-5 md:grid-cols-[minmax(0,1fr)_230px]">
        <div className="flex min-w-0 flex-col gap-3">
          {summary && (
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="font-display text-primaryText text-[22px]">
                {formatUsd(summary.current)}
              </span>
              {hasChart && (
                <>
                  <span
                    className={`text-[13px] font-bold ${
                      up ? "text-accentGreen" : "text-accentPink"
                    }`}
                  >
                    {up ? "▲" : "▼"} {formatUsd(Math.abs(summary.changeAbs))} (
                    {summary.changePct >= 0 ? "+" : ""}
                    {summary.changePct.toFixed(1)}%)
                  </span>
                  <span className="text-secondaryText text-xs">
                    {periodLabel}
                  </span>
                </>
              )}
            </div>
          )}

          {error && !hasChart ? (
            <EmptyChart>
              <span className="italic">Price history unavailable</span>
            </EmptyChart>
          ) : isLoading && allPoints.length === 0 ? (
            <div className="bg-secondaryBorder aspect-600/220 w-full animate-pulse" />
          ) : !hasChart ? (
            <EmptyChart>
              <span className="italic">
                {hasHistory
                  ? `Not enough sales in the ${periodLabel} to chart`
                  : "Not enough history to chart yet"}
              </span>
              {typeof fallbackAverage === "number" && fallbackAverage > 0 && (
                <span className="font-display text-primaryText">
                  Current avg {formatUsd(fallbackAverage)}
                </span>
              )}
            </EmptyChart>
          ) : (
            <PriceHistoryChart points={points} />
          )}
        </div>

        <div className="border-bevelShadow2 flex flex-col md:border-l md:border-dashed md:pl-6">
          {sales}
        </div>
      </Tile>
    </section>
  );
};

export default PricePanel;

import React, { useMemo, useState } from "react";
import {
  selectChartPoints,
  isPricedSeries,
  type PriceRange,
} from "@/hooks/usePriceHistory";
import { usePackPrice, usePackPriceHistory } from "@/hooks/usePackPrices";
import PricePanel from "./PricePanel";
import PriceStatsTable from "./PriceStatsTable";

interface PackPriceLogPanelProps {
  setId: string;
  seriesShortName: string;
  packAveragePrice?: number;
}

const PackPriceLogPanel: React.FC<PackPriceLogPanelProps> = ({
  setId,
  seriesShortName,
  packAveragePrice,
}) => {
  const [range, setRange] = useState<PriceRange>("MAX");
  const priced = isPricedSeries(seriesShortName);
  const {
    data: history,
    isLoading,
    error: historyError,
  } = usePackPriceHistory(setId, seriesShortName);
  const {
    data: current,
    isLoading: currentLoading,
    error: currentError,
  } = usePackPrice(setId, seriesShortName);
  const points = useMemo(() => selectChartPoints(history ?? []), [history]);
  const lastKnownPrice =
    packAveragePrice && packAveragePrice > 0
      ? packAveragePrice
      : points.at(-1)?.value;

  if (!priced) return null;

  return (
    <PricePanel
      label="Pack price"
      rangeAriaLabel="Pack price history range"
      range={range}
      onRange={setRange}
      points={points}
      isLoading={isLoading && !history}
      error={!!historyError}
      fallbackAverage={current?.average_price ?? undefined}
      sales={
        <PriceStatsTable
          data={current ?? null}
          isLoading={currentLoading && !current}
          error={!!currentError}
          priced={priced}
          lastKnownPrice={lastKnownPrice}
        />
      }
    />
  );
};

export default PackPriceLogPanel;

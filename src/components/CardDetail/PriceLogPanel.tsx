import React, { useMemo, useState } from "react";
import { SectionHeading, Tile } from "@/components/ui";
import {
  usePriceHistory,
  selectChartPoints,
  isPricedSeries,
  type PriceRange,
} from "@/hooks/usePriceHistory";
import PricePanel from "./PricePanel";
import PriceTable from "./PriceTable";

interface PriceLogPanelProps {
  cardId: string;
  seriesShortName: string;
  averagePrice?: number;
}

const PriceLogPanel: React.FC<PriceLogPanelProps> = ({
  cardId,
  seriesShortName,
  averagePrice,
}) => {
  const [range, setRange] = useState<PriceRange>("MAX");
  const priced = isPricedSeries(seriesShortName);
  const { data, isLoading, error } = usePriceHistory(cardId, seriesShortName);
  const points = useMemo(() => selectChartPoints(data ?? []), [data]);
  const lastKnownPrice =
    averagePrice && averagePrice > 0 ? averagePrice : points.at(-1)?.value;

  if (!priced) {
    return (
      <section className="flex flex-col gap-3.5">
        <SectionHeading label="Price">価格</SectionHeading>
        <Tile className="p-5">
          <PriceTable cardId={cardId} seriesShortName={seriesShortName} />
        </Tile>
      </section>
    );
  }

  return (
    <PricePanel
      label="Price"
      rangeAriaLabel="Price history range"
      range={range}
      onRange={setRange}
      points={points}
      isLoading={isLoading && !data}
      error={!!error}
      fallbackAverage={averagePrice}
      sales={
        <PriceTable
          cardId={cardId}
          seriesShortName={seriesShortName}
          lastKnownPrice={lastKnownPrice}
        />
      }
    />
  );
};

export default PriceLogPanel;

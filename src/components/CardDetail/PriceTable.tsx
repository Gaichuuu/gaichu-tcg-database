import React from "react";
import { useEbayPrices } from "@/hooks/useEbayPrices";
import { isPricedSeries } from "@/hooks/usePriceHistory";
import PriceStatsTable from "./PriceStatsTable";

interface PriceTableProps {
  cardId: string;
  seriesShortName: string;
}

const PriceTable: React.FC<PriceTableProps> = ({ cardId, seriesShortName }) => {
  const { data, isLoading, error } = useEbayPrices(cardId, seriesShortName);
  return (
    <PriceStatsTable
      data={data ?? null}
      isLoading={isLoading}
      error={!!error}
      priced={isPricedSeries(seriesShortName)}
    />
  );
};

export default PriceTable;

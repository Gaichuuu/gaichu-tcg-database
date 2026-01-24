import React from "react";
import PriceTable from "./PriceTable";
import type { CollectionCard } from "@/types/CollectionCard";

interface PrintingsPricesPanelProps {
  card: CollectionCard;
  selectedSetIndex: number;
  onSelectSet: (index: number) => void;
}

const PrintingsPricesPanel: React.FC<PrintingsPricesPanelProps> = ({
  card,
  selectedSetIndex,
  onSelectSet,
}) => {
  const selectedSet = card.sets[selectedSetIndex];

  return (
    <div className="border-secondaryBorder bg-navBg rounded-2xl border p-4">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex flex-col">
          <span className="text-primaryText font-medium">
            {selectedSet?.name ?? "Unknown Set"}
          </span>
          <span className="text-secondaryText text-sm">
            {card.number}/{card.total_cards_count}
            {card.variant && ` · ${card.variant}`}
            {card.rarity && ` · ${card.rarity}`}
          </span>
        </div>
        {selectedSet && (
          <img
            src={selectedSet.image}
            alt={selectedSet.name}
            className="h-auto max-w-24 rounded shadow"
          />
        )}
      </div>

      {card.sets.length > 1 && (
        <>
          <div className="border-secondaryBorder my-4 border-t" />

          <h4 className="text-secondaryText mb-2 text-xs font-medium uppercase tracking-wide">
            Printings
          </h4>
          <div className="space-y-1">
            {card.sets.map((set, index) => {
              const isSelected = index === selectedSetIndex;
              return (
                <button
                  key={`${set.name}-${index}`}
                  onClick={() => onSelectSet(index)}
                  className={`w-full rounded px-2 py-1.5 text-left text-sm transition ${
                    isSelected
                      ? "bg-primaryButton/10 ring-1 ring-primaryBorder"
                      : "hover:bg-secondaryBorder/30"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {isSelected && (
                      <span className="text-primaryBorder text-xs">▶</span>
                    )}
                    <span
                      className={
                        isSelected ? "text-primaryText" : "text-secondaryText"
                      }
                    >
                      {set.name}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </>
      )}

      <div className="border-secondaryBorder my-4 border-t" />

      <PriceTable cardId={card.id} seriesShortName={card.series_short_name} />
    </div>
  );
};

export default PrintingsPricesPanel;

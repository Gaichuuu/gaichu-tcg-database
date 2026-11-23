import React from "react";

export interface Chip {
  key: string;
  label: string;
  onClear: () => void;
}

interface FilterChipsProps {
  chips: Chip[];
}

const FilterChips: React.FC<FilterChipsProps> = ({ chips }) => {
  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {chips.map((chip) => (
        <button
          key={chip.key}
          type="button"
          onClick={chip.onClear}
          aria-label={`Clear ${chip.label}`}
          className="border-mutedLabel text-primaryText hover:border-hoverBorder focus-visible:border-hoverBorder inline-flex items-center gap-2 border px-2 py-0.75 text-[11px] font-bold transition-colors outline-none"
        >
          {chip.label}
          <span className="text-secondaryText" aria-hidden>
            ✕
          </span>
        </button>
      ))}
    </div>
  );
};

export default FilterChips;

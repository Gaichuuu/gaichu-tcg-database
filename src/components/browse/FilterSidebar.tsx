import React from "react";
import { Tile, SegmentedControl, Button } from "@/components/ui";
import type { SetAndCard } from "@/types/MergedCollection";
import type { SortKey } from "@/utils/cardFilters";

interface FilterSidebarProps {
  sets: SetAndCard[];
  selectedSetIds: string[];
  onToggleSet: (setId: string) => void;
  variants: string[];
  variant: string | null;
  onVariant: (v: string | null) => void;
  rarities: string[];
  rarity: string | null;
  onRarity: (v: string | null) => void;
  minPrice: number | null;
  maxPrice: number | null;
  onMinPrice: (n: number | null) => void;
  onMaxPrice: (n: number | null) => void;
  sort: SortKey;
  onSort: (s: SortKey) => void;
  q: string;
  onQ: (q: string) => void;
  onReset: () => void;
}

const insetClasses =
  "bg-insetBg border-tileBorder border-2 shadow-[inset_2px_2px_0_rgba(0,0,0,0.7)]";
const fieldClasses = `${insetClasses} text-primaryText w-full min-w-0 px-2 py-1.25 text-[13px] outline-none focus-visible:border-hoverBorder`;

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "number", label: "Set & card number" },
  { value: "name-asc", label: "Name (A→Z)" },
  { value: "name-desc", label: "Name (Z→A)" },
  { value: "price-asc", label: "Price (low→high)" },
  { value: "price-desc", label: "Price (high→low)" },
];

const Label: React.FC<{ en: string; ja: string; htmlFor?: string }> = ({
  en,
  ja,
  htmlFor,
}) => {
  const content = (
    <>
      <span className="sr-only">{en}</span>
      <span className="font-jp text-accentAmber text-xs" lang="ja" aria-hidden>
        {ja}
      </span>
    </>
  );
  return htmlFor ? (
    <label htmlFor={htmlFor} className="flex items-baseline gap-2">
      {content}
    </label>
  ) : (
    <h2 className="flex items-baseline gap-2">{content}</h2>
  );
};

const Divider: React.FC = () => (
  <div className="border-bevelShadow2 border-t border-dashed" aria-hidden />
);

const Group: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex flex-col gap-2">{children}</div>
);

const SetCheckbox: React.FC<{
  checked: boolean;
  onChange: () => void;
  label: string;
  count?: number;
}> = ({ checked, onChange, label, count }) => (
  <label className="has-focus-visible:ring-primaryBorder hover:bg-rowHover flex cursor-pointer items-center gap-2.5 px-1.5 py-1.25 has-focus-visible:ring-2">
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      className="sr-only"
    />
    <span
      aria-hidden
      className="border-mutedLabel bg-insetBg grid size-3.5 shrink-0 place-items-center border-2"
    >
      {checked && <span className="bg-accentGreen size-1.5" />}
    </span>
    <span
      className={`min-w-0 flex-1 truncate text-[13.5px] ${
        checked ? "text-primaryText" : "text-secondaryText"
      }`}
    >
      {label}
    </span>
    {count != null && (
      <span className="text-mutedLabel font-display text-[10px]">{count}</span>
    )}
  </label>
);

const FilterSidebar: React.FC<FilterSidebarProps> = ({
  sets,
  selectedSetIds,
  onToggleSet,
  variants,
  variant,
  onVariant,
  rarities,
  rarity,
  onRarity,
  minPrice,
  maxPrice,
  onMinPrice,
  onMaxPrice,
  sort,
  onSort,
  q,
  onQ,
  onReset,
}) => {
  const toOptions = (values: string[]) => [
    { value: "", label: "All" },
    ...values.map((v) => ({ value: v, label: v })),
  ];
  const parsePrice = (v: string): number | null => {
    if (v === "") return null;
    const n = Number(v);
    return Number.isFinite(n) && n >= 0 ? n : null;
  };

  return (
    <Tile className="flex flex-col gap-4.5 p-4.5 lg:sticky lg:top-17.5">
      <Group>
        <Label en="Sets" ja="セット" />
        <div className="flex flex-col gap-0.5">
          {sets.map(({ set, cards }) => (
            <SetCheckbox
              key={set.id}
              checked={selectedSetIds.includes(set.id)}
              onChange={() => onToggleSet(set.id)}
              label={set.name}
              count={cards.length}
            />
          ))}
        </div>
      </Group>

      {(variants.length >= 2 || rarities.length >= 2) && <Divider />}

      {variants.length >= 2 && (
        <Group>
          <Label en="Variant" ja="種類" />
          <SegmentedControl
            ariaLabel="variant filter"
            options={toOptions(variants)}
            value={variant ?? ""}
            onChange={(v) => onVariant(v || null)}
          />
        </Group>
      )}

      {rarities.length >= 2 && (
        <Group>
          <Label en="Rarity" ja="レア度" />
          <SegmentedControl
            ariaLabel="rarity filter"
            options={toOptions(rarities)}
            value={rarity ?? ""}
            onChange={(v) => onRarity(v || null)}
          />
        </Group>
      )}

      <Divider />

      <Group>
        <Label en="Price" ja="価格" />
        <div className="flex items-center gap-2">
          <input
            type="text"
            inputMode="numeric"
            value={minPrice ?? ""}
            onChange={(e) => onMinPrice(parsePrice(e.target.value))}
            placeholder="$ min"
            aria-label="minimum price"
            className={`${fieldClasses} font-display placeholder:text-mutedLabel`}
          />
          <span className="text-mutedLabel" aria-hidden>
            –
          </span>
          <input
            type="text"
            inputMode="numeric"
            value={maxPrice ?? ""}
            onChange={(e) => onMaxPrice(parsePrice(e.target.value))}
            placeholder="$ max"
            aria-label="maximum price"
            className={`${fieldClasses} font-display placeholder:text-mutedLabel`}
          />
        </div>
      </Group>

      <Group>
        <Label en="Sort" ja="並び替え" htmlFor="filter-sort" />
        <select
          id="filter-sort"
          value={sort}
          onChange={(e) => onSort(e.target.value as SortKey)}
          className={fieldClasses}
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </Group>

      <Group>
        <Label en="Find" ja="検索" htmlFor="filter-find" />
        <div
          className={`${insetClasses} has-focus-visible:border-hoverBorder flex items-center gap-2 px-2.5 py-1.25`}
        >
          <span
            className="text-accentGreen font-display font-bold select-none"
            aria-hidden
          >
            /
          </span>
          <input
            id="filter-find"
            type="text"
            value={q}
            onChange={(e) => onQ(e.target.value)}
            placeholder="name..."
            className="text-accentGreen placeholder:text-accentGreen/45 font-display min-w-0 flex-1 bg-transparent text-[13px] outline-none"
          />
        </div>
      </Group>

      <Button onClick={onReset} className="w-full">
        ↺ Reset all
      </Button>
    </Tile>
  );
};

export default FilterSidebar;

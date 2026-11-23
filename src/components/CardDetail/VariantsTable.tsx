import React from "react";
import { Tile, SectionHeading } from "@/components/ui";
import { formatUsd } from "@/utils/money";
import { t, useLocale } from "@/i18n";
import { isHolo } from "@/utils/cardVariants";
import { isPlaceholderImage } from "@/utils/cardImage";
import type { CollectionCard } from "@/types/CollectionCard";
import { cdnResized, CDN_WIDTH } from "@/utils/cdnImage";

interface VariantsTableProps {
  variants: CollectionCard[];
  currentCardId: string;
  onSelect: (card: CollectionCard) => void;
}

const thumbForCard = (card: CollectionCard): string | null => {
  const raw = card.thumb || card.image;
  return isPlaceholderImage(raw) ? null : raw;
};

const VariantRow: React.FC<{
  card: CollectionCard;
  cardName: string;
  current: boolean;
  onSelect: (card: CollectionCard) => void;
}> = ({ card, cardName, current, onSelect }) => {
  const holo = isHolo(card);
  const variantLabel = card.variant ?? "Normal";
  const hasPrice = card.average_price != null && card.average_price > 0;
  const thumb = thumbForCard(card);
  const setTag = `${card.set_short_name.toUpperCase()} · ${card.number}`;

  const inner = (
    <>
      {thumb ? (
        <img
          src={cdnResized(thumb, CDN_WIDTH.thumb)}
          alt=""
          loading="lazy"
          className="border-secondaryBorder h-14 w-auto shrink-0 rounded-[3px] border"
        />
      ) : (
        <span className="bg-tileBg/40 border-secondaryBorder h-14 w-10 shrink-0 rounded-[3px] border" />
      )}
      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="text-primaryText truncate text-sm font-bold">
          {cardName}
        </span>
        <span className="flex flex-wrap items-center gap-2">
          <span
            className={`text-[11px] font-bold ${
              holo ? "text-accentCyan" : "text-secondaryText"
            }`}
          >
            {variantLabel}
          </span>
          {card.rarity && (
            <span className="border-mutedLabel text-secondaryText border px-1.5 py-px text-[10px] tracking-[0.06em] uppercase">
              {card.rarity}
            </span>
          )}
          <span className="font-display text-secondaryText text-[10px]">
            {setTag}
          </span>
        </span>
      </span>
      <span
        className={`font-display shrink-0 text-[15px] ${
          hasPrice ? "text-primaryText" : "text-mutedLabel"
        }`}
      >
        {hasPrice ? formatUsd(card.average_price as number) : "N/A"}
      </span>
    </>
  );

  const base = "flex w-full items-center gap-3.5 px-3 py-2.5 text-left";

  if (current) {
    return (
      <div aria-current="true" className={`${base} bg-accentCyan/8`}>
        {inner}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => onSelect(card)}
      className={`${base} hover:bg-rowHover focus-visible:bg-rowHover cursor-pointer transition-colors focus-visible:outline-none`}
    >
      {inner}
    </button>
  );
};

const VariantsTable: React.FC<VariantsTableProps> = ({
  variants,
  currentCardId,
  onSelect,
}) => {
  const { locale } = useLocale();

  return (
    <section className="flex flex-col gap-3.5">
      <SectionHeading label="Variants">バリエーション</SectionHeading>
      <Tile className="flex flex-col p-1.5">
        {variants.map((card) => (
          <VariantRow
            key={card.id}
            card={card}
            cardName={t(card.name, locale)}
            current={card.id === currentCardId}
            onSelect={onSelect}
          />
        ))}
      </Tile>
    </section>
  );
};

export default VariantsTable;

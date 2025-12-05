// src/components/ButtonComponents/CardDetailPagingButton.tsx
import React from "react";
import { RiArrowDropLeftLine, RiArrowDropRightLine } from "react-icons/ri";
import { CollectionCard } from "@/types/CollectionCard";
import { useLocale, t } from "@/i18n/locale";

type ButtonAction = {
  pagingType: PagingType;
  card?: CollectionCard;
  onClick: () => void;
  className?: string;
};

export enum PagingType {
  Previous = "Previous",
  Next = "Next",
}

const CardDetailPagingButton: React.FC<ButtonAction> = ({
  pagingType,
  card,
  onClick,
  className = "",
}) => {
  const isPrev = pagingType === PagingType.Previous;
  const { locale } = useLocale();
  const label = card ? t(card.name, locale) : "";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!card}
      aria-label={`${pagingType}: ${label}`}
      title={`${pagingType}: ${label}`}
      className={`${className} inline-flex flex-1 cursor-pointer flex-col items-center bg-transparent p-0 transition-transform duration-200 hover:scale-110 disabled:cursor-not-allowed disabled:opacity-60`}
    >
      <span className="inline-flex items-center space-x-1">
        {isPrev && <RiArrowDropLeftLine size={20} />}
        <span className="max-w-30 truncate">{label}</span>
        {!isPrev && <RiArrowDropRightLine size={20} />}
      </span>

      {card?.thumb && (
        <img
          src={card.thumb}
          alt={label}
          className="border-secondaryBorder mt-1 max-h-8 rounded-full border object-contain"
        />
      )}
    </button>
  );
};

export default CardDetailPagingButton;

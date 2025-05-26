import React from "react";
import { RiArrowDropLeftLine, RiArrowDropRightLine } from "react-icons/ri";
import { CollectionCard } from "../../types/CollectionCard";

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

  return (
    <button
      onClick={onClick}
      className={` ${className} /* allows parent to do */ inline-flex flex-1 cursor-pointer flex-col items-center bg-transparent p-0 transition-transform duration-200 hover:scale-110`}
    >
      <span className="text-primaryText hover:text-hoverText inline-flex items-center space-x-1">
        {isPrev && <RiArrowDropLeftLine size={20} />}
        <span className="max-w-30 truncate">{card?.name}</span>
        {!isPrev && <RiArrowDropRightLine size={20} />}
      </span>
      {card?.thumb && (
        <img
          src={card.thumb}
          alt={card.name}
          className="mt-1 max-h-[32px] rounded-full object-contain"
        />
      )}
    </button>
  );
};

export default CardDetailPagingButton;

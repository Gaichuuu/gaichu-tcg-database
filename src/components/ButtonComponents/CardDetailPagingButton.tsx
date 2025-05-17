import React from "react";
import { CollectionCard } from "../../types/CollectionCard";

type ButtonAction = {
  pagingType: PagingType;
  card: CollectionCard;
  onClick: () => void;
};

export enum PagingType {
  Previous = "Previous",
  Next = "Next",
}
const PagingTitle: Record<PagingType, string> = {
  [PagingType.Previous]: "<",
  [PagingType.Next]: ">",
};

const CardDetailPagingButton: React.FC<ButtonAction> = ({
  pagingType,
  card,
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      className="rounded bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700"
    >
      {pagingType === PagingType.Previous
        ? `${PagingTitle[pagingType]} ${card.name}`
        : `${card.name} ${PagingTitle[pagingType]}`}

      <img
        src={card?.image}
        alt={card?.name}
        className="mb-4 block max-h-[100px] rounded-3xl object-contain shadow"
      />
    </button>
  );
};

export default CardDetailPagingButton;

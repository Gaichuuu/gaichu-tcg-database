import React from "react";
import { TileModel } from "./TileModel";

const CardsListTile: React.FC<TileModel> = ({ children, onClick }) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClick?.(e as unknown as React.MouseEvent<HTMLDivElement>);
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      className="flex cursor-pointer items-center justify-center rounded-lg p-0.5 shadow-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
    >
      {children}
    </div>
  );
};

export default CardsListTile;

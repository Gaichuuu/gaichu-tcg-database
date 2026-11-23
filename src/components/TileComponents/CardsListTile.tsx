import React from "react";
import { TileModel } from "./TileModel";

const CardsListTile: React.FC<TileModel> = ({ children, onClick, style }) => {
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
      style={style}
      className="group flex min-w-0 cursor-pointer flex-col outline-none"
    >
      {children}
    </div>
  );
};

export default CardsListTile;

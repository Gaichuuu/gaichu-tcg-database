import React from "react";
import { TileModel } from "./TileModel";

const Tile: React.FC<TileModel> = ({ children, onClick }) => {
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
      className="group bg-tileBg border-primaryBorder hover:border-hoverBorder flex cursor-pointer items-center justify-center rounded-lg border p-4 shadow-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
    >
      {children}
    </div>
  );
};

export default Tile;

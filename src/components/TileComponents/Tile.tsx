// src/components/Tile.tsx
import React from "react";
import { TileModel } from "./TileModel";

const Tile: React.FC<TileModel> = ({ children, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="bg-tileBg border-primaryBorder hover:border-hoverBorder flex cursor-pointer items-center justify-center rounded-lg border p-4 shadow-lg transition-colors"
    >
      {children}
    </div>
  );
};

export default Tile;

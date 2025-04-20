import React from "react";
import { TileModel } from "./TileModel";

const CardsListTile: React.FC<TileModel> = ({ children, onClick }) => {
  return (
    <div
      onClick={onClick}
       className="flex cursor-pointer items-center justify-center rounded-lg  p-1 shadow-lg transition-colors"
    >
      {children}
    </div>
  );
};

export default CardsListTile;

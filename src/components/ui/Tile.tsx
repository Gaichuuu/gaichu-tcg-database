import React from "react";

export interface TileProps {
  className?: string;
  children: React.ReactNode;
}

export const Tile: React.FC<TileProps> = ({ className = "", children }) => (
  <div className={`tile ${className}`}>{children}</div>
);

export default Tile;

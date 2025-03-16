// src/components/Tile.tsx
import React from 'react';

interface TileProps {
  children: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
}

const Tile: React.FC<TileProps> = ({ children, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="bg-gray-700 border border-[#646cff] rounded-lg shadow-lg cursor-pointer hover:border-gray-300 transition-colors flex items-center justify-center p-4"
    >
      {children}
    </div>
  );
};

export default Tile;

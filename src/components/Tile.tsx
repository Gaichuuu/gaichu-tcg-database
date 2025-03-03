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
      className="bg-gray-700 border border-gray-500 rounded-lg shadow-lg cursor-pointer transition duration-200 hover:border-blue-400 flex items-center justify-center p-4"
    >
      {children}
    </div>
  );
};

export default Tile;

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
      className="
        bg-gray-700
        rounded-lg
        shadow
        cursor-pointer
        transition
        duration-200
        hover:shadow-lg
        flex
        items-center
        justify-center
        p-4
      "
      style={{ minHeight: '150px' }}
    >
      {children}
    </div>
  );
};

export default Tile;

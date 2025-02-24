// src/components/Tile.jsx
import React from 'react';

const Tile = ({ children, onClick }) => {
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

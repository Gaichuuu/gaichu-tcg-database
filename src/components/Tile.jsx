// src/components/Tile.jsx
import React from 'react';

const Tile = ({ children, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow p-4 cursor-pointer hover:shadow-md transition duration-200"
    >
      {children}
    </div>
  );
};

export default Tile;

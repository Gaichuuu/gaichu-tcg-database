// src/pages/TcgSeriesPage.jsx
import React from 'react';
import Tile from '../components/Tile';
import { useNavigate } from 'react-router-dom';

const seriesData = [
  { id: 'magic', name: 'Magic: The Gathering' },
  { id: 'pokemon', name: 'Pokémon TCG' },
  // add more series as needed
];

const TcgSeriesPage = () => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold mb-8 text-center">
        Trading Card Game Series
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {seriesData.map((series) => (
          <Tile key={series.id} onClick={() => navigate(`/cards/${series.id}`)}>
            <div className="p-4 text-center">
              <h3 className="text-xl font-semibold">{series.name}</h3>
            </div>
          </Tile>
        ))}
      </div>
    </div>
  );
};

export default TcgSeriesPage;

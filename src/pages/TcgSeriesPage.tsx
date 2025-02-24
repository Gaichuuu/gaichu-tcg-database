// src/pages/TcgSeriesPage.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Tile from '../components/Tile';

interface SeriesData {
  id: string;
  name: string;
  logo: string;
}

const seriesData: SeriesData[] = [
  { 
    id: 'disgruntled', 
    name: 'Disgruntled Games', 
    logo: '/images/logo.png' 
  },
  { 
    id: 'brainwash', 
    name: 'Brainwash TCG', 
    logo: '/images/logo.png' 
  },
  // add more series as needed
];

const TcgSeriesPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold mb-8 text-center">
        Trading Card Game Series
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {seriesData.map((series) => (
          <Tile
            key={series.id}
            onClick={() => navigate(`/cards/${series.id}`)}
          >
            <div className="flex flex-col items-center justify-center h-full">
              <img
                src={series.logo}
                alt={series.name}
                className="max-h-20 object-contain mb-4"
              />
              <h3 className="text-lg font-semibold text-white">
                {series.name}
              </h3>
            </div>
          </Tile>
        ))}
      </div>
    </div>
  );
};

export default TcgSeriesPage;
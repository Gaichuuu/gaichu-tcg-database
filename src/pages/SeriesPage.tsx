// src/pages/SeriesPage.tsx
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Tile from '../components/Tile';

interface Params extends Record<string, string | undefined> {
  seriesId?: string;
}

interface SetData {
  id: string;
  name: string;
  logo: string;
  description: string;
}

const setsData: SetData[] = [
  {
    id: 'set1',
    name: 'Set One',
    logo: '/images/wm-set1.jpg', 
    description: '70 cards',
  },
  {
    id: 'set2',
    name: 'Set Two',
    logo: '/images/wm-set2.jpg', 
    description: '50 cards',
  },
  // Add more sets as needed
];

const SeriesPage: React.FC = () => {
  const { seriesId } = useParams<Params>();
  const navigate = useNavigate();

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6">
        {seriesId} sets
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {setsData.map((set) => (
          <Tile
            key={set.id}
            onClick={() => navigate(`/cards/${seriesId}/sets/${set.id}`)}
          >
            <div className="flex flex-col items-center justify-center h-full">
              <img
                src={set.logo}
                alt={set.name}
                className="max-h-16 object-contain rounded mb-4"
              />
              <h3 className="text-lg font-semibold text-white">{set.name}</h3>
              <p className="text-white text-center">{set.description}</p>
            </div>
          </Tile>
        ))}
      </div>
    </div>
  );
};

export default SeriesPage;

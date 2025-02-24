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
}

const setsData: SetData[] = [
  { id: 'set1', name: 'Set One' },
  { id: 'set2', name: 'Set Two' },
  // Add more sets as needed
];

const SeriesPage: React.FC = () => {
  const { seriesId } = useParams<Params>();
  const navigate = useNavigate();

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-3xl font-bold text-center mb-8">
        Sets for {seriesId}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {setsData.map((set) => (
          <Tile
            key={set.id}
            onClick={() => navigate(`/cards/${seriesId}/sets/${set.id}`)}
          >
            <div className="p-4 text-center">
              <h3 className="text-xl font-semibold">{set.name}</h3>
            </div>
          </Tile>
        ))}
      </div>
    </div>
  );
};

export default SeriesPage;

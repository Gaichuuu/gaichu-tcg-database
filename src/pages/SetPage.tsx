// src/pages/SetPage.tsx
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Tile from '../components/Tile';

interface Card {
  id: string;
  name: string;
  image: string;
  description: string;
}

const dummyCards: Card[] = [
  {
    id: 'card1',
    name: 'Croco',
    image: '/images/17.jpg',
    description: '17/50',
  },
  {
    id: 'card2',
    name: 'Whammy',
    image: '/images/20.jpg',
    description: '20/50',
  },
  // Add more card objects as needed
];

interface Params extends Record<string, string | undefined> {
  seriesId?: string;
  setId?: string;
}

const SetPage: React.FC = () => {
  const { seriesId, setId } = useParams<Params>();
  const navigate = useNavigate();

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6">Cards in Set: {setId}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-8 gap-4">
        {dummyCards.map((card) => (
          <Tile
            key={card.id}
            onClick={() =>
              navigate(`/cards/${seriesId}/sets/${setId}/card/${card.id}`)
            }
          >
            <div className="flex flex-col items-center w-full">
              {/* Image with max height 400px that scales down while maintaining aspect ratio */}
              <div className="w-full mb-2">
                <img
                  src={card.image}
                  alt={card.name}
                  className="w-full max-h-[200px] rounded-lg object-contain"
                />
              </div>
              {/* Flex row for card name and description */}
              <div className="flex items-center justify-center space-x-2">
                <h3 className="text-xl font-semibold">{card.name}</h3>
                <p className="text-white">{card.description}</p>
              </div>
            </div>
          </Tile>
        ))}
      </div>
    </div>
  );
};

export default SetPage;

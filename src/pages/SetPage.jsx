// src/pages/SetPage.jsx
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Tile from '../components/Tile';

const dummyCards = [
  {
    id: 'card1',
    name: 'Card One',
    image: '/images/card1.jpg',
    description: 'A powerful card with amazing effects.',
  },
  {
    id: 'card2',
    name: 'Card Two',
    image: '/images/card2.jpg',
    description: 'This card has unique abilities and artwork.',
  },
  // Add more card objects as needed
];

const SetPage = () => {
  const { seriesId, setId } = useParams();
  const navigate = useNavigate();

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6">Cards in Set: {setId}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {dummyCards.map((card) => (
          <Tile
            key={card.id}
            onClick={() =>
              navigate(`/cards/${seriesId}/sets/${setId}/card/${card.id}`)
            }
          >
            <img
              src={card.image}
              alt={card.name}
              className="w-full h-auto rounded-md mb-4"
            />
            <h3 className="text-xl font-semibold mb-2">{card.name}</h3>
            <p className="text-gray-700">{card.description}</p>
          </Tile>
        ))}
      </div>
    </div>
  );
};

export default SetPage;

// src/pages/CardDetailPage.tsx
import React from 'react';
import { useParams } from 'react-router-dom';

interface Card {
  id: string;
  name: string;
  illustrator: string;
  image: string;
  rarity: string;
  type: string;
  setName: string;
  setLogo: string;
  description: string;
  category: string;
}

const dummyCardData: Record<string, Card> = {
  card1: {
    id: 'card1',
    name: 'Card One',
    illustrator: 'Jane Doe',
    image: '/images/temp-card.jpg',
    rarity: 'Rare',
    type: 'Spell',
    setName: 'Set One',
    setLogo: '/images/temp-set.png',
    description: 'A powerful card with amazing effects.',
    category: 'Magic',
  },
  card2: {
    id: 'card2',
    name: 'Card Two',
    illustrator: 'John Smith',
    image: '/images/temp-card.jpg',
    rarity: 'Common',
    type: 'Creature',
    setName: 'Set One',
    setLogo: '/images/temp-set.png',
    description: 'This card has unique abilities and artwork.',
    category: 'Fantasy',
  },
};

interface Params extends Record<string, string | undefined> {
  seriesId?: string;
  setId?: string;
  cardId?: string;
}

const CardDetailPage: React.FC = () => {
  const { cardId } = useParams<Params>();

  if (!cardId || !(cardId in dummyCardData)) {
    return (
      <div className="container mx-auto p-4">
        <p className="text-center text-red-600">Card not found.</p>
      </div>
    );
  }

  const card = dummyCardData[cardId];

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Left column: Card image */}
        <div className="md:w-1/2">
          <img
            src={card.image}
            alt={card.name}
            className="w-full max-h-[700px] object-contain rounded shadow"
          />
        </div>
        {/* Right column: Card details */}
        <div className="md:w-1/2">
          <h2 className="text-3xl font-bold mb-4">{card.name}</h2>
          <p className="mb-2">
            <strong>Illustrator:</strong> {card.illustrator}
          </p>
          <p className="mb-2">
            <strong>Rarity:</strong> {card.rarity}
          </p>
          <p className="mb-2">
            <strong>Type:</strong> {card.type}
          </p>
          <p className="mb-2">
            <strong>Set:</strong> {card.setName}
          </p>
          <img
            src={card.setLogo}
            alt={card.setName}
            className="w-24 rounded mb-2"
          />
          <p className="mt-4">{card.description}</p>
          <p className="mt-2">
            <strong>Category:</strong> {card.category}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CardDetailPage;

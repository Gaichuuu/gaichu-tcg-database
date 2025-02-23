// src/pages/CardDetailPage.jsx
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const dummyCardData = {
  card1: {
    id: 'card1',
    name: 'Card One',
    illustrator: 'Jane Doe',
    image: '/images/card1.jpg',
    rarity: 'Rare',
    type: 'Spell',
    setName: 'Set One',
    setLogo: '/images/setone-logo.jpg',
    description: 'A powerful card with amazing effects.',
    category: 'Magic',
  },
  card2: {
    id: 'card2',
    name: 'Card Two',
    illustrator: 'John Smith',
    image: '/images/card2.jpg',
    rarity: 'Common',
    type: 'Creature',
    setName: 'Set One',
    setLogo: '/images/setone-logo.jpg',
    description: 'This card has unique abilities and artwork.',
    category: 'Fantasy',
  },
};

const CardDetailPage = () => {
  const { seriesId, setId, cardId } = useParams();
  const navigate = useNavigate();

  const card = dummyCardData[cardId];

  if (!card) {
    return (
      <div className="container mx-auto p-4">
        <p className="text-center text-red-600">Card not found.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
      >
        Back
      </button>
      <h2 className="text-3xl font-bold mb-4">{card.name}</h2>
      <img
        src={card.image}
        alt={card.name}
        className="w-full max-w-md mx-auto rounded shadow mb-6"
      />
      <div className="space-y-3">
        <p>
          <strong>Illustrator:</strong> {card.illustrator}
        </p>
        <p>
          <strong>Rarity:</strong> {card.rarity}
        </p>
        <p>
          <strong>Type:</strong> {card.type}
        </p>
        <p>
          <strong>Set:</strong> {card.setName}
        </p>
        <img
          src={card.setLogo}
          alt={card.setName}
          className="w-24 rounded mb-2"
        />
        <p className="mt-4">{card.description}</p>
        <p>
          <strong>Category:</strong> {card.category}
        </p>
      </div>
    </div>
  );
};

export default CardDetailPage;

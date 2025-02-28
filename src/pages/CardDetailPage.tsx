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
  weakness: string;
  attack: string;
  metadata: string;
  flavor: string;
}

const dummyCardData: Record<string, Card> = {
  card1: {
    id: 'card1',
    name: 'Card One',
    illustrator: 'Naoyo Kimura',
    image: '/images/temp-card.jpg',
    rarity: '074/131 / Common',
    type: 'Colorless / 50 / Basic',
    setName: 'Set One (2025)',
    setLogo: '/images/temp-set.png',
    description: 'Ability: (Boosted Evolution) As long as this Pokemon is in the Active Spot, it can evolve during your first turn or the turn you play it.',
    weakness: 'Fx2 / / 1',
    attack: '[CC] Reckless Charge (30) This Pokemon also does 10 damage to itself.',
    metadata: 'NO. 0133 Evolution Pokemon HT: 1 WT: 14.3 lbs.',
    flavor: 'Its genetic code is irregular. It may mutate if it is exposed to radiation from element stones.',
  },
  card2: {
    id: 'card1',
    name: 'Card One',
    illustrator: 'Naoyo Kimura',
    image: '/images/temp-card.jpg',
    rarity: '074/131 / Common',
    type: 'Colorless / 50 / Basic',
    setName: 'Set One (2025)',
    setLogo: '/images/temp-set.png',
    description: 'Ability: (Boosted Evolution) As long as this Pokemon is in the Active Spot, it can evolve during your first turn or the turn you play it.',
    weakness: 'Fx2 / / 1',
    attack: '[CC] Reckless Charge (30) This Pokemon also does 10 damage to itself.',
    metadata: 'NO. 0133 Evolution Pokemon HT: 1 WT: 14.3 lbs.',
    flavor: 'Its genetic code is irregular. It may mutate if it is exposed to radiation from element stones.',
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
          <p className="mb-2"><strong>Card Number / Rarity:</strong> {card.rarity}</p>
          <p className="mb-2"><strong>Card Type / HP / Stage:</strong> {card.type}</p>
          <p className="mb-2"><strong>Metadata:</strong> {card.metadata}</p>
          <p className="mb-2"><strong>Card Text:</strong> {card.description}</p>
          <p className="mb-2"><strong>Attack:</strong> {card.attack}</p>
          <p className="mb-2"><strong>Weakness:</strong> {card.weakness}</p>
          <p className="mb-2"><strong>Illustrator:</strong> {card.illustrator}</p>
          <p className="mb-2"><strong>Flavor Text:</strong> {card.flavor}</p>
          <p className="mb-2"><strong>Set:</strong> {card.setName}</p>
          <img src={card.setLogo} alt={card.setName} className="w-24 rounded mb-2"/>
        </div>
      </div>
    </div>
  );
};

export default CardDetailPage;

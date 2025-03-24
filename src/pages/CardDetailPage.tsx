// src/pages/CardDetailPage.tsx
import React from "react";
import { useParams } from "react-router-dom";

interface Card {
  id: string;
  name: string;
  illustrator: string;
  image: string;
  rarity: string;
  hp: string;
  setName: string;
  setLogo: string;
  att1: string;
  att1Icon: string;
  att1Desc: string;
  att2: string;
  att2Icon: string;
  att2Desc: string;
  metadata: string;
  flavor: string;
}

const dummyCardData: Record<string, Card> = {
  card1: {
    id: "card1",
    name: "Croco",
    illustrator: "Alex Roh",
    image: "/images/17.jpg",
    rarity: "Common",
    hp: "25",
    setName: "17/50",
    setLogo: "/images/wm-set1.jpg",
    att1: "Bite",
    att1Icon: "/images/iconNormal.jpg",
    att1Desc: "Biting someone (30)",
    att2: "Water Gun",
    att2Icon: "/images/iconWater.jpg",
    att2Desc:
      "Take out the water gun you bought at the toy store and spray it at the other person. (40)",
    metadata: "Height .6m, Weight 9.5kg",
    flavor: "This Pokemon has a very strong forehead.",
  },
  card2: {
    id: "card2",
    name: "Whammy",
    illustrator: "Alex Roh",
    image: "/images/20.jpg",
    rarity: "Common",
    hp: "30",
    setName: "20/50",
    setLogo: "/images/wm-set1.jpg",
    att1: "Dragin Tail",
    att1Icon: "/images/iconDragon.jpg",
    att1Desc: "Attacks opponent with its tail. (40)",
    att2: "Staring",
    att2Icon: "/images/iconNormal.jpg",
    att2Desc: "Stare at someone who is staring at you",
    metadata: "Height 1.8m, Weight 3.3kg",
    flavor:
      "This Pokemon was considered a legendary Pokemon until a small colony was discovered under water.",
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
        <p className="text-errorText text-center">Card not found.</p>
      </div>
    );
  }

  const card = dummyCardData[cardId];

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col gap-6 md:flex-row">
        {/* Left column: Card image */}
        <div className="flex justify-center md:w-1/3">
          <img
            src={card.image}
            alt={card.name}
            className="mb-4 block max-h-[600px] rounded-3xl object-contain shadow"
          />
        </div>
        {/* Right column: Card details */}
        <div className="md:w-2/3">
          <h2 className="mb-4 text-3xl font-bold">{card.name}</h2>

          <table className="w-full border-collapse">
            <tbody>
              <tr>
                <th className="py-2 pr-4 text-left font-semibold">HP</th>
                <td className="py-2">{card.hp}</td>
              </tr>
              <tr>
                <th className="py-2 pr-4 text-left font-semibold">
                  Measurements
                </th>
                <td className="py-2">{card.metadata}</td>
              </tr>
              <tr>
                <th className="py-2 pr-4 text-left font-semibold">
                  {card.att1}
                </th>
                <td className="py-2">
                  <img
                    src={card.att1Icon}
                    alt="Attack 1 Icon"
                    className="mr-2 mb-1 inline-block h-5 w-5 rounded-full align-middle"
                  />
                  {card.att1Desc}
                </td>
              </tr>
              <tr>
                <th className="py-2 pr-4 text-left font-semibold">
                  {card.att2}
                </th>
                <td className="py-2">
                  <img
                    src={card.att2Icon}
                    alt="Attack 1 Icon"
                    className="mr-2 mb-1 inline-block h-5 w-5 rounded-full align-middle"
                  />
                  {card.att2Desc}
                </td>
              </tr>
              <tr>
                <th className="py-2 pr-4 text-left font-semibold">
                  Flavor Text
                </th>
                <td className="py-2">{card.flavor}</td>
              </tr>

              <tr>
                <th className="py-2 pr-4 text-left font-semibold">
                  Illustrator
                </th>
                <td className="py-2">{card.illustrator}</td>
              </tr>
              <tr>
                <th className="py-2 pr-4 text-left font-semibold">Rarity</th>
                <td className="py-2">{card.rarity}</td>
              </tr>
              <tr>
                <th className="py-2 pr-4 text-left font-semibold">
                  <img
                    src={card.setLogo}
                    alt={card.setName}
                    className="w-24 rounded shadow"
                  />
                </th>
                <td className="py-2">
                  {card.setName}
                  <div className="mt-2"></div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CardDetailPage;

// src/pages/CardDetailPage.tsx
import React from "react";
import { useParams } from "react-router-dom";
import { getCardDetail } from "../hooks/getCollection";

// TODO: add for each page
interface Params extends Record<string, string | undefined> {
  seriesId?: string;
  setShortName?: string;
  cardName?: string;
}

const CardDetailPage: React.FC = () => {
  const { cardName } = useParams<Params>();
  const { data: card, error} = getCardDetail(cardName);

  if ((cardName == null) || (error != null) ) {
    return (
      <div className="container mx-auto p-4">
        <p className="text-errorText text-center">Card not found.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col gap-6 md:flex-row">
        {/* Left column: Card image */}
        <div className="flex justify-center md:w-1/3">
          <img
            src={card?.image}
            alt={card?.name}
            className="mb-4 block max-h-[600px] rounded-3xl object-contain shadow"
          />
        </div>
        {/* Right column: Card details */}
        <div className="md:w-2/3">
          <h2 className="mb-4 text-3xl font-bold">{card?.name}</h2>

          <table className="w-full border-collapse">
            <tbody>
              <tr>
                <th className="py-2 pr-4 text-left font-semibold">HP</th>
                <td className="py-2">{card?.hp}</td>
              </tr>
              <tr>
                <th className="py-2 pr-4 text-left font-semibold">
                  Measurements
                </th>
                <td className="py-2">Height {card?.measurement.height}, Weight {card?.measurement.weight}</td>
              </tr>
              {card?.attacks.map((attack) => (
              <tr>
                <th className="py-2 pr-4 text-left font-semibold">
                  {attack.name}
                </th>
                <td className="py-2">
                  {attack.costs.map((cost) => (
                    <img
                    src={`https://gaichu.b-cdn.net/wm/icon${cost}.jpg`}
                    alt={`${cost} Icon`}
                    className="mr-2 mb-1 inline-block h-5 w-5 rounded-full align-middle"
                  />
                  ))}
                  {attack.effect} {attack.damage ? `(${attack.damage})` : ""}
                </td>
              </tr>
              ))}
              <tr>
                <th className="py-2 pr-4 text-left font-semibold">
                  Flavor Text
                </th>
                <td className="py-2">{card?.description}</td>
              </tr>

              <tr>
                <th className="py-2 pr-4 text-left font-semibold">
                  Illustrator
                </th>
                <td className="py-2">{card?.illustrators[0]}</td>
              </tr>
              <tr>
                <th className="py-2 pr-4 text-left font-semibold">Rarity</th>
                <td className="py-2">{card?.rarity}</td>
              </tr>
              <tr>
                <th className="py-2 pr-4 text-left font-semibold">
                  <img
                    src={card?.sets[0].image}
                    alt={card?.sets[0].name}
                    className="w-24 rounded shadow"
                  />
                </th>
                <td className="py-2">
                  {card?.sets[0].name}
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

// src/components/CardListComponent.tsx
import { CollectionCard } from "@/types/CollectionCard";
import React from "react";
import CardsListTile from "../TileComponents/CardsListTile";
import HoverTooltip from "../TileComponents/HoverTooltip";
import { useParams } from "react-router-dom";

interface CardListProps {
  collectionCards: CollectionCard[];
  onClick: (card: CollectionCard) => void;
}

const CardList: React.FC<CardListProps> = ({ collectionCards, onClick }) => {
  const { seriesShortName } = useParams();

  if (!collectionCards || collectionCards.length === 0) {
    return <div className="text-primaryText text-center">No cards found.</div>;
  }

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10">
      {collectionCards.map((card) => (
        <CardsListTile key={card.id} onClick={() => onClick(card)}>
          <HoverTooltip
            content={
              <table className="w-full border-collapse text-sm">
                <tbody>
                  {card?.effect && (
                    <tr>
                      <th className="py-2 pr-4 text-left">Effect</th>
                      <td className="py-2">{card?.effect}</td>
                    </tr>
                  )}
                  {card.attacks?.map((attack, aIndex) => (
                    <tr key={attack.name ?? aIndex}>
                      <th className="py-2 pr-4 text-left">{attack.name}</th>
                      <td className="py-2">
                        {(attack.costs ?? []).map((cost, cIndex) => (
                          <img
                            key={`${attack.name}-cost-${cIndex}`}
                            src={`https://gaichu.b-cdn.net/${seriesShortName}/icon${cost}.jpg`}
                            alt={`${cost} Icon`}
                            className="mr-2 mb-1 inline-block h-5 w-5 rounded-full align-middle"
                          />
                        ))}
                        {attack.effect}{" "}
                        {attack.damage ? `(${attack.damage})` : ""}
                      </td>
                    </tr>
                  ))}
                  {card?.description && (
                    <tr>
                      <th className="py-2 pr-4 text-left">Flavor Text</th>
                      <td className="py-2">{card?.description}</td>
                    </tr>
                  )}
                  {card?.note && (
                    <tr>
                      <th className="py-2 pr-4 text-left">Note</th>
                      <td className="py-2">{card?.note}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            }
          >
            <div className="flex w-full flex-col items-center duration-200 hover:scale-110">
              <img
                src={card.image}
                alt={card.name}
                className="border-secondaryBorder block max-h-[260px] w-full rounded-xl border-1 object-contain transition-transform duration-200"
              />
              <h3 className="mt-0 max-w-30 truncate text-sm">{card.name}</h3>
            </div>
          </HoverTooltip>
        </CardsListTile>
      ))}
    </div>
  );
};

export default CardList;

// src/components/CardListComponent.tsx
import { CollectionCard } from "@/types/CollectionCard";
import React from "react";
import HtmlCell from "../HtmlCell";
import CardsListTile from "../TileComponents/CardsListTile";
import HoverTooltip from "../TileComponents/HoverTooltip";
import { useParams } from "react-router-dom";

interface CardListProps {
  collectionCards: CollectionCard[];
  onClick: (card: CollectionCard) => void;
}

const CardList: React.FC<CardListProps> = ({ collectionCards, onClick }) => {
  const { seriesShortName } = useParams();

  const tooltipWidth: Record<string, string> = {
    oz: "w-[26rem]",
    mz: "w-[30rem]",
    ash: "w-[24rem]",
  };

  if (!collectionCards || collectionCards.length === 0) {
    return <div className="text-primaryText text-center">No cards found.</div>;
  }

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10">
      {collectionCards.map((card) => (
        <CardsListTile key={card.id} onClick={() => onClick(card)}>
          <HoverTooltip
            widthClass={tooltipWidth[seriesShortName ?? ""] || "w-80"}
            content={
              <table className="w-full border-collapse text-sm">
                <tbody>
                  {card?.effect && (
                    <tr>
                      <th className="py-2 pr-4 text-left">Effect</th>
                      <HtmlCell html={card?.effect} />
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
                  {Array.isArray(card?.zoo_attack) &&
                    card!.zoo_attack!.map((atk, idx) => {
                      const statuses = Array.isArray(atk.status)
                        ? atk.status
                        : atk.status
                          ? [atk.status]
                          : [];

                      return (
                        <React.Fragment key={`${atk.name ?? "atk"}-${idx}`}>
                          <tr>
                            <th className="py-2 pr-4 text-left align-top">
                              {atk.name}
                            </th>
                            <td className="py-2">
                              {statuses.length > 0 && (
                                <span className="mr-2 inline-flex items-center gap-1 align-middle">
                                  {statuses.map((s, sIdx) => (
                                    <img
                                      key={`status-${s}-${sIdx}`}
                                      src={`https://gaichu.b-cdn.net/${seriesShortName}/icon${s}.png`}
                                      alt={`${s} Icon`}
                                      className="inline-block h-5 w-5 align-middle"
                                    />
                                  ))}
                                </span>
                              )}
                              {atk.multiplier && (
                                <span className="mr-2 align-middle">
                                  ({atk.multiplier})
                                </span>
                              )}
                              <span className="mr-2 align-middle font-medium">
                                {atk.damage}
                              </span>
                              {atk.bonus && (
                                <img
                                  src={`https://gaichu.b-cdn.net/${seriesShortName}/icon${atk.bonus}.png`}
                                  alt={`${atk.bonus} Icon`}
                                  className="inline-block h-5 w-5 align-middle"
                                />
                              )}
                              {atk.effect && (
                                <HtmlCell html={atk.effect ?? ""} />
                              )}
                            </td>
                          </tr>
                        </React.Fragment>
                      );
                    })}
                  {seriesShortName !== "oz" &&
                    seriesShortName !== "mz" &&
                    card?.description && (
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

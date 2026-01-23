// src/components/ListComponent/CardListComponent.tsx
import { CollectionCard } from "@/types/CollectionCard";
import React from "react";
import IconText from "@/components/IconText";
import CardsListTile from "@/components/TileComponents/CardsListTile";
import HoverTooltip from "@/components/TileComponents/HoverTooltip";
import { useParams } from "react-router-dom";
import { useLocale, t } from "@/i18n";
import { SeriesShortName } from "@/services/CollectionSeriesService";

interface CardListProps {
  collectionCards: CollectionCard[];
  onClick: (card: CollectionCard) => void;
}

const CardList: React.FC<CardListProps> = ({ collectionCards, onClick }) => {
  const { seriesShortName } = useParams();
  const { locale } = useLocale();
  const series = seriesShortName ?? "";

  const tooltipWidth = function (seriesShortName: string) {
    switch (seriesShortName) {
      case SeriesShortName.oz:
        return "w-[26rem]";
      case SeriesShortName.mz:
        return "w-[30rem]";
      case SeriesShortName.ash:
        return "w-[24rem]";
      default:
        return "w-80";
    }
  };

  if (!collectionCards || collectionCards.length === 0) {
    return <div className="text-errorText text-center">No cards found.</div>;
  }

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10">
      {collectionCards.map((card) => {
        const name = t(card.name, locale);

        return (
          <CardsListTile key={card.id} onClick={() => onClick(card)}>
            <HoverTooltip
              widthClass={tooltipWidth(series)}
              content={
                <table className="w-full border-collapse text-sm">
                  <tbody>
                    {card?.effect && (
                      <tr>
                        <th className="py-2 pr-4 text-left">Effect</th>
                        <td className="py-2">
                          <IconText text={card.effect} series={series} />
                        </td>
                      </tr>
                    )}

                    {card.attacks?.map((attack, aIndex) => {
                      const atkName = t(attack.name, locale);
                      const atkNameEn = t(attack.name, "en");
                      const atkEffect = t(attack.effect, locale);

                      return (
                        <tr key={atkNameEn || String(aIndex)}>
                          <th className="py-2 pr-4 text-left">{atkName}</th>
                          <td className="py-2">
                            {(attack.costs ?? []).map((cost, cIndex) => (
                              <img
                                key={`${atkNameEn}-cost-${cIndex}`}
                                src={`https://gaichu.b-cdn.net/${series}/icon${cost}.jpg`}
                                alt={`${cost} Icon`}
                                className="mr-2 mb-1 inline-block h-5 w-5 rounded-full align-middle"
                              />
                            ))}
                            <IconText
                              text={atkEffect}
                              series={series}
                              className="mx-1"
                            />{" "}
                            {attack.damage ? `(${attack.damage})` : ""}
                          </td>
                        </tr>
                      );
                    })}

                    {Array.isArray(card?.zoo_attack) &&
                      card.zoo_attack.map((atk, idx) => {
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
                                        src={`https://gaichu.b-cdn.net/${series}/icon${s}.png`}
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
                                    src={`https://gaichu.b-cdn.net/${series}/icon${atk.bonus}.png`}
                                    alt={`${atk.bonus} Icon`}
                                    className="inline-block h-5 w-5 align-middle"
                                  />
                                )}
                                {atk.effect && (
                                  <IconText text={atk.effect} series={series} />
                                )}
                              </td>
                            </tr>
                          </React.Fragment>
                        );
                      })}

                    {series !== SeriesShortName.oz &&
                      series !== SeriesShortName.mz &&
                      card?.description && (
                        <tr>
                          <th className="py-2 pr-4 text-left">Flavor Text</th>
                          <td className="py-2">
                            {t(card.description, locale)}
                          </td>
                        </tr>
                      )}

                    {card?.note && (
                      <tr>
                        <th className="py-2 pr-4 text-left">Note</th>
                        <td className="py-2">{card.note}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              }
            >
              <div className="flex w-full flex-col items-center duration-200 hover:scale-110">
                <div className="relative w-full">
                  <img
                    src={card.image}
                    alt={name}
                    className="border-secondaryBorder block max-h-65 w-full rounded-xl border object-contain transition-transform duration-200"
                  />
                  {card.average_price != null && card.average_price > 0 && (
                    <span className="absolute top-1 right-1 rounded bg-black/70 px-1.5 py-0.5 text-xs text-white">
                      ${card.average_price.toFixed(2)}
                    </span>
                  )}
                </div>
                <p className="mt-0 line-clamp-1 text-center text-sm">{name}</p>
              </div>
            </HoverTooltip>
          </CardsListTile>
        );
      })}
    </div>
  );
};

export default CardList;

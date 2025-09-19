// src/pages/CardDetailPage.tsx
import React from "react";
import HtmlCell from "../components/HtmlCell";
import { useNavigate, useParams } from "react-router-dom";
import { CollectionParams } from "../App";
import CardDetailPagingButton, {
  PagingType,
} from "../components/ButtonComponents/CardDetailPagingButton";
import { useCurrentAndAdjacentCards } from "../hooks/useCollectionCard";
import {
  getCardDetailPath,
  parseSortAndNameRegex,
} from "../utils/RoutePathBuildUtils";

const CardDetailPage: React.FC = () => {
  const { seriesShortName, setShortName, sortByAndCardName } =
    useParams<CollectionParams>();
  const navigate = useNavigate();

  // ✅ decode series/set too (not just the last segment)
  const seriesKey = decodeURIComponent(seriesShortName ?? "");
  const setKey = decodeURIComponent(setShortName ?? "");

  // existing decode/parse of the last segment
  const decoded = decodeURIComponent(sortByAndCardName ?? "");
  const parsed = parseSortAndNameRegex(decoded, { strict: false });
  const sortByNum = Number(parsed.sortBy);
  const sortBy = Number.isFinite(sortByNum) ? sortByNum : undefined;
  const cardName = (parsed.cardName ?? decoded).trim();

  // put this here ⬇️
  console.log("[CardDetail params]", { seriesKey, setKey, sortBy, cardName });

  // ✅ pass decoded series/set to the hook
  const { card, previousCard, nextCard, isLoading, error } =
    useCurrentAndAdjacentCards(seriesKey, setKey, sortBy, cardName);

  // 4) Friendly states
  if (isLoading) {
    return <div className="container mx-auto p-4 text-zinc-400">Loading…</div>;
  }
  if (error || !card) {
    return (
      <div className="container mx-auto p-4">
        <p className="text-errorText text-center">Card not found.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col gap-6 md:flex-row">
        <div className="flex flex-col items-center md:w-1/3">
          <img
            src={card?.image}
            alt={card?.name}
            className="border-secondaryBorder mb-4 block max-h-[600px] rounded-3xl border-1 object-contain shadow"
          />
          <div className="mt-0 flex w-full max-w-xs gap-4">
            {previousCard && (
              <CardDetailPagingButton
                pagingType={PagingType.Previous}
                card={previousCard ? previousCard : undefined}
                onClick={() => {
                  navigate(getCardDetailPath(previousCard));
                }}
              />
            )}
            {nextCard && (
              <CardDetailPagingButton
                pagingType={PagingType.Next}
                card={nextCard ? nextCard : undefined}
                onClick={() => {
                  navigate(getCardDetailPath(nextCard));
                }}
              />
            )}
          </div>
        </div>
        <div className="md:w-2/3">
          <h2 className="mb-4 text-3xl">{card?.name}</h2>

          <table className="w-full border-collapse">
            <tbody>
              {card?.hp && (
                <tr>
                  <th className="py-2 pr-4 text-left">HP</th>
                  <td className="py-2">{card?.hp}</td>
                </tr>
              )}
              {card?.measurement && (
                <tr>
                  <th className="py-2 pr-4 text-left">Measurements</th>
                  <td className="py-2">
                    Height {card?.measurement?.height}, Weight{" "}
                    {card?.measurement?.weight}
                  </td>
                </tr>
              )}
              {card?.attacks?.map((attack, aIndex) => (
                <tr key={attack.name ?? aIndex}>
                  <th className="py-2 pr-4 text-left">{attack.name}</th>
                  <td className="py-2">
                    {(attack.costs ?? []).map((cost, cIndex) => (
                      <img
                        key={`${attack.name}-cost-${cIndex}`}
                        src={`https://gaichu.b-cdn.net/${seriesKey}/icon${cost}.jpg`}
                        alt={`${cost} Icon`}
                        className="mr-2 mb-1 inline-block h-5 w-5 rounded-full align-middle"
                      />
                    ))}
                    {attack.effect} {attack.damage ? `(${attack.damage})` : ""}
                  </td>
                </tr>
              ))}
              {card?.type && (
                <tr>
                  <th className="py-2 pr-4 text-left">Type</th>
                  <td className="py-2">{card?.type}</td>
                </tr>
              )}
              {card?.limit && (
                <tr>
                  <th className="py-2 pr-4 text-left">Limit</th>
                  <td className="py-2">{card?.limit}</td>
                </tr>
              )}
              {card?.cost && (
                <tr>
                  <th className="py-2 pr-4 text-left">Cost</th>
                  <td className="py-2">
                    {card?.cost?.map((cost) => (
                      <span key={cost.aura} className="mr-2">
                        {cost.total}{" "}
                        <img
                          src={`https://gaichu.b-cdn.net/${seriesKey}/icon${cost.aura}.jpg`}
                          alt={`${cost.aura} Icon`}
                          className="inline-block h-5 w-5 align-middle"
                        />
                        {"   "}
                      </span>
                    ))}
                    {card?.lp && <span>LP {card.lp}</span>}
                  </td>
                </tr>
              )}
              {card?.traits && (
                <tr>
                  <th className="py-2 pr-4 text-left">Traits</th>
                  <td className="py-2">
                    {card?.traits?.map((traits) => (
                      <span className="mr-2">
                        <img
                          src={`https://gaichu.b-cdn.net/${seriesKey}/icon${traits}.png`}
                          alt={`${traits} Icon`}
                          className="inline-block h-5 w-5 align-middle"
                        />
                        {"   "}
                      </span>
                    ))}
                  </td>
                </tr>
              )}
              {card?.terra && (
                <tr>
                  <th className="py-2 pr-4 text-left">Terra</th>
                  <td className="py-2">
                    {card?.terra?.map((terra) => (
                      <span className="mr-2">
                        ({terra.attack && <>{terra.attack} </>}
                        <img
                          src={`https://gaichu.b-cdn.net/${seriesKey}/icon${terra.icon}.png`}
                          alt={`${terra.icon} Icon`}
                          className="inline-block h-5 w-5 align-middle"
                        />
                        {terra.lp}){"   "}
                      </span>
                    ))}
                  </td>
                </tr>
              )}
              {card?.metadata && (
                <tr>
                  <th className="py-2 pr-4 text-left">Metadata</th>
                  <td className="py-2">
                    {card?.metadata?.discovered && (
                      <>Discovered {card.metadata.discovered}, </>
                    )}
                    {card?.metadata?.gps && <>GPS {card.metadata.gps}, </>}
                    {card?.metadata?.weight && (
                      <>Weight {card.metadata.weight}, </>
                    )}
                    {card?.metadata?.height && (
                      <>Height {card.metadata.height}</>
                    )}
                    {card?.metadata?.length && (
                      <>Length {card.metadata.length}</>
                    )}
                  </td>
                </tr>
              )}
              {card?.effect && (
                <tr>
                  <th className="py-2 pr-4 text-left">Effect</th>
                  <HtmlCell html={card?.effect} />
                </tr>
              )}
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
                                  src={`https://gaichu.b-cdn.net/${seriesKey}/icon${s}.png`}
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
                              src={`https://gaichu.b-cdn.net/${seriesKey}/icon${atk.bonus}.png`}
                              alt={`${atk.bonus} Icon`}
                              className="inline-block h-5 w-5 align-middle"
                            />
                          )}
                          {atk.effect && <HtmlCell html={atk.effect ?? ""} />}
                        </td>
                      </tr>
                    </React.Fragment>
                  );
                })}
              {card?.description && (
                <tr>
                  <th className="py-2 pr-4 text-left">Flavor Text</th>
                  <td className="py-2">{card.description}</td>
                </tr>
              )}
              {card?.illustrators && (
                <tr>
                  <th className="py-2 pr-4 text-left">Illustrator</th>
                  <td className="py-2">{card?.illustrators[0]}</td>
                </tr>
              )}
              {card?.rarity && (
                <tr>
                  <th className="py-2 pr-4 text-left">Rarity</th>
                  <td className="py-2">{card?.rarity}</td>
                </tr>
              )}
              {card?.sets && (
                <tr>
                  <th className="py-2 pr-4 text-left">
                    <img
                      src={card?.sets[0].image}
                      alt={card?.sets[0].name}
                      className="w-24 rounded shadow"
                    />
                  </th>

                  <td className="py-2">
                    {card?.sets[0].name} • {card?.number}/
                    {card?.total_cards_count} • {card?.variant}
                    <div className="mt-2"></div>
                  </td>
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
        </div>
      </div>
    </div>
  );
};

export default CardDetailPage;

// src/pages/CardDetailPage.tsx
import React from "react";
import HtmlCell from "@/components/HtmlCell";
import { useNavigate, useParams } from "react-router-dom";
import type { CollectionParamKeys } from "@/types/routes";
import CardDetailPagingButton, {
  PagingType,
} from "@/components/ButtonComponents/CardDetailPagingButton";
import { useCurrentAndAdjacentCards } from "@/hooks/useCollectionCard";
import {
  getCardDetailPath,
  parseSortAndNameRegex,
} from "@/utils/RoutePathBuildUtils";
import LocaleToggle from "@/components/LocaleToggle";
import { useLocale, t } from "@/i18n/locale";

const CardDetailPage: React.FC = () => {
  const { seriesShortName, setShortName, sortByAndCardName } =
    useParams<CollectionParamKeys>();
  const navigate = useNavigate();
  const { locale } = useLocale();

  const seriesKey = decodeURIComponent(seriesShortName ?? "");
  const setKey = decodeURIComponent(setShortName ?? "");

  const decoded = decodeURIComponent(sortByAndCardName ?? "");
  const parsed = parseSortAndNameRegex(decoded, { strict: false });
  const sortByNum = Number(parsed.sortBy);
  const sortBy = Number.isFinite(sortByNum) ? sortByNum : undefined;
  const cardName = (parsed.cardName ?? decoded).trim();

  const { card, previousCard, nextCard, isLoading, error } =
    useCurrentAndAdjacentCards(seriesKey, setKey, sortBy, cardName);

  if (isLoading)
    return (
      <div className="text-secondaryText container mx-auto pt-1">Loading…</div>
    );
  if (error || !card) {
    return (
      <div className="container mx-auto pt-1">
        <p className="text-errorText text-center">Card not found.</p>
      </div>
    );
  }

  const resolvedName = t(card.name as any, locale);

  const resolveLocaleText = (value: unknown): string => {
    if (!value) return "";
    return (t as any)(value as any, locale) ?? "";
  };

  const hasLocaleText = (value: unknown): boolean => {
    const text = resolveLocaleText(value);
    return typeof text === "string" && text.trim().length > 0;
  };

  return (
    <div className="container mx-auto pt-2">
      <div className="flex flex-col gap-6 md:flex-row">
        <div className="flex flex-col items-center md:w-1/3">
          <img
            src={card.image}
            alt={resolvedName}
            className="border-secondaryBorder mb-4 block max-h-[600px] rounded-3xl border-1 object-contain shadow"
          />
          <div className="mt-0 flex w-full max-w-xs gap-4">
            {previousCard && (
              <CardDetailPagingButton
                pagingType={PagingType.Previous}
                card={previousCard}
                onClick={() => navigate(getCardDetailPath(previousCard))}
              />
            )}
            {nextCard && (
              <CardDetailPagingButton
                pagingType={PagingType.Next}
                card={nextCard}
                onClick={() => navigate(getCardDetailPath(nextCard))}
              />
            )}
          </div>
        </div>

        <div className="md:w-2/3">
          <div className="flex items-start justify-between gap-3">
            <h1 className="mb-4 text-2xl font-semibold">{resolvedName}</h1>
            <LocaleToggle card={card} />
          </div>

          <table className="w-full border-collapse">
            <tbody>
              {card.type && (
                <tr>
                  <th>Type</th>
                  <td>
                    {card.color && (
                      <img
                        src={`https://gaichu.b-cdn.net/${seriesKey}/icon${card.color}.jpg`}
                        alt={`${card.color} Icon`}
                        className="mr-2 inline-block h-5 w-5 rounded-full align-middle"
                      />
                    )}
                    {card.type}
                  </td>
                </tr>
              )}

              {card.stage?.map((s, i) => {
                const text = [s.basic, s.evolution, s.description]
                  .filter(Boolean)
                  .join("\n");
                if (!text) return null;
                return (
                  <tr key={i}>
                    <th>Stage</th>
                    <td>{text}</td>
                  </tr>
                );
              })}

              {card.hp && (
                <tr>
                  <th>HP</th>
                  <td>{card.hp}</td>
                </tr>
              )}

              {card.lp_alt && (
                <tr>
                  <th>LP</th>
                  <td>{card.lp_alt}</td>
                </tr>
              )}

              {card.measurement && (
                <tr>
                  <th>Measurements</th>
                  <td>
                    Height {card.measurement.height}, Weight{" "}
                    {card.measurement.weight}
                  </td>
                </tr>
              )}

              {card.attacks?.map((attack: any, aIndex: number) => (
                <tr key={t(attack.name, "en") || aIndex}>
                  <th>{t(attack.name, locale)}</th>
                  <td>
                    {(attack.costs ?? []).map(
                      (cost: string, cIndex: number) => (
                        <img
                          key={`${t(attack.name, "en")}-cost-${cIndex}`}
                          src={`https://gaichu.b-cdn.net/${seriesKey}/icon${cost}.jpg`}
                          alt={`${cost} Icon`}
                          className="mr-2 inline-block h-5 w-5 rounded-full align-middle"
                        />
                      ),
                    )}
                    <HtmlCell
                      html={t(attack.effect, locale)}
                      className="html-cell mx-1"
                    />
                    {attack.damage ? `(${attack.damage})` : ""}
                  </td>
                </tr>
              ))}

              {card.limit && (
                <tr>
                  <th>Limit</th>
                  <td>{card.limit}</td>
                </tr>
              )}

              {card.cost && (
                <tr>
                  <th>Cost</th>
                  <td>
                    {card.cost.map((cost) => (
                      <span key={cost.aura} className="mr-2">
                        {cost.total}{" "}
                        <img
                          src={`https://gaichu.b-cdn.net/${seriesKey}/icon${cost.aura}.jpg`}
                          alt={`${cost.aura} Icon`}
                          className="inline-block h-5 w-5 align-middle"
                        />
                        {"  "}
                      </span>
                    ))}
                    {card.lp && <span>LP {card.lp}</span>}
                  </td>
                </tr>
              )}

              {card.traits && (
                <tr>
                  <th>Traits</th>
                  <td>
                    {card.traits.map((traits) => (
                      <span key={traits} className="mr-2">
                        <img
                          src={`https://gaichu.b-cdn.net/${seriesKey}/icon${traits}.png`}
                          alt={`${traits} Icon`}
                          className="inline-block h-5 w-5 align-middle"
                        />
                        {"  "}
                      </span>
                    ))}
                  </td>
                </tr>
              )}

              {card.terra && (
                <tr>
                  <th>Terra</th>
                  <td>
                    {card.terra.map((terra, i) => (
                      <span key={`${terra.icon}-${i}`} className="mr-2">
                        ({terra.attack && <>{terra.attack} </>}
                        <img
                          src={`https://gaichu.b-cdn.net/${seriesKey}/icon${terra.icon}.png`}
                          alt={`${terra.icon} Icon`}
                          className="inline-block h-5 w-5 align-middle"
                        />
                        {terra.lp}){"  "}
                      </span>
                    ))}
                  </td>
                </tr>
              )}

              {card.metadata && (
                <tr>
                  <th>Metadata</th>
                  <td>
                    {card.metadata.discovered && (
                      <>Discovered {card.metadata.discovered}, </>
                    )}
                    {card.metadata.gps && <>GPS {card.metadata.gps}, </>}
                    {card.metadata.weight && (
                      <>Weight {card.metadata.weight}, </>
                    )}
                    {card.metadata.height && <>Height {card.metadata.height}</>}
                    {card.metadata.length && <>Length {card.metadata.length}</>}
                    {card.metadata.type && (
                      <>
                        {card.metadata.type} {card.metadata.measurement}
                      </>
                    )}
                  </td>
                </tr>
              )}

              {card.effect && (
                <tr>
                  <th>Effect</th>
                  <HtmlCell html={card.effect} />
                </tr>
              )}

              {Array.isArray(card.zoo_attack) &&
                card.zoo_attack.map((atk, idx) => {
                  const statuses = Array.isArray(atk.status)
                    ? atk.status
                    : atk.status
                      ? [atk.status]
                      : [];
                  return (
                    <React.Fragment key={`${atk.name ?? "atk"}-${idx}`}>
                      <tr>
                        <th>{atk.name}</th>
                        <td>
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

              {(card?.weakness?.length ||
                card?.resistance?.length ||
                card?.retreat?.some((r) => r?.costs?.length)) && (
                <tr>
                  <th>Attributes</th>
                  <td>
                    {card.weakness?.length ? (
                      <div>
                        <span>Weakness</span>{" "}
                        <span className="mb-1 inline-flex flex-wrap items-center gap-2 align-middle">
                          {card.weakness.map((w, i) => (
                            <span
                              key={`w-${i}`}
                              className="inline-flex items-center gap-1"
                            >
                              {w.type && (
                                <img
                                  src={`https://gaichu.b-cdn.net/${seriesKey}/icon${w.type}.jpg`}
                                  alt={`${w.type} Icon`}
                                  className="inline-block h-5 w-5 align-middle"
                                />
                              )}
                              {w.value && (
                                <span className="align-middle">{w.value}</span>
                              )}
                            </span>
                          ))}
                        </span>
                      </div>
                    ) : null}

                    {card.resistance?.length ? (
                      <div>
                        <span>Resistance</span>{" "}
                        <span className="mb-1 inline-flex flex-wrap items-center gap-2 align-middle">
                          {card.resistance.map((r, i) => (
                            <span
                              key={`r-${i}`}
                              className="inline-flex items-center gap-1"
                            >
                              {r.type && (
                                <img
                                  src={`https://gaichu.b-cdn.net/${seriesKey}/icon${r.type}.jpg`}
                                  alt={`${r.type} Icon`}
                                  className="inline-block h-5 w-5 align-middle"
                                />
                              )}
                              {r.value && (
                                <span className="align-middle">{r.value}</span>
                              )}
                            </span>
                          ))}
                        </span>
                      </div>
                    ) : null}

                    {card.retreat?.some((rr) => rr?.costs?.length) ? (
                      <div>
                        <span>Retreat</span>{" "}
                        <span className="inline-flex flex-wrap items-center gap-2 align-middle">
                          {(card.retreat ?? [])
                            .flatMap((rr) => rr?.costs ?? [])
                            .map((cost, i) => (
                              <img
                                key={`c-${i}`}
                                src={`https://gaichu.b-cdn.net/${seriesKey}/icon${cost}.jpg`}
                                alt={`${cost} Icon`}
                                className="inline-block h-5 w-5 align-middle"
                              />
                            ))}
                        </span>
                      </div>
                    ) : null}
                  </td>
                </tr>
              )}

              {card.strength && (
                <tr>
                  <th>Attributes</th>
                  <td>{card.strength}</td>
                </tr>
              )}

              {hasLocaleText(card.description) && (
                <tr>
                  <th>Flavor Text</th>
                  <td>{resolveLocaleText(card.description)}</td>
                </tr>
              )}

              {card.rule?.map((s, i) => {
                const text = [s.name, s.description].filter(Boolean).join("\n");
                if (!text) return null;
                return (
                  <tr key={i}>
                    <th>Rule</th>
                    <td>{text}</td>
                  </tr>
                );
              })}

              {card.illustrators && (
                <tr>
                  <th>Illustrator</th>
                  <td>{card.illustrators[0]}</td>
                </tr>
              )}

              {card.rarity && (
                <tr>
                  <th>Rarity</th>
                  <td>{card.rarity}</td>
                </tr>
              )}

              {card.sets && (
                <tr>
                  <th>
                    <img
                      src={card.sets[0].image}
                      alt={card.sets[0].name}
                      className="w-24 rounded shadow"
                    />
                  </th>
                  <td>
                    {card.sets[0].name} • {card.number}/{card.total_cards_count}{" "}
                    • {card.variant}
                    <div className="mt-2"></div>
                  </td>
                </tr>
              )}

              {card.note && (
                <tr>
                  <th>Note</th>
                  <td>{card.note}</td>
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

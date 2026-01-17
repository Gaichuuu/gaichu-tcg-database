// src/pages/CardDetailPage.tsx
import CardDetailPagingButton, {
  PagingType,
} from "@/components/ButtonComponents/CardDetailPagingButton";
import HtmlCell from "@/components/HtmlCell";
import LocaleToggle from "@/components/LocaleToggle";
import { PageLoading, PageError, PageNotFound } from "@/components/PageStates";
import { useCurrentAndAdjacentCards } from "@/hooks/useCollectionCard";
import { t, useLocale } from "@/i18n";
import type { CollectionParamKeys } from "@/types/routes";
import {
  getCardDetailPath,
  parseSortAndNameRegex,
} from "@/utils/RoutePathBuildUtils";
import React from "react";
import { useNavigate, useParams } from "react-router-dom";

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

  const { data, isFetching, error } = useCurrentAndAdjacentCards(
    seriesKey,
    setKey,
    sortBy,
    cardName,
  );

  if (isFetching) return <PageLoading />;
  if (error) return <PageError message="Failed to load card." />;
  if (!data?.card) return <PageNotFound message="Card not found." />;

  const resolvedName = t(data.card.name, locale);

  const resolveLocaleText = (
    value: Partial<Record<"en" | "ja", string>> | undefined,
  ): string => {
    if (!value) return "";
    return t(value, locale) ?? "";
  };

  const hasLocaleText = (
    value: Partial<Record<"en" | "ja", string>> | undefined,
  ): boolean => {
    const text = resolveLocaleText(value);
    return typeof text === "string" && text.trim().length > 0;
  };

  return (
    <div className="container mx-auto pt-2">
      <div className="flex flex-col gap-6 md:flex-row">
        <div className="flex flex-col items-center md:w-1/3">
          <img
            src={data.card.image}
            alt={resolvedName}
            className="border-secondaryBorder mb-4 block max-h-150 rounded-3xl border object-contain shadow"
          />
          <div className="mt-0 flex w-full max-w-xs gap-4">
            {data.previousCard && (
              <CardDetailPagingButton
                pagingType={PagingType.Previous}
                card={data.previousCard}
                onClick={() => navigate(getCardDetailPath(data!.previousCard!))}
              />
            )}
            {data.nextCard && (
              <CardDetailPagingButton
                pagingType={PagingType.Next}
                card={data.nextCard}
                onClick={() => navigate(getCardDetailPath(data!.nextCard!))}
              />
            )}
          </div>
        </div>

        <div className="md:w-2/3">
          <div className="flex items-start justify-between gap-3">
            <h1 className="mb-4 text-2xl font-semibold">{resolvedName}</h1>
            <LocaleToggle card={data.card} />
          </div>

          <table className="w-full border-collapse">
            <tbody>
              {data.card.type && (
                <tr>
                  <th>Type</th>
                  <td>
                    {data.card.color && (
                      <img
                        src={`https://gaichu.b-cdn.net/${seriesKey}/icon${data.card.color}.jpg`}
                        alt={`${data.card.color} Icon`}
                        className="mr-2 inline-block h-5 w-5 rounded-full align-middle"
                      />
                    )}
                    {data.card.type}
                  </td>
                </tr>
              )}

              {data.card.stage?.map((s, i) => {
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

              {data.card.hp && (
                <tr>
                  <th>HP</th>
                  <td>{data.card.hp}</td>
                </tr>
              )}

              {data.card.lp_alt && (
                <tr>
                  <th>LP</th>
                  <td>{data.card.lp_alt}</td>
                </tr>
              )}

              {data.card.measurement && (
                <tr>
                  <th>Measurements</th>
                  <td>
                    Height {data.card.measurement.height}, Weight{" "}
                    {data.card.measurement.weight}
                  </td>
                </tr>
              )}

              {data.card.attacks?.map((attack, aIndex) => (
                <tr key={t(attack.name, "en") || aIndex}>
                  <th>{t(attack.name, locale)}</th>
                  <td>
                    {(attack.costs ?? []).map((cost, cIndex) => (
                      <img
                        key={`${t(attack.name, "en")}-cost-${cIndex}`}
                        src={`https://gaichu.b-cdn.net/${seriesKey}/icon${cost}.jpg`}
                        alt={`${cost} Icon`}
                        className="mr-2 inline-block h-5 w-5 rounded-full align-middle"
                      />
                    ))}
                    <HtmlCell
                      html={t(attack.effect, locale)}
                      className="html-cell mx-1"
                    />
                    {attack.damage ? `(${attack.damage})` : ""}
                  </td>
                </tr>
              ))}

              {data.card.limit && (
                <tr>
                  <th>Limit</th>
                  <td>{data.card.limit}</td>
                </tr>
              )}

              {data.card.cost && (
                <tr>
                  <th>Cost</th>
                  <td>
                    {data.card.cost.map((cost) => (
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
                    {data.card.lp && <span>LP {data.card.lp}</span>}
                  </td>
                </tr>
              )}

              {data.card.traits && (
                <tr>
                  <th>Traits</th>
                  <td>
                    {data.card.traits.map((traits) => (
                      <span key={traits} className="mr-2">
                        <img
                          src={`https://gaichu.b-cdn.net/${seriesKey}/icon${traits}.png`}
                          alt={`${traits} Icon`}
                          className="inline-block h-5 align-middle"
                        />
                        {"  "}
                      </span>
                    ))}
                  </td>
                </tr>
              )}

              {data.card.terra && (
                <tr>
                  <th>Terra</th>
                  <td>
                    {data.card.terra.map((terra, i) => (
                      <span key={`${terra.icon}-${i}`} className="mr-2">
                        ({terra.attack && <>{terra.attack} </>}
                        <img
                          src={`https://gaichu.b-cdn.net/${seriesKey}/icon${terra.icon}.png`}
                          alt={`${terra.icon} Icon`}
                          className="inline-block h-5 align-middle"
                        />
                        {terra.lp}){"  "}
                      </span>
                    ))}
                  </td>
                </tr>
              )}

              {data.card.metadata && (
                <tr>
                  <th>Metadata</th>
                  <td>
                    {data.card.metadata.discovered && (
                      <>Discovered {data.card.metadata.discovered}, </>
                    )}
                    {data.card.metadata.gps && (
                      <>GPS {data.card.metadata.gps}, </>
                    )}
                    {data.card.metadata.weight && (
                      <>Weight {data.card.metadata.weight}, </>
                    )}
                    {data.card.metadata.height && (
                      <>Height {data.card.metadata.height}</>
                    )}
                    {data.card.metadata.length && (
                      <>Length {data.card.metadata.length}</>
                    )}
                    {data.card.metadata.type && (
                      <>
                        {data.card.metadata.type}{" "}
                        {data.card.metadata.measurement}
                      </>
                    )}
                  </td>
                </tr>
              )}

              {data.card.effect && (
                <tr>
                  <th>Effect</th>
                  <HtmlCell html={data.card.effect} />
                </tr>
              )}

              {Array.isArray(data.card.zoo_attack) &&
                data.card.zoo_attack.map((atk, idx) => {
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

              {(data.card?.weakness?.length ||
                data.card?.resistance?.length ||
                data.card?.retreat?.some((r) => r?.costs?.length)) && (
                <tr>
                  <th>Attributes</th>
                  <td>
                    {data.card.weakness?.length ? (
                      <div>
                        <span>Weakness</span>{" "}
                        <span className="mb-1 inline-flex flex-wrap items-center gap-2 align-middle">
                          {data.card.weakness.map((w, i) => (
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

                    {data.card.resistance?.length ? (
                      <div>
                        <span>Resistance</span>{" "}
                        <span className="mb-1 inline-flex flex-wrap items-center gap-2 align-middle">
                          {data.card.resistance.map((r, i) => (
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

                    {data.card.retreat?.some((rr) => rr?.costs?.length) ? (
                      <div>
                        <span>Retreat</span>{" "}
                        <span className="inline-flex flex-wrap items-center gap-2 align-middle">
                          {(data.card.retreat ?? [])
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

              {data.card.strength && (
                <tr>
                  <th>Attributes</th>
                  <td>{data.card.strength}</td>
                </tr>
              )}

              {hasLocaleText(data.card.description) && (
                <tr>
                  <th>Flavor Text</th>
                  <td>{resolveLocaleText(data.card.description)}</td>
                </tr>
              )}

              {data.card.rule?.map((s, i) => {
                const text = [s.name, s.description].filter(Boolean).join("\n");
                if (!text) return null;
                return (
                  <tr key={i}>
                    <th>Rule</th>
                    <td>{text}</td>
                  </tr>
                );
              })}

              {data.card.illustrators && (
                <tr>
                  <th>Illustrator</th>
                  <td>{data.card.illustrators[0]}</td>
                </tr>
              )}

              {data.card.rarity && (
                <tr>
                  <th>Rarity</th>
                  <td>{data.card.rarity}</td>
                </tr>
              )}

              {data.card.sets && (
                <tr>
                  <th>
                    <img
                      src={data.card.sets[0].image}
                      alt={data.card.sets[0].name}
                      className="w-24 rounded shadow"
                    />
                  </th>
                  <td>
                    {data.card.sets[0].name} • {data.card.number}/
                    {data.card.total_cards_count} • {data.card.variant}
                    <div className="mt-2"></div>
                  </td>
                </tr>
              )}

              {data.card.note && (
                <tr>
                  <th>Note</th>
                  <td>{data.card.note}</td>
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

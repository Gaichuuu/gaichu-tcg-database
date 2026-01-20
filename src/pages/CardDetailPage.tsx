// src/pages/CardDetailPage.tsx
import IconText from "@/components/IconText";
import LocaleToggle from "@/components/LocaleToggle";
import { PageLoading, PageError, PageNotFound } from "@/components/PageStates";
import {
  CardIcon,
  CardDetailRow,
  CardImageSection,
  AttacksSection,
  AttributesSection,
  ZooAttackSection,
  ZooAttributesSection,
} from "@/components/CardDetail";
import { useCurrentAndAdjacentCards } from "@/hooks/useCollectionCard";
import { t, useLocale } from "@/i18n";
import type { CollectionParamKeys } from "@/types/routes";
import { parseSortAndNameRegex } from "@/utils/RoutePathBuildUtils";
import React from "react";
import { useParams } from "react-router-dom";

const CardDetailPage: React.FC = () => {
  const { seriesShortName, setShortName, sortByAndCardName } =
    useParams<CollectionParamKeys>();
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

  const { card, previousCard, nextCard } = data;
  const resolvedName = t(card.name, locale);

  // Build SEO metadata
  const pageTitle = `${resolvedName} - Gaichu`;
  const descriptionParts: string[] = [];
  if (card.parody) descriptionParts.push(`A parody of ${card.parody}`);
  if (card.rarity) descriptionParts.push(`${card.rarity} card`);
  if (card.hp) descriptionParts.push(`HP: ${card.hp}`);
  const flavorText = t(card.description, locale);
  if (flavorText) descriptionParts.push(flavorText);
  const pageDescription =
    descriptionParts.length > 0
      ? descriptionParts.join(". ")
      : `View ${resolvedName} card details on Gaichu TCG Database.`;
  const pageImage = card.image || card.thumb;

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
      {/* React 19 native metadata */}
      <title>{pageTitle}</title>
      <meta name="description" content={pageDescription} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDescription} />
      {pageImage && <meta property="og:image" content={pageImage} />}
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={pageDescription} />
      {pageImage && <meta name="twitter:image" content={pageImage} />}

      <div className="flex flex-col gap-6 md:flex-row">
        <CardImageSection
          card={card}
          resolvedName={resolvedName}
          previousCard={previousCard}
          nextCard={nextCard}
        />

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
                      <CardIcon
                        series={seriesKey}
                        name={card.color}
                        extension="jpg"
                        className="mr-2 rounded-full"
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
                  <CardDetailRow key={i} label="Stage">
                    {text}
                  </CardDetailRow>
                );
              })}

              {card.hp && <CardDetailRow label="HP">{card.hp}</CardDetailRow>}

              {card.lp_alt && (
                <CardDetailRow label="LP">{card.lp_alt}</CardDetailRow>
              )}

              {card.measurement && (
                <CardDetailRow label="Measurements">
                  Height {card.measurement.height}, Weight{" "}
                  {card.measurement.weight}
                </CardDetailRow>
              )}

              <AttacksSection attacks={card.attacks ?? []} series={seriesKey} />

              {card.limit && (
                <CardDetailRow label="Limit">{card.limit}</CardDetailRow>
              )}

              {card.cost && (
                <CardDetailRow label="Cost">
                  {card.cost.map((cost) => (
                    <span key={cost.aura} className="mr-2">
                      {cost.total}{" "}
                      <CardIcon
                        series={seriesKey}
                        name={cost.aura}
                        extension="jpg"
                      />
                      {"  "}
                    </span>
                  ))}
                  {card.lp && <span>LP {card.lp}</span>}
                </CardDetailRow>
              )}

              {card.traits && (
                <CardDetailRow label="Traits">
                  {card.traits.map((trait) => (
                    <span key={trait} className="mr-2">
                      <CardIcon
                        series={seriesKey}
                        name={trait}
                        extension="png"
                        className="h-5"
                      />
                      {"  "}
                    </span>
                  ))}
                </CardDetailRow>
              )}

              {card.terra && (
                <CardDetailRow label="Terra">
                  {card.terra.map((terra, i) => (
                    <span key={`${terra.icon}-${i}`} className="mr-2">
                      ({terra.attack && <>{terra.attack} </>}
                      <CardIcon
                        series={seriesKey}
                        name={terra.icon}
                        extension="png"
                        className="h-5"
                      />
                      {terra.lp}){"  "}
                    </span>
                  ))}
                </CardDetailRow>
              )}

              {card.metadata && (
                <CardDetailRow label="Metadata">
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
                </CardDetailRow>
              )}

              {card.effect && (
                <CardDetailRow label="Effect">
                  <IconText text={card.effect} series={seriesKey} />
                </CardDetailRow>
              )}

              <ZooAttackSection
                attacks={card.zoo_attack ?? []}
                series={seriesKey}
              />

              <AttributesSection
                series={seriesKey}
                weakness={card.weakness}
                resistance={card.resistance}
                retreat={card.retreat}
              />

              <ZooAttributesSection
                series={seriesKey}
                strength={card.strength}
              />

              {hasLocaleText(card.description) && (
                <CardDetailRow label="Flavor Text">
                  {resolveLocaleText(card.description)}
                </CardDetailRow>
              )}

              {card.rule?.map((s, i) => {
                const text = [s.name, s.description].filter(Boolean).join("\n");
                if (!text) return null;
                return (
                  <CardDetailRow key={i} label="Rule">
                    {text}
                  </CardDetailRow>
                );
              })}

              {card.illustrators && (
                <CardDetailRow label="Illustrator">
                  {card.illustrators[0]}
                </CardDetailRow>
              )}

              {card.rarity && (
                <CardDetailRow label="Rarity">{card.rarity}</CardDetailRow>
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
                <CardDetailRow label="Note">{card.note}</CardDetailRow>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CardDetailPage;

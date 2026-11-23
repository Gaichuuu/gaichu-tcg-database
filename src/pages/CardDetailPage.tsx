import { PageError, PageNotFound } from "@/components/PageStates";
import CardDetailSkeleton from "@/components/CardDetail/CardDetailSkeleton";
import {
  CardImageSection,
  CardStatsPanel,
  CardMetaBadges,
  VariantsTable,
  PriceLogPanel,
} from "@/components/CardDetail";
import LocaleToggle from "@/components/LocaleToggle";
import { useCurrentAndAdjacentCards } from "@/hooks/useCollectionCard";
import { useSets } from "@/hooks/useCollection";
import { flattenSeriesCards } from "@/utils/cardFilters";
import { findVariants } from "@/utils/cardVariants";
import { CDN_BASE_URL } from "@/services/Constants";
import { t, useLocale, isJaAvailable } from "@/i18n";
import type { CollectionCard } from "@/types/CollectionCard";
import type { CollectionParamKeys } from "@/types/routes";
import {
  parseSortAndNameRegex,
  buildCardDetailPath,
  slugify,
  i18nToEnString,
} from "@/utils/RoutePathBuildUtils";
import React from "react";
import { useNavigate, useParams } from "react-router-dom";

const CardDetailPage: React.FC = () => {
  const { seriesShortName, setShortName, sortByAndCardName } =
    useParams<CollectionParamKeys>();
  const { locale } = useLocale();
  const navigate = useNavigate();

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
  const { data: setsData } = useSets(seriesKey);

  if (error) return <PageError message="Failed to load card." />;
  if (isFetching && !data) return <CardDetailSkeleton />;
  if (!data?.card) return <PageNotFound message="Card not found." />;

  const { card, previousCard, nextCard } = data;
  const resolvedName = t(card.name, locale);
  const altLocale = locale === "en" ? "ja" : "en";
  const altName = isJaAvailable(card.name) ? t(card.name, altLocale) : "";
  const showAltName = altName !== "" && altName !== resolvedName;

  const allCards = flattenSeriesCards(setsData ?? []);
  const variants = findVariants(allCards, card);

  const cardSet = (setsData ?? []).find(
    (s) => s.set.short_name === card.set_short_name,
  )?.set;
  const backUrl = cardSet?.card_back
    ? `${CDN_BASE_URL}/${seriesKey}/${card.set_short_name}/00.jpg?v=2`
    : undefined;

  const goToVariant = (v: CollectionCard) =>
    navigate(
      buildCardDetailPath(
        v.series_short_name,
        v.set_short_name,
        v.sort_by,
        slugify(i18nToEnString(v.name)),
      ),
    );

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

  return (
    <div className="container mx-auto pt-2">
      <title>{pageTitle}</title>
      <meta name="description" content={pageDescription} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDescription} />
      {pageImage && <meta property="og:image" content={pageImage} />}
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={pageDescription} />
      {pageImage && <meta name="twitter:image" content={pageImage} />}

      <div className="anim-settle grid gap-y-6 lg:grid-cols-[408px_minmax(0,1fr)] lg:gap-x-9 lg:gap-y-8">
        <div className="flex flex-col gap-3.5 lg:col-start-2 lg:row-start-1">
          <div className="flex flex-col items-start gap-3 sm:flex-row sm:justify-between sm:gap-4">
            <h1
              key={locale}
              className="anim-settle text-primaryText flex flex-wrap items-baseline gap-x-3.5 leading-[1.2]"
            >
              {resolvedName}
              {showAltName && (
                <span
                  lang={altLocale}
                  className={`text-accentAmber text-[22px] font-normal text-shadow-none ${
                    altLocale === "ja" ? "font-jp" : ""
                  }`}
                >
                  {altName}
                </span>
              )}
            </h1>
            <LocaleToggle card={card} />
          </div>
          <CardMetaBadges card={card} />
        </div>

        <div className="lg:sticky lg:top-17.5 lg:col-start-1 lg:row-span-2 lg:row-start-1 lg:self-start">
          <CardImageSection
            card={card}
            resolvedName={resolvedName}
            previousCard={previousCard}
            nextCard={nextCard}
            backUrl={backUrl}
          />
        </div>

        <div className="flex min-w-0 flex-col gap-8 lg:col-start-2 lg:row-start-2">
          <div key={locale} className="anim-settle">
            <CardStatsPanel card={card} seriesKey={seriesKey} />
          </div>

          <VariantsTable
            variants={variants}
            currentCardId={card.id}
            onSelect={goToVariant}
          />

          <PriceLogPanel
            cardId={card.id}
            seriesShortName={seriesKey}
            averagePrice={card.average_price}
          />
        </div>
      </div>
    </div>
  );
};

export default CardDetailPage;

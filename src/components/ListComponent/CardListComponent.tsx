import { CollectionCard, hasI18nContent } from "@/types/CollectionCard";
import type { CollectionSet } from "@/types/CollectionSet";
import React from "react";
import IconText from "@/components/IconText";
import CardsListTile from "@/components/TileComponents/CardsListTile";
import HoverTooltip from "@/components/TileComponents/HoverTooltip";
import CardDetailRow from "@/components/CardDetail/CardDetailRow";
import AttacksSection from "@/components/CardDetail/AttacksSection";
import ZooAttackSection from "@/components/CardDetail/ZooAttackSection";
import { useParams } from "react-router-dom";
import { useLocale, t } from "@/i18n";
import { SeriesShortName } from "@/services/CollectionSeriesService";
import { PriceTag } from "@/components/ui";
import CardImage from "@/components/CardImage";
import { getCardBackUrl } from "@/utils/cardImage";
import { CARD_WIDTHS, CARD_RADII, type CardDensity } from "./cardDensity";
import { cdnResized, CDN_WIDTH } from "@/utils/cdnImage";
import { tagCardArt } from "@/utils/viewTransition";

export type { CardDensity };

export type GridItem =
  | { type: "card"; card: CollectionCard }
  | { type: "pack-art"; set: CollectionSet };

interface CardListProps {
  items: GridItem[];
  onClick: (card: CollectionCard) => void;
  onOpenPackArt: (set: CollectionSet) => void;
  density?: CardDensity;
  transitionNames?: boolean;
}

function tileTransition(
  enabled: boolean | undefined,
  name: string,
): React.CSSProperties | undefined {
  if (!enabled) return undefined;
  return {
    viewTransitionName: name,
    viewTransitionClass: "grid-item",
  } as React.CSSProperties;
}

function tooltipMinWidthRem(seriesShortName: string): number {
  switch (seriesShortName) {
    case SeriesShortName.oz:
      return 26;
    case SeriesShortName.mz:
      return 30;
    case SeriesShortName.ash:
      return 24;
    default:
      return 20;
  }
}

const CARD_PLACEHOLDER_TEXT: Record<CardDensity, string> = {
  s: "text-xs",
  m: "text-xl",
  l: "text-2xl",
};

const ZOOM_CLASSES =
  "relative w-full transition-transform duration-200 group-hover:scale-[1.04] group-focus-visible:scale-[1.04]";

const IMG_CLASSES =
  "border-secondaryBorder shadow-card group-focus-visible:border-hoverBorder block w-full border object-contain transition-colors duration-150";

const Caption: React.FC<{ tag: string; name: string }> = ({ tag, name }) => (
  <div className="mt-1.5 flex min-w-0 items-baseline gap-1.5 px-0.5">
    <span className="font-display text-secondaryText shrink-0 text-[10px]">
      {tag}
    </span>
    <span className="text-primaryText truncate text-[12.5px]">{name}</span>
  </div>
);

const CardList: React.FC<CardListProps> = ({
  items,
  onClick,
  onOpenPackArt,
  density,
  transitionNames,
}) => {
  const { seriesShortName } = useParams();
  const { locale } = useLocale();
  const series = seriesShortName ?? "";
  const radius = CARD_RADII[density ?? "m"];
  const placeholderText = CARD_PLACEHOLDER_TEXT[density ?? "m"];

  if (!items || items.length === 0) {
    return <div className="text-errorText text-center">No cards found.</div>;
  }

  return (
    <div
      className={
        density
          ? "anim-settle grid gap-x-2.5 gap-y-3.5"
          : "anim-settle grid grid-cols-2 gap-x-2.5 gap-y-3.5 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10"
      }
      style={
        density
          ? {
              gridTemplateColumns: `repeat(auto-fill, minmax(${CARD_WIDTHS[density]}, 1fr))`,
            }
          : undefined
      }
    >
      {items.map((item) => {
        if (item.type === "pack-art") {
          const { set } = item;
          return (
            <CardsListTile
              key={`pack-${set.id}`}
              style={tileTransition(transitionNames, `p-${set.id}`)}
              onClick={() => onOpenPackArt(set)}
            >
              <div className={ZOOM_CLASSES}>
                <img
                  src={cdnResized(
                    set.pack_art?.url ?? set.logo,
                    CDN_WIDTH.card,
                  )}
                  loading="lazy"
                  decoding="async"
                  alt={`${set.name} pack art`}
                  className={`${IMG_CLASSES} ${radius}`}
                />
                {set.pack_average_price != null &&
                  set.pack_average_price > 0 && (
                    <PriceTag
                      value={set.pack_average_price}
                      className="absolute top-1 right-1 z-10"
                    />
                  )}
              </div>
              <Caption tag="PACK" name={set.name} />
            </CardsListTile>
          );
        }

        const card = item.card;
        const name = t(card.name, locale);

        return (
          <CardsListTile
            key={card.id}
            style={tileTransition(transitionNames, `c-${card.id}`)}
            onClick={(e) => {
              tagCardArt(e.currentTarget.querySelector("img"));
              onClick(card);
            }}
          >
            <HoverTooltip
              minWidthRem={tooltipMinWidthRem(series)}
              content={
                <table className="card-dat card-dat-compact">
                  <tbody>
                    {card.effect && (
                      <CardDetailRow label="Effect">
                        <IconText text={card.effect} series={series} />
                      </CardDetailRow>
                    )}
                    <AttacksSection
                      attacks={card.attacks ?? []}
                      series={series}
                    />
                    <ZooAttackSection
                      attacks={card.zoo_attack ?? []}
                      series={series}
                    />
                    {series !== SeriesShortName.oz &&
                      series !== SeriesShortName.mz &&
                      hasI18nContent(card.description) && (
                        <CardDetailRow label="Flavor Text">
                          <div className="bg-mainBg border-bevelShadow2 border px-3 py-2 text-[13px] leading-[1.6] text-pretty italic shadow-[inset_2px_2px_0_rgba(0,0,0,0.5)]">
                            {t(card.description, locale)}
                          </div>
                        </CardDetailRow>
                      )}
                    {card.note && (
                      <CardDetailRow label="Note">{card.note}</CardDetailRow>
                    )}
                  </tbody>
                </table>
              }
            >
              <CardImage
                src={card.image}
                backSrc={getCardBackUrl(
                  card.series_short_name,
                  card.set_short_name,
                )}
                alt={name}
                className={ZOOM_CLASSES}
                cdnWidth={CDN_WIDTH.card}
                radiusClassName={radius}
                textClassName={placeholderText}
                imgClassName={`${IMG_CLASSES} max-h-65 ${radius}`}
              >
                {card.average_price != null && card.average_price > 0 && (
                  <PriceTag
                    value={card.average_price}
                    className="absolute top-1 right-1 z-10"
                  />
                )}
              </CardImage>
              <Caption tag={String(card.number).padStart(2, "0")} name={name} />
            </HoverTooltip>
          </CardsListTile>
        );
      })}
    </div>
  );
};

export default CardList;

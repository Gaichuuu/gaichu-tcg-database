import React from "react";
import { Link } from "react-router-dom";
import { isHolo } from "@/utils/cardVariants";
import { getSetListPath } from "@/utils/RoutePathBuildUtils";
import type { CollectionCard } from "@/types/CollectionCard";

interface CardMetaBadgesProps {
  card: CollectionCard;
}

const badgeBase = "border px-2.25 py-0.75 text-xs font-bold tracking-[0.025em]";
const linkHover =
  "transition-colors hover:border-hoverBorder focus-visible:border-hoverBorder focus-visible:outline-none";

const CardMetaBadges: React.FC<CardMetaBadgesProps> = ({ card }) => {
  const holo = isHolo(card);
  const setInfo = card.sets?.[0];
  const seriesPath = getSetListPath(card.series_short_name);

  return (
    <div className="flex flex-wrap items-center gap-2">
      {card.number != null && (
        <span className={`${badgeBase} border-tileBorder text-accentGreen`}>
          {card.number}
          {card.total_cards_count > 0 ? ` / ${card.total_cards_count}` : ""}
        </span>
      )}

      {card.variant && (
        <Link
          to={`${seriesPath}?variant=${encodeURIComponent(card.variant)}`}
          className={`${
            holo
              ? `${badgeBase} from-accentCyan to-accentGreen text-mainBg hover:text-mainBg border-tileBorder bg-linear-to-br`
              : `${badgeBase} border-tileBorder text-primaryText`
          } ${linkHover}`}
        >
          {card.variant}
          {holo ? " ✦" : ""}
        </Link>
      )}

      {card.rarity && (
        <Link
          to={`${seriesPath}?rarity=${encodeURIComponent(card.rarity)}`}
          className={`${badgeBase} border-tileBorder text-accentAmber hover:text-accentAmber uppercase ${linkHover}`}
        >
          {card.rarity}
        </Link>
      )}

      {setInfo && (
        <Link
          to={`${seriesPath}?sets=${encodeURIComponent(card.set_short_name)}`}
          className={`${badgeBase} border-tileBorder text-primaryText hover:text-primaryText ${linkHover}`}
        >
          {setInfo.name}
        </Link>
      )}
    </div>
  );
};

export default CardMetaBadges;

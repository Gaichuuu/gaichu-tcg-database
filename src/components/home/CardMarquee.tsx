import React from "react";
import { Link } from "react-router-dom";
import { slugify, buildCardDetailPath } from "@/utils/RoutePathBuildUtils";
import { useShowcaseCards } from "@/hooks/useShowcaseCards";

const CardMarquee: React.FC = () => {
  const { cards, isLoading } = useShowcaseCards(24);

  if (isLoading || cards.length === 0) return null;

  return (
    <div
      className="full-bleed marquee-fade overflow-hidden"
      role="region"
      aria-label="Showcase cards"
    >
      <div className="animate-marquee flex w-max gap-3 py-6">
        {[...cards, ...cards].map((card, i) => (
          <Link
            key={`${i < cards.length ? "a" : "b"}-${card.series}-${card.sortBy}`}
            to={buildCardDetailPath(
              card.series,
              card.set,
              card.sortBy,
              slugify(card.name),
            )}
            className="group relative block shrink-0"
            title={card.name}
          >
            <img
              src={card.image}
              alt={card.name}
              loading="lazy"
              fetchPriority="low"
              className="h-56 aspect-5/7 rounded-xl border border-secondaryBorder object-contain transition-transform duration-200 group-hover:scale-110 sm:h-72"
            />
            {card.averagePrice != null && card.averagePrice > 0 && (
              <span className="absolute top-1 right-1 rounded bg-black/70 px-1.5 py-0.5 text-xs text-white">
                ${card.averagePrice.toFixed(2)}
              </span>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default CardMarquee;

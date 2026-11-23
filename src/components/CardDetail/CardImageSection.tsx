import { useState } from "react";
import { FiRefreshCw } from "react-icons/fi";
import CardDetailPagingButton, {
  PagingType,
} from "@/components/ButtonComponents/CardDetailPagingButton";
import CardImage from "@/components/CardImage";
import useCardTilt from "@/hooks/useCardTilt";
import type { CollectionCard } from "@/types/CollectionCard";
import { getCardBackUrl } from "@/utils/cardImage";
import { getCardDetailPath } from "@/utils/RoutePathBuildUtils";
import { useNavigate } from "react-router-dom";
import {
  CARD_ART_VT,
  navigateWithTransition,
  setPagingDirection,
} from "@/utils/viewTransition";

interface CardImageSectionProps {
  card: CollectionCard;
  resolvedName: string;
  previousCard: CollectionCard | null;
  nextCard: CollectionCard | null;
  backUrl?: string;
}

const faceClasses =
  "border-secondaryBorder shadow-win backface-hidden absolute inset-0 h-full w-full rounded-[24px] border object-contain";

export default function CardImageSection({
  card,
  resolvedName,
  previousCard,
  nextCard,
  backUrl,
}: CardImageSectionProps) {
  const navigate = useNavigate();
  const [flipped, setFlipped] = useState(false);
  const canFlip = !!backUrl;
  const showingBack = canFlip && flipped;

  const {
    containerRef,
    overlayRef,
    handleMouseMove,
    handleMouseEnter,
    handleMouseLeave,
  } = useCardTilt();

  return (
    <div className="flex flex-col items-center">
      <div
        className="group relative mb-4 aspect-408/570 w-full max-w-102 shrink-0 perspective-distant"
        style={{ viewTransitionName: CARD_ART_VT }}
      >
        {/* Tilt layer */}
        <div
          ref={containerRef}
          onMouseMove={handleMouseMove}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className="relative h-full w-full rounded-[24px] transform-3d"
        >
          <div
            className="relative h-full w-full transition-transform duration-500 transform-3d"
            style={{ transform: showingBack ? "rotateY(180deg)" : undefined }}
          >
            <CardImage
              src={card.image}
              backSrc={
                backUrl ??
                getCardBackUrl(card.series_short_name, card.set_short_name)
              }
              alt={resolvedName}
              className="absolute inset-0 h-full w-full backface-hidden"
              imgClassName="border-secondaryBorder shadow-win h-full w-full rounded-[24px] border object-contain"
              radiusClassName="rounded-[24px]"
              textClassName="text-6xl"
              loading="eager"
              fetchPriority="high"
            />
            {canFlip && (
              <img
                src={backUrl}
                alt={`${resolvedName} card back`}
                loading="lazy"
                decoding="async"
                className={`${faceClasses} transform-[rotateY(180deg)]`}
              />
            )}
          </div>

          {/* Glare overlay */}
          <div
            ref={overlayRef}
            className="pointer-events-none absolute inset-0 rounded-[24px]"
            style={{ opacity: 0, mixBlendMode: "overlay" }}
          />
        </div>

        {canFlip && (
          <button
            type="button"
            onClick={() => setFlipped((f) => !f)}
            aria-pressed={showingBack}
            aria-label={showingBack ? "Show card front" : "Flip card"}
            className="bg-overlayBg/70 text-primaryText hover:bg-overlayBg/90 focus-visible:ring-primaryBorder absolute top-12 right-3 z-10 inline-flex items-center gap-1.5 px-2 py-1 font-mono text-[11px] font-bold opacity-0 transition group-hover:opacity-100 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:outline-none [@media(hover:none)]:opacity-100"
          >
            <FiRefreshCw className="h-3.5 w-3.5" />
            {showingBack ? "FRONT" : "FLIP"}
          </button>
        )}
      </div>

      <div className="mt-0 flex w-full max-w-xs gap-4">
        {previousCard && (
          <CardDetailPagingButton
            pagingType={PagingType.Previous}
            card={previousCard}
            onClick={() => {
              setPagingDirection("prev");
              navigateWithTransition(() =>
                navigate(getCardDetailPath(previousCard)),
              );
            }}
          />
        )}
        {nextCard && (
          <CardDetailPagingButton
            pagingType={PagingType.Next}
            card={nextCard}
            onClick={() => {
              setPagingDirection("next");
              navigateWithTransition(() =>
                navigate(getCardDetailPath(nextCard)),
              );
            }}
          />
        )}
      </div>
    </div>
  );
}

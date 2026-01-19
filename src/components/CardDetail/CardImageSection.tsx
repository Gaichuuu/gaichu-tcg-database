import CardDetailPagingButton, {
  PagingType,
} from "@/components/ButtonComponents/CardDetailPagingButton";
import type { CollectionCard } from "@/types/CollectionCard";
import { getCardDetailPath } from "@/utils/RoutePathBuildUtils";
import { useNavigate } from "react-router-dom";

interface CardImageSectionProps {
  card: CollectionCard;
  resolvedName: string;
  previousCard: CollectionCard | null;
  nextCard: CollectionCard | null;
}

export default function CardImageSection({
  card,
  resolvedName,
  previousCard,
  nextCard,
}: CardImageSectionProps) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center md:w-1/3">
      <img
        src={card.image}
        alt={resolvedName}
        className="border-secondaryBorder mb-4 block max-h-150 rounded-3xl border object-contain shadow"
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
  );
}

import CardDetailPagingButton, {
  PagingType,
} from "@/components/ButtonComponents/CardDetailPagingButton";
import TiltableImage from "@/components/TiltableImage";
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
    <div className="flex flex-col items-center">
      <TiltableImage
        key={card.image}
        src={card.image}
        alt={resolvedName}
        className="mb-4 shrink-0 rounded-3xl"
        imgClassName="border-secondaryBorder block h-142.5 w-102 border shadow"
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

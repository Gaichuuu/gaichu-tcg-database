// src/pages/SetPage.tsx
import CardList from "@/components/ListComponens/CardListComponent";
import { useCards } from "@/hooks/useCollection";
import { getCardDetailPath } from "@/utils/RoutePathBuildUtils";
import { useNavigate, useParams } from "react-router-dom";

const SetPage = () => {
  const { seriesShortName, setShortName } = useParams();
  const { data: collectionCards, error } = useCards(
    seriesShortName ?? "",
    setShortName ?? "",
  );
  const navigate = useNavigate();

  if (!setShortName || error) {
    return <div className="container mx-auto p-4">Set not found</div>;
  }

  const mockSet = {
    description:
      "This reprint removes Pokémon trademarks from the packaging and official names of the Pokémon changed to parody names. The card back is also changed. However, Pokémon trademarks and official names still remain on many card attacks and descriptions.",
    images: [
      {
        url: "/images/wm/pack.jpg",
        label: "Pack Art",
      },
      {
        url: "/images/wm/card-back.jpg",
        label: "Card Back",
      },
    ],
  };

  return (
    <div className="container mx-auto p-4">
      <div className="mb-2 flex">
        <div className="flex flex-row">
          {mockSet.images.map((img) => (
            <div
              key={img.url}
              className="flex flex-col items-center p-2 duration-200 hover:scale-110"
            >
              <img
                src="https://gaichu.b-cdn.net/wm/set1/00.jpg"
                alt={img.label}
                className="mb-1 block max-h-[100px] w-full rounded object-contain transition-transform duration-200"
              />
              <span className="text-primaryText w-full text-center font-mono text-xs">
                {img.label}
              </span>
            </div>
          ))}
        </div>

        <div className="flex-1 pl-4">
          <h2 className="text-primaryText mb-2 font-mono text-xl">
            Set One (Reprint)
          </h2>
          <p className="text-primaryText max-w-2xl font-mono text-xs whitespace-pre-line">
            {mockSet.description}
          </p>
        </div>
      </div>

      <CardList
        collectionCards={collectionCards ?? []}
        onClick={(card) => {
          navigate(getCardDetailPath(card));
        }}
      />
    </div>
  );
};

export default SetPage;

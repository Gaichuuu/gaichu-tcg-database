// src/pages/SetPage.tsx
import CardList from "@/components/ListComponens/CardListComponent";
import { useSet } from "@/hooks/useCollection";
import { getCardDetailPath } from "@/utils/RoutePathBuildUtils";
import { useNavigate, useParams } from "react-router-dom";

const SetPage = () => {
  const { seriesShortName, setShortName } = useParams();
  const { data: setAndCard, error: setError } = useSet(
    seriesShortName,
    setShortName,
  );
  const navigate = useNavigate();

  if (!setShortName || setError) {
    return <div className="container mx-auto p-4">Set not found</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="mb-2 flex">
        <div className="flex flex-row">
          {setAndCard?.set.set_images?.map((img) => (
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
            {setAndCard?.set.name}
          </h2>
          <p className="text-primaryText max-w-2xl font-mono text-xs whitespace-pre-line">
            {setAndCard?.set.description}
          </p>
        </div>
      </div>

      <CardList
        collectionCards={setAndCard?.cards ?? []}
        onClick={(card) => {
          navigate(getCardDetailPath(card));
        }}
      />
    </div>
  );
};

export default SetPage;

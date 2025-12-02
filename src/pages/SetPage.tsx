// src/pages/SetPage.tsx
import CardList from "@/components/ListComponent/CardListComponent";
import { useSet } from "@/hooks/useCollection";
import {
  getArtPath,
  getCardDetailPath,
  getTitleSetImagePathType,
  SetImagePathType,
} from "@/utils/RoutePathBuildUtils";
import { useNavigate, useParams } from "react-router-dom";
import HtmlCell from "@/components/HtmlCell";

const SetPage = () => {
  const { seriesShortName, setShortName } = useParams();
  const { data: setAndCard, error: setError } = useSet(
    seriesShortName,
    setShortName,
  );
  const navigate = useNavigate();

  if (!setShortName || setError) {
    return <div className="container mx-auto pt-1">Set not found</div>;
  }

  const printFileUrl =
    setAndCard?.set.print_file_url ??
    (seriesShortName === "oz" && setShortName === "legacy"
      ? "https://gaichu.b-cdn.net/oz/legacy/legacyPrint.pdf"
      : undefined);

  return (
    <div className="container mx-auto pt-1 pb-1">
      <div className="mb-2 flex">
        <div className="flex flex-row">
          {setAndCard?.set.set_images?.map((img) => (
            <div
              key={img.url}
              className="flex cursor-pointer flex-col items-center p-1.5 duration-200 hover:scale-110"
              onClick={() => {
                navigate(
                  getArtPath(setAndCard?.set, img.pathType as SetImagePathType),
                );
              }}
            >
              <img
                src={img.url}
                alt={getTitleSetImagePathType(img.pathType as SetImagePathType)}
                className="border-secondaryBorder mb-0 block max-h-[100px] w-full rounded border-1 object-contain transition-transform duration-200"
              />
              <span className="mt-0.5 w-full text-center text-xs">
                {getTitleSetImagePathType(img.pathType as SetImagePathType)}
              </span>
            </div>
          ))}
        </div>

        <div className="flex-1 pl-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold">{setAndCard?.set.name}</h3>

            {printFileUrl && (
              <a
                href={printFileUrl}
                target="_blank"
                className="secondary-button"
              >
                Print
              </a>
            )}
          </div>

          <p className="max-w-2xl text-sm whitespace-pre-line">
            <HtmlCell html={setAndCard?.set.description} />
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

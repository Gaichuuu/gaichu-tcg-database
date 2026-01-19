// src/pages/SetPage.tsx
import HtmlCell from "@/components/HtmlCell";
import CardList from "@/components/ListComponent/CardListComponent";
import { useSet } from "@/hooks/useCollection";
import { CDN_BASE_URL } from "@/services/Constants";
import {
  getArtPath,
  getCardDetailPath,
  getTitleSetImagePathType,
  SetImagePathType,
} from "@/utils/RoutePathBuildUtils";
import { useNavigate, useParams } from "react-router-dom";

const SetPage = () => {
  const { seriesShortName, setShortName } = useParams();
  const { data: setAndCard, error: setError } = useSet(
    seriesShortName ?? "",
    setShortName ?? "",
  );
  const navigate = useNavigate();

  if (!setShortName || setError) {
    return <div className="container mx-auto pt-1">Set not found</div>;
  }

  const printFileUrl =
    setAndCard?.set.print_file_url ??
    (seriesShortName === "oz" && setShortName === "legacy"
      ? `${CDN_BASE_URL}/oz/legacy/legacyPrint.pdf`
      : undefined);

  const buyUrl =
    setAndCard?.set.buy_url ??
    (seriesShortName === "oz" && setShortName === "legacy"
      ? "https://www.thegamecrafter.com/games/openzoo-legacy"
      : undefined);

  const imageTiles: Array<{ url: string; pathType: SetImagePathType }> = [];
  if (setAndCard?.set.pack_art) {
    imageTiles.push({
      url: setAndCard.set.pack_art.url,
      pathType: SetImagePathType.PackArt,
    });
  }
  if (setAndCard?.set.card_back) {
    imageTiles.push({
      url: setAndCard.set.card_back.url,
      pathType: SetImagePathType.CardBack,
    });
  }

  return (
    <div className="container mx-auto pt-1 pb-1">
      <div className="mb-2 flex">
        <div className="flex flex-row">
          {imageTiles.map((img) => (
            <div
              key={img.url}
              className="flex cursor-pointer flex-col items-center p-1.5 duration-200 hover:scale-110"
              onClick={() => {
                navigate(getArtPath(setAndCard?.set, img.pathType));
              }}
            >
              <img
                src={img.url}
                alt={getTitleSetImagePathType(img.pathType)}
                className="border-secondaryBorder mb-0 block max-h-25 w-full rounded border object-contain transition-transform duration-200"
              />
              <span className="mt-0.5 w-full text-center text-xs">
                {getTitleSetImagePathType(img.pathType)}
              </span>
            </div>
          ))}
        </div>

        <div className="flex-1 pl-4">
          <div className="flex items-center">
            <h3 className="text-lg font-bold">{setAndCard?.set.name}</h3>

            <div className="ml-auto flex items-center gap-2">
              {buyUrl && (
                <a href={buyUrl} target="_blank" className="secondary-button">
                  Buy
                </a>
              )}

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

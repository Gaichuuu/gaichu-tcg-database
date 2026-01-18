// src/pages/CardBackPage.tsx
import React, { useMemo } from "react";
import { useParams } from "react-router-dom";
import { useSet } from "@/hooks/useCollection";
import {
  getTitleSetImagePathType,
  SetImagePathType,
} from "@/utils/RoutePathBuildUtils";
import type { ArtParamKeys } from "@/types/routes";

const CardBackPage: React.FC = () => {
  const { seriesShortName = "", setShortName = "" } = useParams<ArtParamKeys>();
  const seriesKey = decodeURIComponent(seriesShortName);
  const setKey = decodeURIComponent(setShortName);

  const { data: setAndCard, error: setError } = useSet(seriesKey, setKey);

  const cardBack = useMemo(
    () =>
      setAndCard?.set.set_images?.find(
        (img) => img.pathType === SetImagePathType.CardBack,
      ),
    [setAndCard],
  );

  const backUrl =
    seriesKey && setKey
      ? `https://gaichu.b-cdn.net/${seriesKey}/${setKey}/00.jpg?v=2`
      : "";

  if (setError || !cardBack) return <p>Not found.</p>;

  return (
    <div className="container mx-auto pt-2">
      <div className="flex flex-col gap-6 md:flex-row">
        <div className="flex flex-col items-center md:w-1/3">
          {backUrl && (
            <img
              src={backUrl}
              alt={getTitleSetImagePathType(SetImagePathType.CardBack)}
              className="border-secondaryBorder mb-4 block max-h-150 rounded-3xl border object-contain shadow"
            />
          )}
          <div className="mt-0 flex w-full max-w-xs gap-4" />
        </div>

        <div className="md:w-2/3">
          <h1 className="mb-4">
            {getTitleSetImagePathType(SetImagePathType.CardBack)}
          </h1>
          <table className="w-full border-collapse">
            <tbody>
              {cardBack.text && (
                <tr>
                  <th className="py-2 pr-4 text-left">Text</th>
                  <td className="py-2">{cardBack.text}</td>
                </tr>
              )}
              {cardBack.illustrator && (
                <tr>
                  <th className="py-2 pr-4 text-left">Illustrator</th>
                  <td className="py-2">{cardBack.illustrator}</td>
                </tr>
              )}
              {cardBack.note && (
                <tr>
                  <th className="py-2 pr-4 text-left">Note</th>
                  <td className="py-2">{cardBack.note}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CardBackPage;

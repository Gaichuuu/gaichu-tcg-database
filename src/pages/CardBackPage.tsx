// src/pages/CardBackPage.tsx
import { ArtParams } from "@/App";
import { useSet } from "@/hooks/useCollection";
import {
  getTitleSetImagePathType,
  SetImagePathType,
} from "@/utils/RoutePathBuildUtils";
import React from "react";
import { useParams } from "react-router-dom";
const CardBackPage: React.FC = () => {
  const { seriesShortName, setShortName } = useParams<ArtParams>();
  const { data: setAndCard, error: setError } = useSet(
    seriesShortName,
    setShortName,
  );
  const pack = setAndCard?.set.set_images?.find(
    (img) => img.pathType === SetImagePathType.CardBack,
  );

  if (setError || !pack) return <p>Not found.</p>;

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col gap-6 md:flex-row">
        <div className="flex flex-col items-center md:w-1/3">
          <img
            src={`https://gaichu.b-cdn.net/${seriesShortName}/${setShortName}/00.jpg`}
            className="border-secondaryBorder mb-4 block max-h-[600px] rounded-3xl border-1 object-contain shadow"
          />
          <div className="mt-0 flex w-full max-w-xs gap-4"></div>
        </div>
        <div className="md:w-2/3">
          <h2 className="mb-4 text-3xl">
            {getTitleSetImagePathType(SetImagePathType.CardBack)}
          </h2>

          <table className="w-full border-collapse">
            <tbody>
              {pack?.text && (
                <tr>
                  <th className="py-2 pr-4 text-left">Text</th>
                  <td className="py-2">{pack?.text}</td>
                </tr>
              )}
              {pack?.illustrator && (
                <tr>
                  <th className="py-2 pr-4 text-left">Illustrator</th>
                  <td className="py-2">{pack?.illustrator}</td>
                </tr>
              )}
              {pack?.note && (
                <tr>
                  <th className="py-2 pr-4 text-left">Note</th>
                  <td className="py-2">{pack?.note}</td>
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

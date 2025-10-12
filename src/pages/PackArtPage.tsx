// src/pages/PackArtPage.tsx
import { ArtParams } from "@/App";
import { useSet } from "@/hooks/useCollection";
import {
  getTitleSetImagePathType,
  SetImagePathType,
} from "@/utils/RoutePathBuildUtils";
import React, { useState } from "react";
import { useParams } from "react-router-dom";

const PackArtPage: React.FC = () => {
  const { seriesShortName, setShortName } = useParams<ArtParams>();
  const { data: setAndCard, error: setError } = useSet(
    seriesShortName,
    setShortName,
  );

  const [selectedIndex, setSelectedIndex] = useState(0);
  const pack = setAndCard?.set.set_images?.find(
    (img) => img.pathType === SetImagePathType.PackArt,
  );

  const packArts = pack?.packs;

  if (setError || !pack) return <p>Not found.</p>;

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col gap-6 md:flex-row">
        <div className="flex flex-col items-center md:w-1/3">
          <img
            src={packArts![selectedIndex].url}
            alt={getTitleSetImagePathType(SetImagePathType.PackArt)}
            className="border-secondaryBorder mb-4 block max-h-[600px] border-1 object-contain shadow"
          />

          <div className="mt-2 flex gap-2">
            {packArts?.map((img, idx) => (
              <button
                key={img.url}
                className={`rounded border-2 p-0.5 shadow-sm ${
                  idx === selectedIndex
                    ? "border-blue-400"
                    : "border-transparent opacity-80 hover:opacity-100"
                }`}
                onClick={() => setSelectedIndex(idx)}
                tabIndex={0}
              >
                <img
                  src={img.url}
                  alt={img.label}
                  className="h-16 w-16 rounded object-cover"
                />
              </button>
            ))}
          </div>
        </div>
        <div className="md:w-2/3">
          <h1 className="mb-4">
            {getTitleSetImagePathType(SetImagePathType.PackArt)}
          </h1>
          <table className="w-full border-collapse">
            <tbody>
              {pack?.frontDescription && (
                <tr>
                  <th className="py-2 pr-4 text-left">Front Text</th>
                  <td className="py-2" style={{ whiteSpace: "pre-wrap" }}>
                    {pack?.frontDescription}
                  </td>
                </tr>
              )}
              {pack?.backDescription && (
                <tr>
                  <th className="py-2 pr-4 text-left">Back Text</th>
                  <td className="py-2" style={{ whiteSpace: "pre-wrap" }}>
                    {pack?.backDescription}
                  </td>
                </tr>
              )}
              {pack?.illustrator && (
                <tr>
                  <th className="py-2 pr-4 text-left">Illustrator</th>
                  <td className="py-2">{pack!.illustrator}</td>
                </tr>
              )}
              {pack?.note && (
                <tr>
                  <th className="py-2 pr-4 text-left">Note</th>
                  <td className="py-2">{pack!.note}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PackArtPage;

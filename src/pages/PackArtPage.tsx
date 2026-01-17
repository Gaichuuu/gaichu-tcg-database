// src/pages/PackArtPage.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useSet } from "@/hooks/useCollection";
import {
  getTitleSetImagePathType,
  SetImagePathType,
} from "@/utils/RoutePathBuildUtils";
import type { ArtParamKeys } from "@/types/routes";

const PackArtPage: React.FC = () => {
  const { seriesShortName = "", setShortName = "" } = useParams<ArtParamKeys>();

  const seriesKey = decodeURIComponent(seriesShortName);
  const setKey = decodeURIComponent(setShortName);

  const { data: setAndCard, error: setError } = useSet(seriesKey, setKey);

  const pack = useMemo(
    () =>
      setAndCard?.set.set_images?.find(
        (img) => img.pathType === SetImagePathType.PackArt,
      ),
    [setAndCard],
  );

  const packArts = pack?.packs ?? [];
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    setSelectedIndex(0);
  }, [packArts.length]);

  const current = packArts[selectedIndex];

  if (setError || !pack || packArts.length === 0) {
    return <p>Not found.</p>;
  }

  return (
    <div className="container mx-auto pt-2">
      <div className="flex flex-col gap-6 md:flex-row">
        <div className="flex flex-col items-center md:w-1/3">
          {current && (
            <img
              src={current.url}
              alt={getTitleSetImagePathType(SetImagePathType.PackArt)}
              className="border-secondaryBorder mb-4 block max-h-150 border object-contain shadow"
            />
          )}

          <div className="mt-2 flex flex-wrap gap-2">
            {packArts.map((img, idx) => (
              <button
                key={img.url}
                type="button"
                className={`rounded border-2 p-0.5 shadow-sm ${
                  idx === selectedIndex
                    ? "border-primaryBorder opacity-100"
                    : "border-transparent opacity-80 hover:opacity-100"
                }`}
                onClick={() => setSelectedIndex(idx)}
              >
                <img
                  src={img.url}
                  alt={img.label ?? "pack"}
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
              {pack.frontDescription && (
                <tr>
                  <th className="py-2 pr-4 text-left">Front Text</th>
                  <td className="py-2" style={{ whiteSpace: "pre-wrap" }}>
                    {pack.frontDescription}
                  </td>
                </tr>
              )}
              {pack.backDescription && (
                <tr>
                  <th className="py-2 pr-4 text-left">Back Text</th>
                  <td className="py-2" style={{ whiteSpace: "pre-wrap" }}>
                    {pack.backDescription}
                  </td>
                </tr>
              )}
              {pack.illustrator && (
                <tr>
                  <th className="py-2 pr-4 text-left">Illustrator</th>
                  <td className="py-2">{pack.illustrator}</td>
                </tr>
              )}
              {pack.note && (
                <tr>
                  <th className="py-2 pr-4 text-left">Note</th>
                  <td className="py-2">{pack.note}</td>
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

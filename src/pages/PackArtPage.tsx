// src/pages/PackArtPage.tsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useSet } from "@/hooks/useCollection";
import { CardDetailRow } from "@/components/CardDetail";
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

  const packArt = setAndCard?.set.pack_art;
  const packArts = packArt?.packs ?? [];
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    setSelectedIndex(0);
  }, [packArts.length]);

  const current = packArts[selectedIndex];

  if (setError || !packArt || packArts.length === 0) {
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
              {packArt.frontDescription && (
                <CardDetailRow label="Front Text">
                  <span style={{ whiteSpace: "pre-wrap" }}>
                    {packArt.frontDescription}
                  </span>
                </CardDetailRow>
              )}
              {packArt.backDescription && (
                <CardDetailRow label="Back Text">
                  <span style={{ whiteSpace: "pre-wrap" }}>
                    {packArt.backDescription}
                  </span>
                </CardDetailRow>
              )}
              {packArt.illustrator && (
                <CardDetailRow label="Illustrator">
                  {packArt.illustrator}
                </CardDetailRow>
              )}
              {packArt.note && (
                <CardDetailRow label="Note">{packArt.note}</CardDetailRow>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PackArtPage;

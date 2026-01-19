// src/pages/CardBackPage.tsx
import React from "react";
import { useParams } from "react-router-dom";
import { useSet } from "@/hooks/useCollection";
import { CardDetailRow } from "@/components/CardDetail";
import { CDN_BASE_URL } from "@/services/Constants";
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

  const cardBack = setAndCard?.set.card_back;

  const backUrl =
    seriesKey && setKey
      ? `${CDN_BASE_URL}/${seriesKey}/${setKey}/00.jpg?v=2`
      : "";

  if (setError || !cardBack) return <p>Not found.</p>;

  // SEO metadata
  const setName = setAndCard?.set.name || "Set";
  const pageTitle = `Card Back - ${setName} - Gaichu`;
  const pageDescription = cardBack.text
    ? `Card back design for ${setName}. ${cardBack.text}`
    : `View the card back design for ${setName} on Gaichu.`;
  const pageImage = cardBack.url || backUrl;

  return (
    <div className="container mx-auto pt-2">
      {/* React 19 native metadata */}
      <title>{pageTitle}</title>
      <meta name="description" content={pageDescription} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDescription} />
      {pageImage && <meta property="og:image" content={pageImage} />}

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
                <CardDetailRow label="Text">{cardBack.text}</CardDetailRow>
              )}
              {cardBack.illustrator && (
                <CardDetailRow label="Illustrator">
                  {cardBack.illustrator}
                </CardDetailRow>
              )}
              {cardBack.note && (
                <CardDetailRow label="Note">{cardBack.note}</CardDetailRow>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CardBackPage;

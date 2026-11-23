import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useSet } from "@/hooks/useCollection";
import { CardDetailRow } from "@/components/CardDetail";
import {
  getTitleSetImagePathType,
  SetImagePathType,
} from "@/utils/RoutePathBuildUtils";
import type { ArtParamKeys } from "@/types/routes";
import { t, useLocale, isJaAvailable } from "@/i18n";
import { PageError, PageNotFound } from "@/components/PageStates";
import CardDetailSkeleton from "@/components/CardDetail/CardDetailSkeleton";
import LocaleToggle from "@/components/LocaleToggle";
import TiltableImage from "@/components/TiltableImage";
import PackPriceLogPanel from "@/components/CardDetail/PackPriceLogPanel";
import { Tile } from "@/components/ui";
import { cdnResized, CDN_WIDTH } from "@/utils/cdnImage";

const PackArtPage: React.FC = () => {
  const { seriesShortName = "", setShortName = "" } = useParams<ArtParamKeys>();
  const { locale } = useLocale();

  const seriesKey = decodeURIComponent(seriesShortName);
  const setKey = decodeURIComponent(setShortName);

  const {
    data: setAndCard,
    error: setError,
    isLoading,
  } = useSet(seriesKey, setKey);

  const packArt = setAndCard?.set.pack_art;
  const packArts = packArt?.packs ?? [];
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    setSelectedIndex(0);
  }, [packArts.length]);

  const current = packArts[selectedIndex];

  if (setError) return <PageError message="Failed to load pack art." />;
  if (isLoading && !setAndCard)
    return <CardDetailSkeleton label="Loading pack art…" />;
  if (!packArt || packArts.length === 0)
    return <PageNotFound message="Pack art not found." />;

  const set = setAndCard?.set;
  const setName = set?.name || "Set";
  const pageTitle = `Pack Art - ${setName} - Gaichu`;
  const frontText = t(packArt.frontDescription, "en");
  const pageDescription = frontText
    ? `Pack art for ${setName}. ${frontText.slice(0, 150)}...`
    : `View the pack art for ${setName} on Gaichu.`;
  const pageImage = packArt.url;

  const hasJaLocale =
    isJaAvailable(packArt.frontDescription) ||
    isJaAvailable(packArt.backDescription);

  return (
    <div className="container mx-auto pt-2">
      <title>{pageTitle}</title>
      <meta name="description" content={pageDescription} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDescription} />
      {pageImage && <meta property="og:image" content={pageImage} />}

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <div className="flex flex-col items-center lg:sticky lg:top-17.5 lg:w-102 lg:shrink-0">
          {current && (
            <TiltableImage
              key={current.url}
              src={current.url}
              alt={getTitleSetImagePathType(SetImagePathType.PackArt)}
              className="mb-4 shrink-0"
              imgClassName="border-secondaryBorder shadow-win block max-h-150 w-full border object-contain"
            />
          )}

          <div className="mt-2 flex flex-wrap gap-2">
            {packArts.map((img, idx) => (
              <button
                key={img.url}
                type="button"
                aria-pressed={idx === selectedIndex}
                aria-label={img.label ?? `Pack image ${idx + 1}`}
                className={`border-2 p-0.5 transition-colors focus-visible:outline-none ${
                  idx === selectedIndex
                    ? "border-hoverBorder"
                    : "border-tileBorder hover:border-hoverBorder focus-visible:border-hoverBorder"
                }`}
                onClick={() => setSelectedIndex(idx)}
              >
                <img
                  src={cdnResized(img.url, CDN_WIDTH.thumb)}
                  alt=""
                  className="block size-16 object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-6">
          <div>
            <div className="flex flex-col items-start gap-2 sm:flex-row sm:justify-between sm:gap-x-4">
              <div className="min-w-0">
                <h1 className="text-primaryText">Pack Art</h1>
                <div className="mt-3">
                  <span className="border-tileBorder text-primaryText border px-2.25 py-0.75 text-xs font-bold tracking-[0.025em]">
                    {setName}
                  </span>
                </div>
              </div>
              <LocaleToggle jaAvailable={hasJaLocale} />
            </div>
          </div>

          <Tile className="px-5">
            <table className="card-dat">
              <tbody>
                {packArt.frontDescription && (
                  <CardDetailRow label="Front Text">
                    <span style={{ whiteSpace: "pre-wrap" }}>
                      {t(packArt.frontDescription, locale)}
                    </span>
                  </CardDetailRow>
                )}
                {packArt.backDescription && (
                  <CardDetailRow label="Back Text">
                    <span style={{ whiteSpace: "pre-wrap" }}>
                      {t(packArt.backDescription, locale)}
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
          </Tile>

          {set && (
            <PackPriceLogPanel
              setId={set.id}
              seriesShortName={set.series_short_name}
              packAveragePrice={set.pack_average_price}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default PackArtPage;

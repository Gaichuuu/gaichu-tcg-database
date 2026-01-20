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
import { t, useLocale, type I18nValue } from "@/i18n";

function isJaAvailable(v: I18nValue | undefined): boolean {
  return (
    v != null &&
    typeof v === "object" &&
    typeof v.ja === "string" &&
    v.ja.trim() !== ""
  );
}

const PackArtPage: React.FC = () => {
  const { seriesShortName = "", setShortName = "" } = useParams<ArtParamKeys>();
  const { locale, setLocale } = useLocale();

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

  // SEO metadata
  const setName = setAndCard?.set.name || "Set";
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
      {/* React 19 native metadata */}
      <title>{pageTitle}</title>
      <meta name="description" content={pageDescription} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDescription} />
      {pageImage && <meta property="og:image" content={pageImage} />}

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
          <div className="flex items-start justify-between gap-3">
            <h1 className="mb-4">
              {getTitleSetImagePathType(SetImagePathType.PackArt)}
            </h1>
            {hasJaLocale && (
              <div
                role="group"
                aria-label="Language toggle"
                className="group/toggle border-secondaryBorder mb-3 inline-flex items-center gap-1 rounded-2xl border p-1 shadow-sm transition-colors"
              >
                <button
                  type="button"
                  onClick={() => setLocale("en")}
                  aria-pressed={locale === "en"}
                  className={`flex-1 rounded-xl px-4 py-2 text-sm transition outline-none ${
                    locale === "en"
                      ? "bg-primaryButton text-mainBg"
                      : "text-secondaryText hover:text-primaryText hover:bg-navBg hover:border-hoverBorder cursor-pointer border border-transparent"
                  }`}
                >
                  English
                </button>
                <button
                  type="button"
                  onClick={() => setLocale("ja")}
                  aria-pressed={locale === "ja"}
                  className={`flex-1 rounded-xl px-4 py-2 text-sm transition outline-none ${
                    locale === "ja"
                      ? "bg-primaryButton text-mainBg"
                      : "text-secondaryText hover:text-primaryText hover:bg-navBg hover:border-hoverBorder cursor-pointer border border-transparent"
                  }`}
                >
                  日本語
                </button>
              </div>
            )}
          </div>
          <table className="w-full border-collapse">
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
        </div>
      </div>
    </div>
  );
};

export default PackArtPage;

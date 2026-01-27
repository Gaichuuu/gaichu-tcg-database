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
import { t, useLocale, type I18nValue } from "@/i18n";

function isJaAvailable(v: I18nValue | undefined): boolean {
  return (
    v != null &&
    typeof v === "object" &&
    typeof v.ja === "string" &&
    v.ja.trim() !== ""
  );
}

const CardBackPage: React.FC = () => {
  const { seriesShortName = "", setShortName = "" } = useParams<ArtParamKeys>();
  const { locale, setLocale } = useLocale();
  const seriesKey = decodeURIComponent(seriesShortName);
  const setKey = decodeURIComponent(setShortName);

  const { data: setAndCard, error: setError } = useSet(seriesKey, setKey);

  const cardBack = setAndCard?.set.card_back;

  const backUrl =
    seriesKey && setKey
      ? `${CDN_BASE_URL}/${seriesKey}/${setKey}/00.jpg?v=2`
      : "";

  if (setError || !cardBack) return <p>Not found.</p>;

  const setName = setAndCard?.set.name || "Set";
  const pageTitle = `Card Back - ${setName} - Gaichu`;
  const textForSeo = t(cardBack.text, "en");
  const pageDescription = textForSeo
    ? `Card back design for ${setName}. ${textForSeo}`
    : `View the card back design for ${setName} on Gaichu.`;
  const pageImage = cardBack.url || backUrl;

  const hasJaLocale = isJaAvailable(cardBack.text);

  return (
    <div className="container mx-auto pt-2">
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
          <div className="flex items-start justify-between gap-3">
            <h1 className="mb-4">
              {getTitleSetImagePathType(SetImagePathType.CardBack)}
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
              {cardBack.text && (
                <CardDetailRow label="Text">
                  {t(cardBack.text, locale)}
                </CardDetailRow>
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

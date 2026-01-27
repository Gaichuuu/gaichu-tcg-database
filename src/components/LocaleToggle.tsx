import React, { useMemo } from "react";
import { useLocale, I18nValue } from "@/i18n";
import type { CollectionCard } from "@/types/CollectionCard";

type Props = { card?: CollectionCard };

function isJaAvailable(v: I18nValue | undefined): boolean {
  return (
    v != null &&
    typeof v === "object" &&
    typeof v.ja === "string" &&
    v.ja.trim() !== ""
  );
}

function hasJA(card?: CollectionCard): boolean {
  if (!card) return false;
  if (isJaAvailable(card.name) || isJaAvailable(card.description)) return true;
  if (
    Array.isArray(card.attacks) &&
    card.attacks.some((a) => isJaAvailable(a?.name) || isJaAvailable(a?.effect))
  )
    return true;
  return false;
}

const LocaleToggle: React.FC<Props> = ({ card }) => {
  const { locale, setLocale } = useLocale();
  const jaAvailable = useMemo(() => hasJA(card), [card]);

  if (!jaAvailable) return null;

  const stopDown = (e: React.SyntheticEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };
  const stopBubble = (e: React.SyntheticEvent) => {
    e.stopPropagation();
  };

  return (
    <div
      role="group"
      aria-label="Language toggle"
      className="group/toggle border-secondaryBorder mb-3 inline-flex items-center gap-1 rounded-2xl border p-1 shadow-sm transition-colors"
      onPointerDownCapture={stopDown}
      onMouseDownCapture={stopDown}
      onTouchStartCapture={stopDown}
      onClick={stopBubble}
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setLocale("en");
        }}
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
        onClick={(e) => {
          e.stopPropagation();
          setLocale("ja");
        }}
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
  );
};

export default LocaleToggle;

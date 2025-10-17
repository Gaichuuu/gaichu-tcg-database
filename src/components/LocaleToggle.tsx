// src/components/LocaleToggle.tsx
import React, { useMemo } from "react";
import { useLocale } from "@/i18n/locale";

type Props = { card?: any };

function hasJA(card?: any): boolean {
  if (!card) return false;
  const isJa = (v: any) =>
    v &&
    typeof v === "object" &&
    typeof v.ja === "string" &&
    v.ja.trim() !== "";
  if (isJa(card.name) || isJa(card.description)) return true;
  if (
    Array.isArray(card.attacks) &&
    card.attacks.some((a: any) => isJa(a?.name) || isJa(a?.effect))
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

import React, { useMemo } from "react";
import { useLocale, isJaAvailable } from "@/i18n";
import type { CollectionCard } from "@/types/CollectionCard";
import { buttonClasses } from "@/components/ui";

interface Props {
  card?: CollectionCard;
  jaAvailable?: boolean;
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

const LocaleToggle: React.FC<Props> = ({ card, jaAvailable }) => {
  const { locale, setLocale } = useLocale();
  const jaIsAvailable = useMemo(
    () => (jaAvailable !== undefined ? jaAvailable : hasJA(card)),
    [card, jaAvailable],
  );

  if (!jaIsAvailable) return null;

  const stopDown = (e: React.SyntheticEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };
  const stopBubble = (e: React.SyntheticEvent) => {
    e.stopPropagation();
  };

  const options: { value: "en" | "ja"; label: React.ReactNode }[] = [
    { value: "en", label: "English" },
    {
      value: "ja",
      label: (
        <span className="font-jp" lang="ja">
          日本語
        </span>
      ),
    },
  ];

  return (
    <div
      role="group"
      aria-label="Language toggle"
      className="inline-flex shrink-0 items-center gap-1.5"
      onPointerDownCapture={stopDown}
      onMouseDownCapture={stopDown}
      onTouchStartCapture={stopDown}
      onClick={stopBubble}
    >
      {options.map((opt) => {
        const selected = locale === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setLocale(opt.value);
            }}
            aria-pressed={selected}
            className={buttonClasses(selected ? "primary" : "ghost")}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
};

export default LocaleToggle;

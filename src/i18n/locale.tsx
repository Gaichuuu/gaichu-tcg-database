// src/i18n/locale.tsx
import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  useCallback,
} from "react";
import { useSearchParams } from "react-router-dom";

export type Locale = "en" | "ja";
const DEFAULT_LOCALE: Locale = "en";

export type I18nValue = string | Partial<Record<Locale, string>>;

export function t(value: I18nValue | undefined, locale: Locale): string {
  if (value == null) return "";
  if (typeof value === "string") return value;
  return (
    value[locale] ?? value[DEFAULT_LOCALE] ?? Object.values(value)[0] ?? ""
  );
}

function parseUrlLocale(sp: URLSearchParams): Locale | undefined {
  const v = sp.get("lang");
  return v === "en" || v === "ja" ? v : undefined;
}

const LocaleContext = createContext<{
  locale: Locale;
  setLocale: (l: Locale) => void;
}>({
  locale: DEFAULT_LOCALE,
  setLocale: () => {},
});

export const useLocale = () => useContext(LocaleContext);

export const LocaleProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [stored, setStored] = useState<Locale | undefined>(() => {
    const v = localStorage.getItem("gaichu.locale");
    return v === "en" || v === "ja" ? (v as Locale) : undefined;
  });

  const locale: Locale =
    parseUrlLocale(searchParams) ?? stored ?? DEFAULT_LOCALE;

  const setLocale = useCallback(
    (l: Locale) => {
      if (l === locale) return;

      setStored(l);
      localStorage.setItem("gaichu.locale", l);

      const next = new URLSearchParams(searchParams);
      if (l === DEFAULT_LOCALE) next.delete("lang");
      else next.set("lang", l);
      setSearchParams(next, { replace: true });
    },
    [locale, searchParams, setSearchParams],
  );

  const value = useMemo(() => ({ locale, setLocale }), [locale, setLocale]);
  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
};

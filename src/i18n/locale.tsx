// src/i18n/locale.tsx
import React, { useMemo, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { type Locale, DEFAULT_LOCALE } from "./t";
import { LocaleContext } from "./useLocale";

function parseUrlLocale(sp: URLSearchParams): Locale | undefined {
  const v = sp.get("lang");
  return v === "en" || v === "ja" ? v : undefined;
}

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

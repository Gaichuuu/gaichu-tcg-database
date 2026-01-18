// src/i18n/useLocale.ts
import { createContext, useContext } from "react";
import { type Locale, DEFAULT_LOCALE } from "./t";

export const LocaleContext = createContext<{
  locale: Locale;
  setLocale: (l: Locale) => void;
}>({
  locale: DEFAULT_LOCALE,
  setLocale: () => {},
});

export const useLocale = () => useContext(LocaleContext);

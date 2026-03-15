import { type I18nValue } from "./t";
export { t, type Locale, type I18nValue, DEFAULT_LOCALE } from "./t";
export { useLocale } from "./useLocale";
export { LocaleProvider } from "./locale";
export function isJaAvailable(v: I18nValue | undefined): boolean {
  return (
    v != null &&
    typeof v === "object" &&
    typeof v.ja === "string" &&
    v.ja.trim() !== ""
  );
}

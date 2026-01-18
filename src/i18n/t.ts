// src/i18n/t.ts
export type Locale = "en" | "ja";
export const DEFAULT_LOCALE: Locale = "en";

export type I18nValue = string | Partial<Record<Locale, string>>;

export function t(value: I18nValue | undefined, locale: Locale): string {
  if (value == null) return "";
  if (typeof value === "string") return value;
  return (
    value[locale] ?? value[DEFAULT_LOCALE] ?? Object.values(value)[0] ?? ""
  );
}

export const locales = ["fa", "en"] as const;

export type Locale = (typeof locales)[number];

export const enabledLocales: readonly Locale[] = locales;

export const defaultLocale: Locale = "fa";

export const rtlLocales: readonly Locale[] = ["fa"];

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}

export function getDirection(locale: Locale): "rtl" | "ltr" {
  return rtlLocales.includes(locale) ? "rtl" : "ltr";
}

export function detectLocale(value: string | null): Locale {
  const languages = (value ?? "")
    .split(",")
    .map((item) => item.split(";")[0].trim().toLowerCase())
    .filter(Boolean);

  for (const language of languages) {
    const base = language.split("-")[0];

    if (isLocale(base) && enabledLocales.includes(base)) {
      return base;
    }
  }

  return defaultLocale;
}
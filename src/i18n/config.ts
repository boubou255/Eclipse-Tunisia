export const locales = ["en", "fr", "de", "it", "es", "ar", "ja", "zh"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

export const localeNames: Record<Locale, string> = {
  en: "English",
  fr: "Français",
  de: "Deutsch",
  it: "Italiano",
  es: "Español",
  ar: "العربية",
  ja: "日本語",
  zh: "中文",
};

export const rtlLocales: Locale[] = ["ar"];

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

export function dir(locale: Locale) {
  return rtlLocales.includes(locale) ? "rtl" : "ltr";
}

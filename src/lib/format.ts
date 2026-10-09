import type { Locale } from "@/i18n/config";

const intlLocale: Record<Locale, string> = {
  en: "en-GB",
  fr: "fr-FR",
  de: "de-DE",
  it: "it-IT",
  es: "es-ES",
  ar: "ar-TN",
  ja: "ja-JP",
  zh: "zh-CN",
};

export function formatPrice(eur: number, locale: Locale) {
  return new Intl.NumberFormat(intlLocale[locale], {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(eur);
}

export function formatDate(date: Date, locale: Locale, opts?: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat(intlLocale[locale], {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Africa/Tunis",
    ...opts,
  }).format(date);
}

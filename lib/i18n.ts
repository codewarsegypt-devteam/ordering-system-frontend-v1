export const locales = ["en", "ar", "de", "ru"] as const;

export type AppLocale = (typeof locales)[number];

export const defaultLocale: AppLocale = "en";

export function isValidLocale(locale: string | undefined): locale is AppLocale {
  return !!locale && locales.includes(locale as AppLocale);
}

export function getLocaleDirection(locale: AppLocale): "ltr" | "rtl" {
  return locale === "ar" ? "rtl" : "ltr";
}

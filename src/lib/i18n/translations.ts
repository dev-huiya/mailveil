import en from "./locales/en";
import ko from "./locales/ko";

export const locales = ["en", "ko"] as const;
export type Locale = (typeof locales)[number];

export const localeNames: Record<Locale, string> = {
  en: "English",
  ko: "한국어",
};

export const translations: Record<Locale, typeof en> = { en, ko };
export type TranslationKey = keyof typeof en;

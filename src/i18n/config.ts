// Konfigurasi i18n — 5 locale pengunjung (ID, EN, RU, ZH, EN-AU). en-AU berbagi kamus
// dengan EN (hanya beda label & mata uang default AUD). Terjemahan hanya untuk halaman
// PELANGGAN; panel admin tetap satu bahasa.

import type { Currency } from "@/lib/currency";

export const LOCALES = ["id", "en", "ru", "zh", "en-AU"] as const;
export type Locale = (typeof LOCALES)[number];

/** Kunci kamus — en-AU memakai kamus "en". */
export type DictLocale = "id" | "en" | "ru" | "zh";

export const DEFAULT_LOCALE: Locale = "en";

export const LOCALE_LABEL: Record<Locale, string> = {
  id: "Bahasa Indonesia",
  en: "English",
  ru: "Русский",
  zh: "中文",
  "en-AU": "English (AU)",
};

/** Locale → kunci kamus (en-AU jatuh ke en). */
export function dictLocaleOf(locale: Locale): DictLocale {
  return locale === "en-AU" ? "en" : locale;
}

/** Mata uang default saat pengunjung memilih bahasa (bisa dioverride manual). */
export const LOCALE_DEFAULT_CURRENCY: Record<Locale, Currency> = {
  id: "IDR",
  en: "USD",
  ru: "RUB",
  zh: "CNY",
  "en-AU": "AUD",
};

/** Locale Intl untuk format angka/tanggal. */
export const INTL_LOCALE: Record<Locale, string> = {
  id: "id-ID",
  en: "en-US",
  ru: "ru-RU",
  zh: "zh-CN",
  "en-AU": "en-AU",
};

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

export const LOCALE_COOKIE = "prestige.locale";
export const CURRENCY_COOKIE = "prestige.currency";

/** Kamus datar: key → teks. Modul pesan mengekspor Record<DictLocale, Messages>. */
export type Messages = Record<string, string>;
export type MessageModule = Record<DictLocale, Messages>;

/** Gabungkan beberapa modul pesan untuk satu locale (kunci belakangan menang). */
export function mergeMessages(locale: Locale, ...modules: MessageModule[]): Messages {
  const dl = dictLocaleOf(locale);
  return Object.assign({}, ...modules.map((m) => m[dl]));
}

/** Pilih locale terbaik dari header Accept-Language (auto-detect kunjungan pertama). */
export function detectLocale(acceptLanguage: string | null): Locale {
  if (!acceptLanguage) return DEFAULT_LOCALE;
  const tags = acceptLanguage
    .split(",")
    .map((part) => part.split(";")[0]!.trim().toLowerCase())
    .filter(Boolean);
  for (const tag of tags) {
    if (tag.startsWith("id")) return "id";
    if (tag.startsWith("ru")) return "ru";
    if (tag.startsWith("zh")) return "zh";
    if (tag === "en-au") return "en-AU";
    if (tag.startsWith("en")) return "en";
  }
  return DEFAULT_LOCALE;
}

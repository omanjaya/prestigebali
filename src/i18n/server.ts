// Helper i18n sisi server — baca locale & mata uang dari cookie; kunjungan pertama
// auto-detect dari Accept-Language ("translate yang otomatis"). Dipakai layout/page
// Server Component; mutasi cookie dilakukan lewat Server Action (set-locale).

import { cookies, headers } from "next/headers";

import { formatMoney, type Currency } from "@/lib/currency";
import { isCurrency } from "@/lib/currency";
import {
  CURRENCY_COOKIE,
  detectLocale,
  INTL_LOCALE,
  isLocale,
  LOCALE_COOKIE,
  LOCALE_DEFAULT_CURRENCY,
  mergeMessages,
  type Locale,
  type MessageModule,
} from "./config";
import { commonMessages } from "./messages/common";

/** Locale aktif: cookie bila ada; kalau tidak, deteksi dari Accept-Language. */
export async function getLocale(): Promise<Locale> {
  const jar = await cookies();
  const fromCookie = jar.get(LOCALE_COOKIE)?.value;
  if (fromCookie && isLocale(fromCookie)) return fromCookie;
  const accept = (await headers()).get("accept-language");
  return detectLocale(accept);
}

/** Mata uang aktif: cookie bila ada; kalau tidak, default mengikuti locale. */
export async function getCurrency(locale: Locale): Promise<Currency> {
  const jar = await cookies();
  const fromCookie = jar.get(CURRENCY_COOKIE)?.value;
  if (fromCookie && isCurrency(fromCookie)) return fromCookie;
  return LOCALE_DEFAULT_CURRENCY[locale];
}

/**
 * t() untuk Server Component: gabungkan kamus common + modul tambahan pada locale aktif.
 * Contoh: const { t, locale } = await getT(siteMessages);
 */
export async function getT(
  ...modules: MessageModule[]
): Promise<{ t: (key: string) => string; locale: Locale }> {
  const locale = await getLocale();
  const messages = mergeMessages(locale, commonMessages, ...modules);
  return { locale, t: (key) => messages[key] ?? key };
}

/** Formatter uang untuk Server Component: IDR → mata uang tampilan aktif (kurs Settings). */
export async function getMoneyFormatter(): Promise<(idr: number) => string> {
  const locale = await getLocale();
  const currency = await getCurrency(locale);
  const { getRates } = await import("@/lib/settings");
  const rates = await getRates().catch(() => undefined);
  return (idr) => formatMoney(idr, currency, INTL_LOCALE[locale], rates);
}

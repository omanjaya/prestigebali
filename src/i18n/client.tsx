"use client";

// Provider + hook i18n sisi client. Layout (server) membaca locale/currency/messages
// lalu menyuntikkannya ke sini; komponen client memakai useI18n()/useCurrency()/<Money>.

import { createContext, useContext } from "react";

import { formatMoney, IDR_PER_UNIT, type Currency, type Rates } from "@/lib/currency";
import { INTL_LOCALE, type Locale, type Messages } from "./config";

interface I18nContextValue {
  locale: Locale;
  currency: Currency;
  messages: Messages;
  /** Kurs efektif (IDR per unit) — dari Settings admin; fallback konstanta. */
  rates: Rates;
}

const I18nContext = createContext<I18nContextValue>({
  locale: "en",
  currency: "IDR",
  messages: {},
  rates: IDR_PER_UNIT,
});

export function I18nProvider({
  locale,
  currency,
  messages,
  rates = IDR_PER_UNIT,
  children,
}: Omit<I18nContextValue, "rates"> & { rates?: Rates; children: React.ReactNode }) {
  return (
    <I18nContext.Provider value={{ locale, currency, messages, rates }}>
      {children}
    </I18nContext.Provider>
  );
}

/** t(key) — teks terjemahan; fallback ke key bila belum diterjemahkan (mudah terlihat). */
export function useI18n(): { locale: Locale; t: (key: string) => string } {
  const { locale, messages } = useContext(I18nContext);
  return { locale, t: (key) => messages[key] ?? key };
}

/** Mata uang aktif + formatter display-only dari basis IDR (kurs dari Settings). */
export function useCurrency(): { currency: Currency; format: (idr: number) => string } {
  const { currency, locale, rates } = useContext(I18nContext);
  return { currency, format: (idr) => formatMoney(idr, currency, INTL_LOCALE[locale], rates) };
}

/** Nominal IDR ditampilkan dalam mata uang aktif pengunjung. */
export function Money({ idr }: { idr: number }) {
  const { format } = useCurrency();
  return <>{format(idr)}</>;
}

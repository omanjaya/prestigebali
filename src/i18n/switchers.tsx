"use client";

// Switcher bahasa & mata uang — select CONTROLLED yang nilainya dibaca dari context
// i18n (satu sumber kebenaran; ikut ter-update saat RSC refresh). Server action
// dipanggil langsung dari onChange (tanpa <form>) — menghindari perilaku React 19
// yang mereset field form uncontrolled ke defaultValue setelah action selesai
// (bug: konten sudah ganti bahasa, dropdown balik ke nilai lama).

import { useTransition } from "react";

import { CURRENCIES, CURRENCY_LABEL, type Currency } from "@/lib/currency";
import { setCurrencyAction, setLocaleAction } from "./actions";
import { useCurrency, useI18n } from "./client";
import { LOCALES, LOCALE_LABEL, type Locale } from "./config";

/** `value` opsional (kompat lama) — context adalah sumber kebenaran. */
export function LocaleSwitcher({ className }: { value?: Locale; className?: string }) {
  const { locale } = useI18n();
  const [isPending, startTransition] = useTransition();
  return (
    <select
      name="locale"
      aria-label="Language"
      value={locale}
      disabled={isPending}
      className={className}
      onChange={(e) => {
        const fd = new FormData();
        fd.set("locale", e.target.value);
        startTransition(() => setLocaleAction(fd));
      }}
    >
      {LOCALES.map((l) => (
        <option key={l} value={l}>
          {LOCALE_LABEL[l]}
        </option>
      ))}
    </select>
  );
}

export function CurrencySwitcher({ className }: { value?: Currency; className?: string }) {
  const { currency } = useCurrency();
  const [isPending, startTransition] = useTransition();
  return (
    <select
      name="currency"
      aria-label="Currency"
      value={currency}
      disabled={isPending}
      className={className}
      onChange={(e) => {
        const fd = new FormData();
        fd.set("currency", e.target.value);
        startTransition(() => setCurrencyAction(fd));
      }}
    >
      {CURRENCIES.map((c) => (
        <option key={c} value={c}>
          {CURRENCY_LABEL[c]}
        </option>
      ))}
    </select>
  );
}

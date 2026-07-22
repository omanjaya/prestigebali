// Mata uang tampilan — konversi DISPLAY-ONLY dari basis IDR. Pembayaran & pencatatan
// tetap rupiah (Money = Int IDR); konversi hanya untuk menampilkan harga ke pengunjung
// mancanegara. Rate statis di sini (prototype); perbarui berkala / pindahkan ke DB nanti.

export const CURRENCIES = ["IDR", "USD", "RUB", "CNY", "AUD"] as const;
export type Currency = (typeof CURRENCIES)[number];

export type Rates = Record<Currency, number>;

/** IDR per 1 unit mata uang — DEFAULT statis. Nilai efektif bisa dioverride admin
 *  via Settings (lib/settings.getRates) dan mengalir ke client lewat I18nProvider. */
export const IDR_PER_UNIT: Rates = {
  IDR: 1,
  USD: 16_300,
  RUB: 205,
  CNY: 2_250,
  AUD: 10_700,
};

export const CURRENCY_LABEL: Record<Currency, string> = {
  IDR: "Rp (IDR)",
  USD: "$ (USD)",
  RUB: "₽ (RUB)",
  CNY: "¥ (CNY)",
  AUD: "A$ (AUD)",
};

export function isCurrency(value: string): value is Currency {
  return (CURRENCIES as readonly string[]).includes(value);
}

/** Konversi nominal IDR ke mata uang tampilan (dibulatkan ke satuan utuh). */
export function convertFromIdr(idr: number, currency: Currency, rates: Rates = IDR_PER_UNIT): number {
  return Math.round(idr / (rates[currency] > 0 ? rates[currency] : IDR_PER_UNIT[currency]));
}

/**
 * Format nominal IDR dalam mata uang tampilan, mis. formatMoney(16300000, "USD")
 * → "$1,000". Untuk IDR identik dengan formatIDR yang sudah ada.
 */
export function formatMoney(
  idr: number,
  currency: Currency,
  intlLocale = "en-US",
  rates: Rates = IDR_PER_UNIT,
): string {
  return new Intl.NumberFormat(currency === "IDR" ? "id-ID" : intlLocale, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(convertFromIdr(idr, currency, rates));
}

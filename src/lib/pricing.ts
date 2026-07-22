// Model harga Booking (fase prototype). Menghitung Total sewa, potongan Kode Promo,
// DP (uang muka), Sisa/Pelunasan, dan Deposit jaminan (Lepas Kunci) dari Tarif Mobil +
// Periode Sewa + Mode Sewa. Murni & serializable — aman dipakai di Client Component
// (form) maupun Server (action pembayaran).
//
// CATATAN CAKUPAN: model sederhana untuk prototype. BELUM memperhitungkan Biaya Antar,
// Overtime, dan Biaya Luar Kota. Angka yang keluar adalah ESTIMASI dasar sewa.

import type { RentalMode } from "@/domain/booking/booking";

/** Porsi DP (uang muka) dari Total sewa. DP mengunci Booking; sisanya jadi Pelunasan. */
export const DP_FRACTION = 0.3;

const DAY_MS = 24 * 60 * 60 * 1000;

export interface QuoteInput {
  mode: RentalMode;
  /** Tarif Harian — Lepas Kunci (rupiah). */
  dailyRate?: number | null;
  /** Paket 12 Jam — Pakai Sopir (rupiah). */
  chauffeurPackage?: number | null;
  startAt: Date;
  endAt: Date;
  /** Deposit jaminan per Mobil (Lepas Kunci). Diabaikan untuk Pakai Sopir. */
  securityDeposit?: number | null;
  /** Potongan Kode Promo dalam rupiah (sudah dihitung via lib/promo). */
  discountIdr?: number | null;
}

export interface Quote {
  /** Jumlah hari tertagih (dibulatkan ke atas, minimum 1). */
  days: number;
  /** Tarif per hari yang berlaku sesuai Mode Sewa. */
  ratePerDay: number;
  /** ratePerDay × days (sebelum potongan). */
  total: number;
  /** Potongan Kode Promo (dibatasi ≤ total). */
  discount: number;
  /** total − discount. */
  netTotal: number;
  /** DP (uang muka) — mengunci Booking; dihitung dari netTotal. */
  dp: number;
  /** Sisa/Pelunasan — dibayar sebelum serah-terima. */
  balance: number;
  /** Deposit jaminan (refundable) — hanya Lepas Kunci; 0 untuk Pakai Sopir. */
  deposit: number;
  /** Total dibayar saat checkout = DP + Deposit. */
  payNow: number;
  /** Apakah tarif untuk Mode Sewa ini tersedia (>0). */
  hasRate: boolean;
}

/** Jumlah hari tertagih dari sebuah periode: ceil(durasi/24 jam), minimum 1. */
export function billableDays(startAt: Date, endAt: Date): number {
  const ms = endAt.getTime() - startAt.getTime();
  if (!Number.isFinite(ms) || ms <= 0) return 1;
  return Math.max(1, Math.ceil(ms / DAY_MS));
}

/** Bulatkan nominal ke kelipatan Rp 10.000 terdekat (angka DP yang rapi). */
function roundRp(n: number): number {
  return Math.round(n / 10_000) * 10_000;
}

/**
 * Hitung estimasi biaya sebuah Booking. Satu-satunya sumber logika harga — dipakai
 * oleh form booking (estimasi live) dan action pembayaran prototype (nominal DP,
 * Deposit jaminan, dan Sisa).
 */
export function quoteBooking(input: QuoteInput): Quote {
  const ratePerDay =
    input.mode === "CHAUFFEUR" ? (input.chauffeurPackage ?? 0) : (input.dailyRate ?? 0);
  const hasRate = ratePerDay > 0;
  const days = billableDays(input.startAt, input.endAt);
  const total = ratePerDay * days;
  const discount = Math.min(Math.max(0, input.discountIdr ?? 0), total);
  const netTotal = total - discount;
  const dp = roundRp(netTotal * DP_FRACTION);
  const balance = Math.max(0, netTotal - dp);
  // Deposit jaminan hanya berlaku Lepas Kunci (CONTEXT.md: tidak untuk Pakai Sopir).
  const deposit = input.mode === "SELF_DRIVE" ? Math.max(0, input.securityDeposit ?? 0) : 0;
  const payNow = dp + deposit;
  return { days, ratePerDay, total, discount, netTotal, dp, balance, deposit, payNow, hasRate };
}

// Pengaturan runtime (US42) — tersimpan di tabel Setting, bisa diubah admin tanpa
// restart/rebuild. Dua wajah API:
//   - async  : getSettings()/saveSettings()/getRates() — untuk halaman admin & server.
//   - sync   : getNumberSettingSync() — untuk BookingConfig (dibaca di dalam service
//              yang sinkron). Ditopang cache modul yang dimuat lazy dan di-refresh
//              setiap saveSettings(). Catatan: cache per-proses (cukup untuk satu
//              instance Docker; multi-instance butuh refresh berkala/pub-sub).

import { prisma } from "@/lib/prisma";
import { CURRENCIES, IDR_PER_UNIT, type Currency, type Rates } from "@/lib/currency";

/** Kunci yang dikenal + fallback-nya (env dulu, lalu konstanta). */
export const SETTING_DEFS = {
  holdTimeoutMinutes: { label: "Hold timeout (menit)", fallback: () => Number(process.env.HOLD_TIMEOUT_MINUTES ?? 60) },
  bufferDays: { label: "Buffer antar booking (hari)", fallback: () => Number(process.env.BUFFER_DAYS ?? 1) },
  refundAdminFee: { label: "Biaya admin refund (Rp)", fallback: () => Number(process.env.REFUND_ADMIN_FEE ?? 0) },
  "rate.USD": { label: "Kurs IDR per 1 USD", fallback: () => IDR_PER_UNIT.USD },
  "rate.RUB": { label: "Kurs IDR per 1 RUB", fallback: () => IDR_PER_UNIT.RUB },
  "rate.CNY": { label: "Kurs IDR per 1 CNY", fallback: () => IDR_PER_UNIT.CNY },
  "rate.AUD": { label: "Kurs IDR per 1 AUD", fallback: () => IDR_PER_UNIT.AUD },
} as const;

export type SettingKey = keyof typeof SETTING_DEFS;

let cache: Map<string, string> | null = null;
let loading: Promise<void> | null = null;

async function refreshCache(): Promise<void> {
  const rows = await prisma.setting.findMany();
  cache = new Map(rows.map((r) => [r.key, r.value]));
}

/** Muat cache di latar belakang (sekali); dipanggil dari jalur sync. */
function ensureLoaded(): void {
  if (cache !== null || loading !== null) return;
  loading = refreshCache()
    .catch(() => {}) // DB belum siap → tetap pakai fallback env
    .finally(() => {
      loading = null;
    });
}

/**
 * Baca angka setting secara SINKRON dari cache (fallback env/konstanta bila cache
 * belum termuat atau nilai tak valid). Dipakai getter BookingConfig.
 */
export function getNumberSettingSync(key: SettingKey): number {
  ensureLoaded();
  const raw = cache?.get(key);
  const parsed = raw != null ? Number(raw) : NaN;
  return Number.isFinite(parsed) ? parsed : SETTING_DEFS[key].fallback();
}

/** Semua nilai efektif (DB bila ada, selain itu fallback) — untuk halaman admin. */
export async function getSettings(): Promise<Record<SettingKey, number>> {
  await refreshCache();
  const out = {} as Record<SettingKey, number>;
  for (const key of Object.keys(SETTING_DEFS) as SettingKey[]) {
    const raw = cache?.get(key);
    const parsed = raw != null ? Number(raw) : NaN;
    out[key] = Number.isFinite(parsed) ? parsed : SETTING_DEFS[key].fallback();
  }
  return out;
}

/** Simpan sebagian/semua setting (upsert per key) lalu segarkan cache proses ini. */
export async function saveSettings(values: Partial<Record<SettingKey, number>>): Promise<void> {
  const entries = Object.entries(values).filter(([, v]) => Number.isFinite(v)) as [
    SettingKey,
    number,
  ][];
  for (const [key, value] of entries) {
    await prisma.setting.upsert({
      where: { key },
      update: { value: String(value) },
      create: { key, value: String(value) },
    });
  }
  await refreshCache();
}

/** Kurs efektif untuk konversi tampilan (IDR per 1 unit). */
export async function getRates(): Promise<Rates> {
  const s = await getSettings();
  const rates = { ...IDR_PER_UNIT };
  for (const c of CURRENCIES) {
    if (c === "IDR") continue;
    const v = s[`rate.${c}` as SettingKey];
    if (Number.isFinite(v) && v > 0) rates[c as Currency] = v;
  }
  return rates;
}

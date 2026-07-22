"use server";

// Server Actions untuk halaman Admin Settings (US42). Satu action generik
// `saveSettingsAction` (dipakai via useActionState) memvalidasi SETIAP kunci di
// SETTING_DEFS lalu memanggil saveSettings() sekali — sukses/gagal mengembalikan
// state agar UI bisa menampilkan pesan tanpa reload penuh.
//
// Otorisasi: requireAdmin() di sini adalah SALINAN pola dari src/app/admin/actions.ts
// (bukan import) — setiap Server Action wajib memeriksa ulang sesi sendiri
// (defense-in-depth), tidak mengandalkan guard di halaman saja.

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { saveSettings, SETTING_DEFS, type SettingKey } from "@/lib/settings";

/** Guard: lempar bila bukan ADMIN. */
async function requireAdmin(): Promise<void> {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }
}

export interface SettingsFormState {
  error?: string;
  ok?: string;
}

/** Satu aturan validasi per kunci: parse dari string FormData → number, lalu cek batas. */
interface SettingRule {
  parse: (raw: FormDataEntryValue | null) => number;
  /** null = valid; string = pesan error yang menyebut nama field. */
  validate: (n: number) => string | null;
  /** Bulatkan ke integer sebelum disimpan (booking rules); kurs dibiarkan pecahan. */
  integer: boolean;
}

function parseNumber(raw: FormDataEntryValue | null): number {
  const s = typeof raw === "string" ? raw.trim() : "";
  if (s === "") return NaN;
  return Number(s);
}

function intRule(min: number, max: number | null, key: SettingKey): SettingRule {
  return {
    parse: parseNumber,
    validate: (n) => {
      if (!Number.isFinite(n) || !Number.isInteger(n)) {
        return `${SETTING_DEFS[key].label} harus berupa bilangan bulat.`;
      }
      if (n < min) {
        return `${SETTING_DEFS[key].label} minimal ${min}.`;
      }
      if (max !== null && n > max) {
        return `${SETTING_DEFS[key].label} maksimal ${max}.`;
      }
      return null;
    },
    integer: true,
  };
}

function rateRule(key: SettingKey): SettingRule {
  return {
    parse: parseNumber,
    validate: (n) => {
      if (!Number.isFinite(n) || n <= 0) {
        return `${SETTING_DEFS[key].label} harus berupa angka lebih besar dari 0.`;
      }
      return null;
    },
    integer: false,
  };
}

const RULES: Record<SettingKey, SettingRule> = {
  holdTimeoutMinutes: intRule(5, null, "holdTimeoutMinutes"),
  bufferDays: intRule(0, 7, "bufferDays"),
  refundAdminFee: intRule(0, null, "refundAdminFee"),
  "rate.USD": rateRule("rate.USD"),
  "rate.RUB": rateRule("rate.RUB"),
  "rate.CNY": rateRule("rate.CNY"),
  "rate.AUD": rateRule("rate.AUD"),
};

/**
 * Simpan semua pengaturan sekaligus. Berhenti pada kunci pertama yang tidak valid
 * dan mengembalikan pesan error yang menyebut field-nya (mis. "Buffer antar booking
 * (hari) maksimal 7."). Sukses → saveSettings() (upsert semua kunci + refresh cache),
 * lalu revalidate layout root (kurs tampilan dipakai di seluruh situs) + halaman ini.
 */
export async function saveSettingsAction(
  _prevState: SettingsFormState,
  formData: FormData,
): Promise<SettingsFormState> {
  await requireAdmin();

  const values: Partial<Record<SettingKey, number>> = {};

  for (const key of Object.keys(SETTING_DEFS) as SettingKey[]) {
    const rule = RULES[key];
    const parsed = rule.parse(formData.get(key));
    const error = rule.validate(parsed);
    if (error) return { error };
    values[key] = rule.integer ? Math.trunc(parsed) : parsed;
  }

  try {
    await saveSettings(values);
  } catch (error) {
    console.error("saveSettingsAction gagal", error);
    return { error: "Gagal menyimpan pengaturan. Coba lagi." };
  }

  revalidatePath("/", "layout");
  revalidatePath("/admin/settings");
  return { ok: "Tersimpan — nilai langsung berlaku." };
}

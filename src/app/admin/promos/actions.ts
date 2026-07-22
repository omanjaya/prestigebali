"use server";

// Server Actions untuk manajemen Kode Promo oleh ADMIN.
// savePromoAction: create (tanpa id) atau update (dengan id). deletePromoAction: hapus.
// Setiap aksi WAJIB memeriksa ulang otorisasi (defense-in-depth), tidak hanya
// mengandalkan guard di halaman. revalidatePath + redirect di jalur sukses.

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { createPromoCode, updatePromoCode, deletePromoCode, type PromoInput } from "@/lib/promo";
import type { PromoKind } from "@prisma/client";

const KINDS: readonly PromoKind[] = ["PERCENT", "FIXED"];

export interface PromoFormState {
  error?: string;
}

/** Guard bersama: lempar bila bukan ADMIN. */
async function requireAdmin(): Promise<void> {
  const s = await auth();
  if (s?.user?.role !== "ADMIN") throw new Error("Unauthorized");
}

/** Parse integer opsional; kembalikan null bila kosong/invalid. */
function parseIntOrNull(raw: FormDataEntryValue | null): number | null {
  const s = typeof raw === "string" ? raw.trim() : "";
  if (s === "") return null;
  const n = Number(s);
  return Number.isFinite(n) ? Math.trunc(n) : null;
}

/** Parse input type="date" (YYYY-MM-DD) → Date tengah malam, atau undefined bila kosong/invalid. */
function parseDateOrUndefined(raw: FormDataEntryValue | null): Date | undefined {
  const s = typeof raw === "string" ? raw.trim() : "";
  if (!s) return undefined;
  const d = new Date(`${s}T23:59:59.999`);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

/**
 * Simpan Kode Promo. Jika FormData punya `id` → update, jika tidak → create.
 * Redirect dilempar DI LUAR try/catch (redirect() memakai throw internal).
 */
export async function savePromoAction(
  _prevState: PromoFormState,
  formData: FormData,
): Promise<PromoFormState> {
  await requireAdmin();

  const id = String(formData.get("id") ?? "").trim();
  const code = String(formData.get("code") ?? "").trim();
  const kindRaw = String(formData.get("kind") ?? "").trim();
  const value = parseIntOrNull(formData.get("value"));
  const active = formData.get("active") === "on";
  const expiresAt = parseDateOrUndefined(formData.get("expiresAt"));
  const maxUses = parseIntOrNull(formData.get("maxUses"));
  const note = String(formData.get("note") ?? "").trim();

  if (!code) return { error: "Code is required." };
  if (!KINDS.includes(kindRaw as PromoKind)) return { error: "A valid kind is required." };
  const kind = kindRaw as PromoKind;

  if (value === null || value <= 0) return { error: "Value must be a positive number." };
  if (kind === "PERCENT" && (value < 1 || value > 100)) {
    return { error: "Percent value must be between 1 and 100." };
  }
  if (maxUses !== null && maxUses <= 0) {
    return { error: "Max uses must be a positive number, or leave it blank for unlimited." };
  }

  const input: PromoInput = {
    code,
    kind,
    value,
    active,
    expiresAt,
    maxUses: maxUses ?? undefined,
    note: note || undefined,
  };

  try {
    if (id) {
      await updatePromoCode(id, input);
    } else {
      await createPromoCode(input);
    }
  } catch (error) {
    console.error("savePromoAction gagal", error);
    return { error: "Could not save the promo code. The code may already exist." };
  }

  revalidatePath("/admin/promos");
  redirect("/admin/promos");
}

/** Hapus Kode Promo. */
export async function deletePromoAction(formData: FormData): Promise<PromoFormState> {
  await requireAdmin();

  const id = String(formData.get("id") ?? "").trim();
  if (!id) return { error: "Missing promo id." };

  try {
    await deletePromoCode(id);
  } catch (error) {
    console.error("deletePromoAction gagal", error);
    return { error: "Could not delete this promo code. Please try again." };
  }

  revalidatePath("/admin/promos");
  redirect("/admin/promos");
}

"use server";

// Server Actions untuk manajemen Unit (CarUnit) oleh ADMIN.
// saveUnitAction: create (tanpa id) atau update (dengan id). deleteUnitAction: hapus Unit.
// Setiap aksi WAJIB memeriksa ulang otorisasi (defense-in-depth), tidak hanya
// mengandalkan guard di halaman. revalidatePath + redirect di jalur sukses.

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { createUnit, updateUnit, deleteUnit } from "@/lib/units";

export interface UnitFormState {
  error?: string;
}

/** Guard bersama: lempar bila bukan ADMIN. */
async function requireAdmin(): Promise<void> {
  const s = await auth();
  if (s?.user?.role !== "ADMIN") throw new Error("Unauthorized");
}

/** Parse integer wajib; kembalikan null bila kosong/invalid. */
function parseIntOrNull(raw: FormDataEntryValue | null): number | null {
  const s = typeof raw === "string" ? raw.trim() : "";
  if (s === "") return null;
  const n = Number(s);
  return Number.isFinite(n) ? Math.trunc(n) : null;
}

/**
 * Simpan Unit. Jika FormData punya `id` → update, jika tidak → create.
 * Redirect dilempar DI LUAR try/catch (redirect() memakai throw internal).
 */
export async function saveUnitAction(
  _prevState: UnitFormState,
  formData: FormData,
): Promise<UnitFormState> {
  await requireAdmin();

  const id = String(formData.get("id") ?? "").trim();
  const carModelId = String(formData.get("carModelId") ?? "").trim();
  const plate = String(formData.get("plate") ?? "").trim();
  const color = String(formData.get("color") ?? "").trim();
  const condition = String(formData.get("condition") ?? "").trim();
  const odometer = parseIntOrNull(formData.get("odometer"));

  if (!carModelId) return { error: "A car is required." };
  if (!plate) return { error: "Plate is required." };
  if (!color) return { error: "Color is required." };
  if (odometer === null) return { error: "Odometer is required and must be a number." };

  try {
    if (id) {
      await updateUnit(id, { plate, color, odometer, condition: condition || undefined });
    } else {
      await createUnit({ carModelId, plate, color, odometer, condition: condition || undefined });
    }
  } catch (error) {
    console.error("saveUnitAction gagal", error);
    return { error: "Could not save the unit. Please try again." };
  }

  revalidatePath("/admin/units");
  redirect("/admin/units");
}

/**
 * Hapus Unit. Bila Unit masih teralokasi ke sebuah Booking, Prisma akan menolak
 * (foreign key); kita kembalikan pesan ramah.
 */
export async function deleteUnitAction(formData: FormData): Promise<UnitFormState> {
  await requireAdmin();

  const id = String(formData.get("id") ?? "").trim();
  if (!id) return { error: "Missing unit id." };

  try {
    await deleteUnit(id);
  } catch (error) {
    console.error("deleteUnitAction gagal", error);
    return { error: "Could not delete this unit. It may still be allocated to a booking." };
  }

  revalidatePath("/admin/units");
  redirect("/admin/units");
}

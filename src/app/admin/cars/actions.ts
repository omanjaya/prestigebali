"use server";

// Server Actions untuk manajemen katalog Mobil (CarModel) oleh ADMIN.
// saveCar: create (tanpa id) atau update (dengan id). deleteCar: hapus CarModel.
// Setiap aksi WAJIB memeriksa ulang otorisasi (defense-in-depth), tidak hanya
// mengandalkan guard di halaman. revalidatePath + redirect di jalur sukses.

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import type { Category } from "@/lib/catalog";

/** Kategori valid (harus cocok dengan enum Category di schema.prisma). */
const CATEGORIES: readonly Category[] = ["SPORT", "LUXURY_SEDAN", "LUXURY_SUV", "PREMIUM_MPV"];

export interface CarFormState {
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

/** Split textarea foto (satu URL per baris), buang baris kosong. */
function parsePhotos(raw: FormDataEntryValue | null): string[] {
  if (typeof raw !== "string") return [];
  return raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

/**
 * Simpan Mobil. Jika FormData punya `id` → update, jika tidak → create.
 * Redirect dilempar DI LUAR try/catch (redirect() memakai throw internal).
 */
export async function saveCar(_prevState: CarFormState, formData: FormData): Promise<CarFormState> {
  await requireAdmin();

  const id = String(formData.get("id") ?? "").trim();

  const name = String(formData.get("name") ?? "").trim();
  const brand = String(formData.get("brand") ?? "").trim();
  const transmission = String(formData.get("transmission") ?? "").trim();
  const categoryRaw = String(formData.get("category") ?? "").trim();

  const year = parseIntOrNull(formData.get("year"));
  const seats = parseIntOrNull(formData.get("seats"));
  const stock = parseIntOrNull(formData.get("stock"));
  const dailyRate = parseIntOrNull(formData.get("dailyRate"));
  const chauffeurPackage = parseIntOrNull(formData.get("chauffeurPackage"));
  const photos = parsePhotos(formData.get("photos"));

  // Validasi field wajib.
  if (!name) return { error: "Name is required." };
  if (!brand) return { error: "Brand is required." };
  if (!transmission) return { error: "Transmission is required." };
  if (!CATEGORIES.includes(categoryRaw as Category)) return { error: "A valid category is required." };
  if (year === null) return { error: "Year is required and must be a number." };
  if (seats === null) return { error: "Seats is required and must be a number." };
  if (stock === null) return { error: "Stock is required and must be a number." };

  const category = categoryRaw as Category;

  const data = {
    name,
    brand,
    year,
    transmission,
    seats,
    category,
    photos,
    stock,
    dailyRate,
    chauffeurPackage,
  };

  try {
    if (id) {
      await prisma.carModel.update({ where: { id }, data });
    } else {
      await prisma.carModel.create({ data });
    }
  } catch (error) {
    console.error("saveCar gagal", error);
    return { error: "Could not save the car. Please try again." };
  }

  revalidatePath("/admin/cars");
  redirect("/admin/cars");
}

/**
 * Hapus Mobil. Bila masih ada Booking/Unit yang mereferensikan CarModel,
 * Prisma akan menolak (foreign key); kita kembalikan pesan ramah.
 */
export async function deleteCar(formData: FormData): Promise<CarFormState> {
  await requireAdmin();

  const id = String(formData.get("id") ?? "").trim();
  if (!id) return { error: "Missing car id." };

  try {
    await prisma.carModel.delete({ where: { id } });
  } catch (error) {
    console.error("deleteCar gagal", error);
    return {
      error: "Could not delete this car. It may still have bookings or units attached.",
    };
  }

  revalidatePath("/admin/cars");
  redirect("/admin/cars");
}

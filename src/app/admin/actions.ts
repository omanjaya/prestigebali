"use server";

// Server Actions untuk Panel Admin. Setiap aksi membaca `bookingId` dari FormData,
// memanggil method Booking application service lewat seam (getBookingService), lalu
// me-revalidate halaman /admin agar tabel menampilkan status terbaru.
//
// CATATAN PENTING: aksi-aksi ini membutuhkan DATABASE agar benar-benar berjalan.
// getBookingService() merangkai adapter Prisma (repository/fleet) + gateway + notifikasi,
// jadi tanpa koneksi DB nyata pemanggilan akan gagal. UI tetap bisa dirender dari data
// MOCK (listBookings), tetapi eksekusi aksi baru valid setelah DB & infra siap.

import { revalidatePath } from "next/cache";
import { getBookingService } from "@/server/booking-container";
import { auth, signOut } from "@/auth";
import { InvalidTransitionError } from "@/domain/booking/errors";

/** Otorisasi: setiap aksi mutasi wajib sesi Admin (Server Action = endpoint POST). */
async function requireAdmin(): Promise<void> {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }
}

/** Keluar dari sesi admin lalu alihkan ke halaman /login. */
export async function signOutAction(): Promise<void> {
  await signOut({ redirectTo: "/login" });
}

/** Menyetujui Verifikasi Pengemudi (Lepas Kunci): AWAITING_APPROVAL → CONFIRMED. */
export async function approveBooking(formData: FormData): Promise<void> {
  await requireAdmin();
  const bookingId = String(formData.get("bookingId") ?? "");
  if (!bookingId) return;
  try {
    await getBookingService().approve({ bookingId });
  } catch (error) {
    // TODO: tampilkan error ke UI (butuh DB untuk eksekusi nyata).
    console.error("approveBooking gagal", error);
  }
  revalidatePath("/admin");
}

/** Pembatalan oleh Prestige (operator): {REQUESTED, AWAITING_APPROVAL, CONFIRMED} → CANCELLED. */
export async function cancelBooking(formData: FormData): Promise<void> {
  await requireAdmin();
  const bookingId = String(formData.get("bookingId") ?? "");
  if (!bookingId) return;
  try {
    await getBookingService().cancelByOperator({ bookingId });
  } catch (error) {
    // TODO: tampilkan error ke UI (butuh DB untuk eksekusi nyata).
    console.error("cancelBooking gagal", error);
  }
  revalidatePath("/admin");
}

/** Alokasi unit fisik ke Booking CONFIRMED atau ONGOING. */
export async function allocateUnit(formData: FormData): Promise<void> {
  await requireAdmin();
  const bookingId = String(formData.get("bookingId") ?? "");
  const unitId = String(formData.get("unitId") ?? "");
  if (!bookingId || !unitId) return;
  try {
    await getBookingService().allocateUnit({ bookingId, unitId });
  } catch (error) {
    // TODO: tampilkan error ke UI (butuh DB untuk eksekusi nyata).
    console.error("allocateUnit gagal", error);
  }
  revalidatePath("/admin");
}

/** Mulai sewa: CONFIRMED → ONGOING (mobil sudah diserahterimakan ke pelanggan). */
export async function markOngoing(formData: FormData): Promise<void> {
  await requireAdmin();
  const bookingId = String(formData.get("bookingId") ?? "");
  if (!bookingId) return;
  try {
    await getBookingService().markOngoing({ bookingId });
  } catch (error) {
    console.error("markOngoing gagal", error);
  }
  revalidatePath("/admin");
}

/** Selesaikan sewa: ONGOING → COMPLETED (mobil sudah dikembalikan). */
export async function markCompleted(formData: FormData): Promise<void> {
  await requireAdmin();
  const bookingId = String(formData.get("bookingId") ?? "");
  if (!bookingId) return;
  try {
    await getBookingService().markCompleted({ bookingId });
  } catch (error) {
    console.error("markCompleted gagal", error);
  }
  revalidatePath("/admin");
}

/** Intent yang didukung oleh bookingActionWithState (satu action generik per baris tabel). */
type BookingActionIntent = "approve" | "cancel" | "allocate" | "ongoing" | "completed";

/** State hasil aksi booking, dipakai oleh useActionState di bookings-table.tsx. */
export interface BookingActionState {
  error?: string;
  ok?: string;
}

/** Pesan generik untuk error yang tidak perlu (atau tidak boleh) ditampilkan mentah ke admin. */
const GENERIC_ERROR = "Aksi gagal — coba lagi.";

/**
 * Aksi booking generik yang MENGEMBALIKAN state (untuk useActionState), sehingga baris
 * tabel bisa menampilkan feedback sukses/gagal tanpa menelan error ke console saja.
 * Dipakai oleh bookings-table.tsx; lima action plain di atas tetap dipertahankan apa
 * adanya untuk dipakai halaman detail booking (agent lain).
 */
export async function bookingActionWithState(
  _prev: BookingActionState,
  formData: FormData,
): Promise<BookingActionState> {
  await requireAdmin();
  const intent = String(formData.get("intent") ?? "") as BookingActionIntent | "";
  const bookingId = String(formData.get("bookingId") ?? "");
  if (!intent || !bookingId) {
    return { error: GENERIC_ERROR };
  }

  try {
    const service = getBookingService();
    switch (intent) {
      case "approve":
        await service.approve({ bookingId });
        return { ok: "Disetujui." };
      case "cancel":
        await service.cancelByOperator({ bookingId });
        return { ok: "Dibatalkan." };
      case "allocate": {
        const unitId = String(formData.get("unitId") ?? "");
        if (!unitId) return { error: "Pilih unit terlebih dahulu." };
        await service.allocateUnit({ bookingId, unitId });
        return { ok: "Unit dialokasikan." };
      }
      case "ongoing":
        await service.markOngoing({ bookingId });
        return { ok: "Ditandai berjalan." };
      case "completed":
        await service.markCompleted({ bookingId });
        return { ok: "Ditandai selesai." };
      default:
        return { error: GENERIC_ERROR };
    }
  } catch (error) {
    const message = error instanceof InvalidTransitionError ? error.message : GENERIC_ERROR;
    return { error: message };
  } finally {
    revalidatePath("/admin");
  }
}

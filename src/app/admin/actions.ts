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
import { signOut } from "@/auth";

/** Keluar dari sesi admin lalu alihkan ke halaman /login. */
export async function signOutAction(): Promise<void> {
  await signOut({ redirectTo: "/login" });
}

/** Menyetujui Verifikasi Pengemudi (Lepas Kunci): AWAITING_APPROVAL → CONFIRMED. */
export async function approveBooking(formData: FormData): Promise<void> {
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

/** Alokasi unit fisik ke Booking CONFIRMED. */
export async function allocateUnit(formData: FormData): Promise<void> {
  const bookingId = String(formData.get("bookingId") ?? "");
  if (!bookingId) return;
  try {
    // TODO: alokasi unit belum ada di service (BookingService belum punya method
    // allocateUnit / assignUnit). No-op untuk saat ini; butuh DB + method service baru.
    void bookingId;
  } catch (error) {
    console.error("allocateUnit gagal", error);
  }
  revalidatePath("/admin");
}

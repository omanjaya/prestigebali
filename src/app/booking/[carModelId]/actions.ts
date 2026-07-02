"use server";

// Server Action untuk membuat Booking. Memetakan FormData → CreateBookingCommand,
// memanggil BookingService, lalu redirect ke halaman status pada sukses.

import { redirect } from "next/navigation";

import type { HandoverMethod, RentalMode } from "@/domain/booking/booking";
import type { CreateBookingCommand } from "@/domain/booking/booking-service";
import { getBookingService } from "@/server/booking-container";

export interface CreateBookingState {
  error?: string;
}

export async function createBookingAction(
  _prevState: CreateBookingState,
  formData: FormData,
): Promise<CreateBookingState> {
  const carModelId = String(formData.get("carModelId") ?? "");
  const mode = String(formData.get("mode") ?? "") as RentalMode;
  const startAt = String(formData.get("startAt") ?? "");
  const endAt = String(formData.get("endAt") ?? "");
  const handoverMethodRaw = String(formData.get("handoverMethod") ?? "");
  const deliveryAddress = String(formData.get("deliveryAddress") ?? "").trim();
  const chauffeurPickup = String(formData.get("chauffeurPickup") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();

  // Validasi ringan sisi server (form juga memakai `required`).
  if (!carModelId || !mode || !startAt || !endAt) {
    return { error: "Mohon lengkapi Mode Sewa dan Periode Sewa." };
  }
  if (!name || !phone) {
    return { error: "Mohon isi Nama dan No. HP." };
  }

  const startDate = new Date(startAt);
  const endDate = new Date(endAt);
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return { error: "Format tanggal tidak valid." };
  }
  if (endDate <= startDate) {
    return { error: "Waktu selesai harus setelah waktu mulai." };
  }

  // Serah-terima hanya relevan untuk Lepas Kunci; titik jemput untuk Pakai Sopir.
  let handoverMethod: HandoverMethod | undefined;
  let pickupPoint: string | undefined;
  if (mode === "SELF_DRIVE") {
    handoverMethod = handoverMethodRaw === "DELIVERY" ? "DELIVERY" : "PICKUP";
    if (handoverMethod === "DELIVERY") {
      if (!deliveryAddress) {
        return { error: "Mohon isi Alamat pengantaran untuk metode Diantar." };
      }
      pickupPoint = deliveryAddress;
    }
  } else {
    // CHAUFFEUR: gunakan Titik Jemput sebagai pickupPoint bila diisi.
    pickupPoint = chauffeurPickup || undefined;
  }

  const cmd: CreateBookingCommand = {
    carModelId,
    // TODO: auth + auto-account (guest) belum diwire — sementara pakai placeholder.
    customerId: "guest",
    mode,
    period: { startAt: startDate, endAt: endDate },
    handoverMethod,
    pickupPoint,
  };

  let bookingId: string;
  try {
    const booking = await getBookingService().createBooking(cmd);
    bookingId = booking.id;
  } catch {
    // Kegagalan umum saat ini: database/Docker belum berjalan sehingga repositori gagal.
    return {
      error:
        "Gagal membuat booking. Kemungkinan Stok tidak tersedia, atau database belum berjalan (Docker/DB belum aktif). Silakan coba lagi.",
    };
  }

  // redirect() melempar secara internal — harus di luar try/catch agar tidak tertangkap.
  redirect(`/status/${bookingId}`);
}

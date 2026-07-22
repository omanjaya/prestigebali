// Cek ketersediaan Stok sebuah Mobil pada periode (US 8/48) — dipakai form booking
// untuk menampilkan indikator tersedia/penuh SEBELUM submit. Publik & read-only;
// perhitungan yang sama (Stok − aktif − Hold + Buffer) dengan createBooking, jadi
// hasilnya konsisten dengan validasi saat submit.

import { NextResponse } from "next/server";

import { getBookingService } from "@/server/booking-container";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const carModelId = searchParams.get("carModelId") ?? "";
  const startAt = new Date(searchParams.get("startAt") ?? "");
  const endAt = new Date(searchParams.get("endAt") ?? "");

  if (
    !carModelId ||
    Number.isNaN(startAt.getTime()) ||
    Number.isNaN(endAt.getTime()) ||
    endAt <= startAt
  ) {
    return NextResponse.json({ error: "parameter tidak valid" }, { status: 400 });
  }

  try {
    const available = await getBookingService().checkAvailability({
      carModelId,
      period: { startAt, endAt },
    });
    return NextResponse.json({ available });
  } catch {
    // DB down dsb. — jangan blokir form; biarkan validasi submit yang memutuskan.
    return NextResponse.json({ error: "gagal memeriksa ketersediaan" }, { status: 500 });
  }
}

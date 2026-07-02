// Webhook Payment Gateway (Midtrans) — STUB.
// ADR-0002/0005: konfirmasi pembayaran otomatis. WAJIB idempoten (gunakan gatewayRef unik).
//
// Implementasi nanti:
//   1) Verifikasi signature Midtrans.
//   2) Petakan status → panggil bookingService.payDp / settle (adapter Prisma + Midtrans).
//   3) Idempoten: abaikan gatewayRef yang sudah diproses.

import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const _payload = await request.json().catch(() => null);
  void _payload;
  // TODO(/tdd + implementasi): verifikasi signature, wiring adapter, panggil service.
  return NextResponse.json({ error: "webhook belum diimplementasikan" }, { status: 501 });
}

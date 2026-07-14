// CRON: sweep Hold yang kedaluwarsa — membalik Booking REQUESTED yang Hold-nya timeout
// menjadi EXPIRED sekaligus melepas stok (BookingService.expireStaleHolds).
//
// Endpoint ini TIDAK dipanggil oleh user; ia dipicu penjadwal setiap ~5 menit. Dua cara:
//   1) Vercel Cron — konfigurasi di vercel.json menunjuk "/api/cron/expire-holds"
//      dengan schedule "*/5 * * * *". Vercel mengirim header `Authorization: Bearer <CRON_SECRET>`.
//   2) OS/Docker cron — jalankan tiap 5 menit:
//        curl -H "x-cron-secret: $CRON_SECRET" http://localhost:3000/api/cron/expire-holds
//
// Otorisasi: request diterima bila `Authorization: Bearer ${CRON_SECRET}` (gaya Vercel Cron)
// ATAU header `x-cron-secret` sama dengan CRON_SECRET. CRON_SECRET tak diset → 500; tak cocok → 401.
//
// Runtime Node (default) karena BookingService memakai Prisma lewat container — JANGAN set edge.

import { NextResponse } from "next/server";

import { getBookingService } from "@/server/booking-container";

// Jangan pernah cache: tiap panggilan harus menjalankan sweep terhadap state DB terkini.
export const dynamic = "force-dynamic";

/** Cek apakah request membawa secret cron yang benar (Bearer atau x-cron-secret). */
function isAuthorized(request: Request, secret: string): boolean {
  const bearer = request.headers.get("authorization");
  if (bearer === `Bearer ${secret}`) return true;
  const custom = request.headers.get("x-cron-secret");
  return custom === secret;
}

async function handle(request: Request): Promise<NextResponse> {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "CRON_SECRET tidak diset" }, { status: 500 });
  }
  if (!isAuthorized(request, secret)) {
    return NextResponse.json({ error: "tidak terotorisasi" }, { status: 401 });
  }

  try {
    const result = await getBookingService().expireStaleHolds();
    return NextResponse.json({ ok: true, expired: result.length }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "kesalahan internal";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(request: Request): Promise<NextResponse> {
  return handle(request);
}

export async function POST(request: Request): Promise<NextResponse> {
  return handle(request);
}

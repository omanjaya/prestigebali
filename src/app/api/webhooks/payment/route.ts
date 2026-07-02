// Webhook Pembayaran (Midtrans) — konfirmasi otomatis DP & Pelunasan (ADR-0002 / ADR-0005).
//
// Alur:
//   1) Parse notifikasi JSON Midtrans.
//   2) Verifikasi signature: sha512(order_id + status_code + gross_amount + SERVER_KEY).
//   3) Petakan transaction_status → apakah dana benar-benar diterima (settlement/capture).
//   4) Idempoten: catat Payment dengan `gatewayRef` unik = `order_id` (stabil, berulang di
//      setiap retry webhook). Bila unique constraint (P2002) → webhook duplikat → 200.
//   5) Panggil BookingService.payDp / settle sesuai suffix order_id (DP / SETTLEMENT).
//
// Idempotensi bertumpu pada kolom unik `Payment.gatewayRef`. Kita memilih `order_id`
// (`${bookingId}-DP` / `${bookingId}-SETTLEMENT`) sebagai kunci — nilai yang sama dibuat
// oleh adapter charge (lihat midtrans-payment-gateway.ts) dan dikirim ulang Midtrans pada
// tiap notifikasi, sehingga dedup-nya deterministik per Booking + jenis pembayaran.

import { createHash } from "node:crypto";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getBookingService } from "@/server/booking-container";

/** Field notifikasi Midtrans yang kita baca (Midtrans mengirim lebih banyak). */
interface MidtransNotification {
  order_id: string;
  status_code: string;
  gross_amount: string;
  signature_key: string;
  transaction_status: string;
  fraud_status?: string;
  transaction_id?: string;
}

/** Jenis pembayaran yang terkodekan pada suffix order_id. */
type ParsedKind = "DP" | "SETTLEMENT";

/** Hasil parse order_id menjadi bookingId + jenis pembayaran. */
interface ParsedOrderId {
  bookingId: string;
  kind: ParsedKind;
}

/** Validasi bentuk minimal notifikasi (semua field kunci berupa string). */
function isMidtransNotification(value: unknown): value is MidtransNotification {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.order_id === "string" &&
    typeof v.status_code === "string" &&
    typeof v.gross_amount === "string" &&
    typeof v.signature_key === "string" &&
    typeof v.transaction_status === "string"
  );
}

/**
 * Verifikasi signature Midtrans.
 * signature_key = sha512(order_id + status_code + gross_amount + serverKey).
 * `gross_amount` dipakai apa adanya (string mentah), bukan hasil parse.
 */
function verifySignature(n: MidtransNotification, serverKey: string): boolean {
  const expected = createHash("sha512")
    .update(n.order_id + n.status_code + n.gross_amount + serverKey)
    .digest("hex");
  return expected === n.signature_key;
}

/**
 * Apakah dana benar-benar diterima?
 * `settlement`/`capture` dengan fraud_status accept (atau tanpa fraud_status) = PAID.
 * `pending`/`deny`/`expire`/`cancel` diabaikan (tidak ada aksi).
 */
function isFundsSettled(n: MidtransNotification): boolean {
  const status = n.transaction_status;
  if (status !== "settlement" && status !== "capture") return false;
  // capture (kartu) bisa menunggu review anti-fraud; hanya terima bila accept/omitted.
  return n.fraud_status === undefined || n.fraud_status === "accept";
}

/** Pecah order_id `${bookingId}-DP` / `${bookingId}-SETTLEMENT`. */
function parseOrderId(orderId: string): ParsedOrderId | null {
  if (orderId.endsWith("-DP")) {
    return { bookingId: orderId.slice(0, -"-DP".length), kind: "DP" };
  }
  if (orderId.endsWith("-SETTLEMENT")) {
    return { bookingId: orderId.slice(0, -"-SETTLEMENT".length), kind: "SETTLEMENT" };
  }
  return null;
}

/** gross_amount Midtrans ("150000.00") → rupiah utuh (Int). */
function parseAmount(grossAmount: string): number {
  return Math.round(Number(grossAmount));
}

/** Deteksi pelanggaran unique constraint Prisma (webhook duplikat). */
function isDuplicateKeyError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    (error as { code?: unknown }).code === "P2002"
  );
}

export async function POST(request: Request) {
  // (1) Parse JSON — payload rusak → 400.
  const payload: unknown = await request.json().catch(() => null);
  if (!isMidtransNotification(payload)) {
    return NextResponse.json({ error: "payload tidak valid" }, { status: 400 });
  }
  const notification = payload;

  // (2) Verifikasi signature — konfigurasi/otentikasi.
  const serverKey = process.env.MIDTRANS_SERVER_KEY;
  if (!serverKey) {
    return NextResponse.json(
      { error: "MIDTRANS_SERVER_KEY tidak diset" },
      { status: 500 },
    );
  }
  if (!verifySignature(notification, serverKey)) {
    return NextResponse.json({ error: "signature tidak valid" }, { status: 403 });
  }

  try {
    // (3) Hanya proses saat dana benar-benar diterima; sisanya no-op (200).
    if (!isFundsSettled(notification)) {
      return NextResponse.json({ status: "diabaikan" }, { status: 200 });
    }

    // order_id menentukan Booking + jenis pembayaran.
    const parsed = parseOrderId(notification.order_id);
    if (!parsed) {
      return NextResponse.json({ error: "order_id tidak dikenal" }, { status: 400 });
    }
    const { bookingId, kind } = parsed;
    const gatewayRef = notification.order_id; // kunci idempotensi (unik).
    const amount = parseAmount(notification.gross_amount);

    // (4) Gerbang idempotensi: unique `Payment.gatewayRef`. Create dulu; bila sudah ada
    //     (P2002) berarti webhook duplikat → 200 tanpa memanggil service lagi.
    try {
      await prisma.payment.create({
        data: { bookingId, kind, amount, status: "PAID", gatewayRef },
      });
    } catch (error) {
      if (isDuplicateKeyError(error)) {
        return NextResponse.json({ status: "duplikat" }, { status: 200 });
      }
      throw error;
    }

    // (5) Pemrosesan pertama kali → gerakkan state Booking lewat seam service.
    const bookingService = getBookingService();
    if (kind === "DP") {
      await bookingService.payDp({ bookingId, gatewayRef, amount });
    } else {
      await bookingService.settle({ bookingId, gatewayRef, amount });
    }

    return NextResponse.json({ status: "diproses" }, { status: 200 });
  } catch (error) {
    // Kesalahan tak terduga (DB/service) → 500 agar Midtrans mencoba ulang.
    const message = error instanceof Error ? error.message : "kesalahan internal";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

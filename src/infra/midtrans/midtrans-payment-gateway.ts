// Adapter infrastruktur: implementasi port `PaymentGateway` (ADR-0002 / ADR-0005)
// memakai Midtrans REST API lewat global `fetch` — tanpa dependensi npm.
//
// - chargeDp / chargeSettlement: buat transaksi Snap (checkout hosted, beban PCI rendah).
// - refund: panggil Core API refund untuk order DP terkait.
//
// gatewayRef yang dikembalikan = `order_id` yang kita tetapkan. Untuk Snap, `order_id`
// adalah identifier stabil yang muncul kembali di webhook, sehingga cocok sebagai kunci
// idempotensi webhook (lihat ADR-0002 / ADR-0005).

import type { Money } from "@/domain/booking/booking";
import type { PaymentGateway } from "@/domain/booking/ports";
import type {
  MidtransErrorResponse,
  RefundRequest,
  RefundResponse,
  SnapTransactionRequest,
  SnapTransactionResponse,
} from "./types";

/** Jenis pembayaran — menentukan suffix `order_id` agar DP vs Pelunasan berbeda. */
type ChargeKind = "DP" | "SETTLEMENT";

interface MidtransConfig {
  serverKey: string;
  isProduction: boolean;
}

/** Baca konfigurasi dari environment. Rahasia tidak pernah di-hardcode. */
function readConfig(): MidtransConfig {
  const serverKey = process.env.MIDTRANS_SERVER_KEY;
  if (!serverKey) {
    throw new Error("MIDTRANS_SERVER_KEY tidak diset di environment.");
  }
  // Env selalu string; "true" (case-insensitive) berarti produksi.
  const isProduction =
    (process.env.MIDTRANS_IS_PRODUCTION ?? "").toLowerCase() === "true";
  return { serverKey, isProduction };
}

/** Base URL Core API (charge non-Snap & refund). */
function coreApiBaseUrl(isProduction: boolean): string {
  return isProduction
    ? "https://api.midtrans.com"
    : "https://api.sandbox.midtrans.com";
}

/** Endpoint Snap untuk membuat transaksi. */
function snapTransactionsUrl(isProduction: boolean): string {
  return isProduction
    ? "https://app.midtrans.com/snap/v1/transactions"
    : "https://app.sandbox.midtrans.com/snap/v1/transactions";
}

/** HTTP Basic auth: base64 dari `serverKey:` (password kosong). */
function authorizationHeader(serverKey: string): string {
  const token = Buffer.from(`${serverKey}:`).toString("base64");
  return `Basic ${token}`;
}

/** order_id stabil & deterministik per Booking + jenis pembayaran. */
function orderIdFor(bookingId: string, kind: ChargeKind): string {
  return `${bookingId}-${kind}`;
}

/** Ambil pesan error yang jelas dari body respons Midtrans (Snap atau Core). */
function extractErrorMessage(status: number, body: unknown): string {
  const err = body as MidtransErrorResponse | null;
  const detail =
    err?.error_messages?.join("; ") ??
    err?.status_message ??
    "tidak ada detail";
  return `Midtrans merespons HTTP ${status}: ${detail}`;
}

/** POST JSON ke Midtrans dengan Basic auth; lempar error jelas pada non-2xx. */
async function postJson<TResponse>(
  url: string,
  serverKey: string,
  body: unknown,
): Promise<TResponse> {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: authorizationHeader(serverKey),
    },
    body: JSON.stringify(body),
  });

  // Midtrans selalu mengembalikan JSON (termasuk saat error); jaga bila kosong/HTML.
  const parsed: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(extractErrorMessage(response.status, parsed));
  }
  return parsed as TResponse;
}

/**
 * Buat instance `PaymentGateway` berbasis Midtrans.
 * Config dibaca dari env saat pembuatan agar kesalahan konfigurasi cepat terlihat.
 */
export function createMidtransPaymentGateway(): PaymentGateway {
  const { serverKey, isProduction } = readConfig();

  async function charge(
    kind: ChargeKind,
    bookingId: string,
    amount: Money,
  ): Promise<{ gatewayRef: string }> {
    const orderId = orderIdFor(bookingId, kind);
    const request: SnapTransactionRequest = {
      transaction_details: {
        order_id: orderId,
        gross_amount: amount,
      },
    };

    // Snap dipanggil untuk memvalidasi transaksi & mendapatkan token checkout.
    await postJson<SnapTransactionResponse>(
      snapTransactionsUrl(isProduction),
      serverKey,
      request,
    );

    // order_id adalah identifier stabil yang dipakai untuk idempotensi webhook.
    return { gatewayRef: orderId };
  }

  return {
    chargeDp({ bookingId, amount }) {
      return charge("DP", bookingId, amount);
    },

    chargeSettlement({ bookingId, amount }) {
      return charge("SETTLEMENT", bookingId, amount);
    },

    async refund({ bookingId, amount }) {
      // Kebijakan Refund (ADR-0004) mengembalikan DP; refund dikenakan ke order DP.
      const orderId = orderIdFor(bookingId, "DP");
      const request: RefundRequest = {
        refund_key: `${orderId}-refund`,
        amount,
        reason: "Booking cancellation refund",
      };

      const result = await postJson<RefundResponse>(
        `${coreApiBaseUrl(isProduction)}/v2/${encodeURIComponent(orderId)}/refund`,
        serverKey,
        request,
      );

      // Utamakan transaction_id Midtrans; fallback ke refund_key lalu order_id.
      const gatewayRef =
        result.transaction_id ?? result.refund_key ?? request.refund_key;
      return { gatewayRef };
    },
  };
}

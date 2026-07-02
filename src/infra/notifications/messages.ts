// Pemetaan NotificationEvent -> pesan Notifikasi (Bahasa Indonesia, sadar-penerima).
// Kosakata mengikuti CONTEXT.md (Booking, Pelanggan, Admin, DP, Terkonfirmasi, dll).
// Murni fungsi presentasi — tidak menyentuh kanal/pengiriman.

import type { NotificationEvent } from "@/domain/booking/ports";

export type RecipientRole = "CUSTOMER" | "ADMIN";

/** Pesan yang sudah dirender untuk sebuah kejadian: judul singkat + isi. */
export interface RenderedMessage {
  subject: string;
  body: string;
}

/** Ambil `#<id>` pendek untuk ditampilkan; aman bila bookingId kosong. */
function bookingTag(bookingId?: string): string {
  return bookingId ? ` #${bookingId}` : "";
}

/**
 * Render pesan Notifikasi untuk sebuah kejadian & peran penerima.
 * Sengaja sederhana (tanpa template engine) — cukup untuk WhatsApp/Email/Web Push.
 */
export function renderMessage(input: {
  event: NotificationEvent;
  recipientRole: RecipientRole;
  bookingId?: string;
  payload?: Record<string, unknown>;
}): RenderedMessage {
  const { event, recipientRole, bookingId } = input;
  const tag = bookingTag(bookingId);
  const toAdmin = recipientRole === "ADMIN";

  switch (event) {
    case "BOOKING_REQUESTED":
      return toAdmin
        ? {
            subject: `Booking baru${tag}`,
            body: `Ada Permintaan Booking baru${tag}. Stok sedang di-Hold, menunggu pembayaran DP.`,
          }
        : {
            subject: `Permintaan Booking diterima${tag}`,
            body: `Terima kasih. Booking Anda${tag} sudah kami terima dan Stok di-Hold sementara. Segera selesaikan pembayaran DP agar Booking tidak Kedaluwarsa.`,
          };

    case "PAYMENT_RECEIVED":
      return toAdmin
        ? {
            subject: `Pembayaran diterima${tag}`,
            body: `Pembayaran untuk Booking${tag} telah diterima.`,
          }
        : {
            subject: `Pembayaran diterima${tag}`,
            body: `Pembayaran Anda untuk Booking${tag} sudah kami terima. Terima kasih.`,
          };

    case "AWAITING_APPROVAL":
      return toAdmin
        ? {
            subject: `Menunggu Persetujuan${tag}`,
            body: `Booking Lepas Kunci${tag} sudah dibayar dan menunggu persetujuan Verifikasi Pengemudi (SIM/KTP).`,
          }
        : {
            subject: `Booking menunggu persetujuan${tag}`,
            body: `Pembayaran Anda${tag} sudah diterima. Booking sedang menunggu persetujuan Verifikasi Pengemudi dari Admin.`,
          };

    case "BOOKING_CONFIRMED":
      return toAdmin
        ? {
            subject: `Booking Terkonfirmasi${tag}`,
            body: `Booking${tag} kini Terkonfirmasi dan pasti berjalan.`,
          }
        : {
            subject: `Booking Terkonfirmasi${tag}`,
            body: `Kabar baik! Booking Anda${tag} sudah Terkonfirmasi dan pasti berjalan. Sampai jumpa.`,
          };

    case "BOOKING_CANCELLED":
      return toAdmin
        ? {
            subject: `Booking Dibatalkan${tag}`,
            body: `Booking${tag} telah Dibatalkan. Refund DP mengikuti Kebijakan Refund bila berlaku.`,
          }
        : {
            subject: `Booking Dibatalkan${tag}`,
            body: `Booking Anda${tag} telah Dibatalkan. Bila ada refund DP, akan diproses sesuai Kebijakan Refund.`,
          };

    case "MESSAGE_RECEIVED":
      return toAdmin
        ? {
            subject: `Pesan baru dari Pelanggan${tag}`,
            body: `Ada pesan baru pada Percakapan${tag}. Mohon segera dibalas.`,
          }
        : {
            subject: `Pesan baru dari Admin${tag}`,
            body: `Anda menerima pesan baru dari Admin pada Percakapan${tag}.`,
          };

    default: {
      // Exhaustiveness guard — bila NotificationEvent bertambah, TypeScript menandai di sini.
      const _never: never = event;
      return {
        subject: "Notifikasi",
        body: `Notifikasi: ${String(_never)}`,
      };
    }
  }
}

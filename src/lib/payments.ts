// Transaksi (Payment) — proyeksi baca untuk halaman admin: rekonsiliasi DP,
// Pelunasan, Deposit jaminan, dan Refund. Join ringan ke Booking → Mobil/Pelanggan.

import { prisma } from "@/lib/prisma";
import type { PaymentKind, PaymentStatus } from "@prisma/client";

export interface PaymentRow {
  id: string;
  bookingId: string;
  carName: string;
  customerName: string;
  kind: PaymentKind; // DP | SETTLEMENT | REFUND | DEPOSIT
  amount: number;
  status: PaymentStatus;
  gatewayRef?: string;
  createdAt: Date;
}

export interface PaymentFilter {
  from?: Date;
  to?: Date;
  kind?: PaymentKind;
  status?: PaymentStatus;
  bookingId?: string;
}

const INCLUDE = {
  booking: {
    select: {
      carModel: { select: { brand: true, name: true } },
      customer: { select: { name: true } },
    },
  },
} as const;

/** Daftar transaksi terbaru (default 200) mengikuti filter. */
export async function listPayments(filter?: PaymentFilter): Promise<PaymentRow[]> {
  const rows = await prisma.payment.findMany({
    where: {
      ...(filter?.kind ? { kind: filter.kind } : {}),
      ...(filter?.status ? { status: filter.status } : {}),
      ...(filter?.bookingId ? { bookingId: filter.bookingId } : {}),
      ...(filter?.from || filter?.to
        ? {
            createdAt: {
              ...(filter.from ? { gte: filter.from } : {}),
              ...(filter.to ? { lte: filter.to } : {}),
            },
          }
        : {}),
    },
    include: INCLUDE,
    orderBy: { createdAt: "desc" },
    take: 200,
  });
  return rows.map((r) => ({
    id: r.id,
    bookingId: r.bookingId,
    carName: `${r.booking.carModel.brand} ${r.booking.carModel.name}`,
    customerName: r.booking.customer.name ?? "—",
    kind: r.kind,
    amount: r.amount,
    status: r.status,
    gatewayRef: r.gatewayRef ?? undefined,
    createdAt: r.createdAt,
  }));
}

/** Riwayat pembayaran satu Booking (untuk halaman detail booking admin). */
export async function paymentsForBooking(bookingId: string): Promise<PaymentRow[]> {
  return listPayments({ bookingId });
}

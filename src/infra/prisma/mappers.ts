// Pemetaan antara baris Prisma Booking dan tipe domain Booking.
// Domain murni (tanpa Prisma) — konversi terpusat di sini agar adapter tetap bersih.

import type { Booking as PrismaBooking } from "@prisma/client";
import type { Booking } from "@/domain/booking/booking";

/** Baris Prisma Booking -> tipe domain Booking. */
export function toDomainBooking(row: PrismaBooking): Booking {
  return {
    id: row.id,
    carModelId: row.carModelId,
    customerId: row.customerId,
    mode: row.mode,
    status: row.status,
    period: { startAt: row.startAt, endAt: row.endAt },
    handoverMethod: row.handoverMethod ?? undefined,
    pickupPoint: row.pickupPoint ?? undefined,
    allocatedUnitId: row.allocatedUnitId ?? undefined,
    holdExpiresAt: row.holdExpiresAt ?? undefined,
    dpAmount: row.dpAmount ?? undefined,
    settlementAmount: row.settlementAmount ?? undefined,
    createdAt: row.createdAt,
  };
}

/**
 * Kolom-kolom Booking (tanpa relasi & tanpa `updatedAt`) untuk upsert.
 * Dipakai sebagai `create` maupun `update` payload dalam `prisma.booking.upsert`.
 */
export function toPrismaBookingData(booking: Booking) {
  return {
    id: booking.id,
    carModelId: booking.carModelId,
    customerId: booking.customerId,
    mode: booking.mode,
    status: booking.status,
    startAt: booking.period.startAt,
    endAt: booking.period.endAt,
    handoverMethod: booking.handoverMethod ?? null,
    pickupPoint: booking.pickupPoint ?? null,
    allocatedUnitId: booking.allocatedUnitId ?? null,
    holdExpiresAt: booking.holdExpiresAt ?? null,
    dpAmount: booking.dpAmount ?? null,
    settlementAmount: booking.settlementAmount ?? null,
    createdAt: booking.createdAt,
  };
}

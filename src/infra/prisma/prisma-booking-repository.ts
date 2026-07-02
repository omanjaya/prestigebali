// Adapter Prisma untuk port BookingRepository (persistensi & cek ketersediaan).
// Domain tidak tahu Prisma — semua pemetaan lewat mappers.ts.

import type { BookingRepository } from "@/domain/booking/ports";
import type { Booking } from "@/domain/booking/booking";
import { prisma } from "@/lib/prisma";
import { toDomainBooking, toPrismaBookingData } from "./mappers";

export class PrismaBookingRepository implements BookingRepository {
  async save(booking: Booking): Promise<void> {
    const data = toPrismaBookingData(booking);
    await prisma.booking.upsert({
      where: { id: booking.id },
      create: data,
      update: data,
    });
  }

  async findById(id: string): Promise<Booking | null> {
    const row = await prisma.booking.findUnique({ where: { id } });
    return row ? toDomainBooking(row) : null;
  }

  /**
   * Jumlah Stok terpakai untuk sebuah Mobil pada periode tertentu.
   * Overlap [startAt, endAt): existing.startAt < period.endAt AND period.startAt < existing.endAt.
   * Aktif = status AWAITING_APPROVAL/CONFIRMED/ONGOING, ATAU REQUESTED dengan Hold belum
   * kedaluwarsa (holdExpiresAt > now). Dihitung dalam satu query.
   */
  async countActiveForModel(input: {
    carModelId: string;
    period: { startAt: Date; endAt: Date };
    now: Date;
  }): Promise<number> {
    const { carModelId, period, now } = input;
    return prisma.booking.count({
      where: {
        carModelId,
        startAt: { lt: period.endAt },
        endAt: { gt: period.startAt },
        OR: [
          { status: { in: ["AWAITING_APPROVAL", "CONFIRMED", "ONGOING"] } },
          { status: "REQUESTED", holdExpiresAt: { gt: now } },
        ],
      },
    });
  }

  /** Booking REQUESTED yang Hold-nya sudah kedaluwarsa pada `now` (untuk job sweep). */
  async findExpiredHolds(now: Date): Promise<Booking[]> {
    const rows = await prisma.booking.findMany({
      where: {
        status: "REQUESTED",
        holdExpiresAt: { lte: now },
      },
    });
    return rows.map(toDomainBooking);
  }
}

/** Factory jika lebih suka instansiasi via fungsi. */
export function createPrismaBookingRepository(): BookingRepository {
  return new PrismaBookingRepository();
}

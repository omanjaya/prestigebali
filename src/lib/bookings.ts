// Proyeksi tampilan Booking — query Prisma NYATA (menggantikan lib/mock-bookings.ts).
// BookingView = gabungan Booking + Mobil + Pelanggan + Unit teralokasi, untuk halaman
// Status & Admin. Istilah: CONTEXT.md.

import { prisma } from "@/lib/prisma";
import type { BookingStatus, RentalMode } from "@/domain/booking/booking";

export interface BookingView {
  id: string;
  carModelId: string;
  carName: string; // "Toyota Alphard"
  customerName: string;
  customerPhone: string;
  mode: RentalMode;
  status: BookingStatus;
  startAt: Date;
  endAt: Date;
  dpAmount?: number;
  settlementAmount?: number;
  /** "Hitam · B 100 ALP" bila admin sudah meng-Alokasi Unit. */
  allocatedUnit?: string;
  createdAt: Date;
}

const INCLUDE = {
  carModel: { select: { brand: true, name: true } },
  customer: { select: { name: true, phone: true } },
  allocatedUnit: { select: { color: true, plate: true } },
} as const;

type Row = Awaited<ReturnType<typeof prisma.booking.findMany<{ include: typeof INCLUDE }>>>[number];

function toView(row: Row): BookingView {
  return {
    id: row.id,
    carModelId: row.carModelId,
    carName: `${row.carModel.brand} ${row.carModel.name}`,
    customerName: row.customer.name ?? "—",
    customerPhone: row.customer.phone ?? "—",
    mode: row.mode,
    status: row.status,
    startAt: row.startAt,
    endAt: row.endAt,
    dpAmount: row.dpAmount ?? undefined,
    settlementAmount: row.settlementAmount ?? undefined,
    allocatedUnit: row.allocatedUnit
      ? `${row.allocatedUnit.color} · ${row.allocatedUnit.plate}`
      : undefined,
    createdAt: row.createdAt,
  };
}

/** Daftar Booking terbaru (untuk panel Admin). */
export async function listBookings(): Promise<BookingView[]> {
  const rows = await prisma.booking.findMany({
    include: INCLUDE,
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return rows.map(toView);
}

export async function getBooking(id: string): Promise<BookingView | undefined> {
  const row = await prisma.booking.findUnique({ where: { id }, include: INCLUDE });
  return row ? toView(row) : undefined;
}

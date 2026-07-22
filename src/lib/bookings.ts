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
  /** Kode Promo yang dipakai + potongan (snapshot saat booking dibuat). */
  promoCode?: string;
  discountAmount?: number;
  /** Deposit jaminan (Lepas Kunci) — snapshot; ditagih bersama DP, refundable. */
  depositAmount?: number;
  /** "Hitam · B 100 ALP" bila admin sudah meng-Alokasi Unit. */
  allocatedUnit?: string;
  /** Id Unit teralokasi (mentah) — untuk pra-pilih di form Alokasi admin. */
  allocatedUnitId?: string;
  /** Kapan Hold Stok kedaluwarsa (untuk countdown di halaman status). */
  holdExpiresAt?: Date;
  /** Verifikasi Pengemudi (Lepas Kunci) — data SIM/KTP yang dikirim pelanggan. */
  licenseName?: string;
  licenseNumber?: string;
  ktpNumber?: string;
  verificationSubmittedAt?: Date;
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
    promoCode: row.promoCode ?? undefined,
    discountAmount: row.discountAmount ?? undefined,
    depositAmount: row.depositAmount ?? undefined,
    allocatedUnit: row.allocatedUnit
      ? `${row.allocatedUnit.color} · ${row.allocatedUnit.plate}`
      : undefined,
    allocatedUnitId: row.allocatedUnitId ?? undefined,
    holdExpiresAt: row.holdExpiresAt ?? undefined,
    licenseName: row.licenseName ?? undefined,
    licenseNumber: row.licenseNumber ?? undefined,
    ktpNumber: row.ktpNumber ?? undefined,
    verificationSubmittedAt: row.verificationSubmittedAt ?? undefined,
    createdAt: row.createdAt,
  };
}

/**
 * Simpan data Verifikasi Pengemudi (SIM/KTP) yang dikirim Pelanggan pada Booking
 * Lepas Kunci. Menandai `verificationSubmittedAt` agar admin tahu data siap ditinjau.
 * Prototype fase 1: teks saja (tanpa unggah berkas).
 */
export async function saveDriverVerification(input: {
  bookingId: string;
  licenseName: string;
  licenseNumber: string;
  ktpNumber: string;
}): Promise<void> {
  await prisma.booking.update({
    where: { id: input.bookingId },
    data: {
      licenseName: input.licenseName,
      licenseNumber: input.licenseNumber,
      ktpNumber: input.ktpNumber,
      verificationSubmittedAt: new Date(),
    },
  });
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

export interface BookingSearchFilter {
  /** Cari di kode booking, nama, atau nomor HP pelanggan (case-insensitive). */
  q?: string;
  status?: BookingStatus;
  page?: number; // 1-based
  pageSize?: number; // default 25
}

/** Pencarian + pagination Booking untuk dashboard admin. */
export async function searchBookings(
  filter?: BookingSearchFilter,
): Promise<{ rows: BookingView[]; total: number; page: number; pageSize: number }> {
  const page = Math.max(1, filter?.page ?? 1);
  const pageSize = Math.min(100, Math.max(5, filter?.pageSize ?? 25));
  const q = filter?.q?.trim();
  const where = {
    ...(filter?.status ? { status: filter.status } : {}),
    ...(q
      ? {
          OR: [
            { id: { contains: q, mode: "insensitive" as const } },
            { customer: { name: { contains: q, mode: "insensitive" as const } } },
            { customer: { phone: { contains: q } } },
          ],
        }
      : {}),
  };
  const [total, rows] = await Promise.all([
    prisma.booking.count({ where }),
    prisma.booking.findMany({
      where,
      include: INCLUDE,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);
  return { rows: rows.map(toView), total, page, pageSize };
}

export async function getBooking(id: string): Promise<BookingView | undefined> {
  const row = await prisma.booking.findUnique({ where: { id }, include: INCLUDE });
  return row ? toView(row) : undefined;
}

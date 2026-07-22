// Kode Promo — validasi (alur booking) + CRUD (panel admin). Kode dibagikan admin
// secara privat (chat/WA), tidak dipublikasikan. Potongan di-snapshot ke Booking
// saat dibuat, jadi perubahan promo belakangan tidak mengubah booking lama.

import { prisma } from "@/lib/prisma";
import type { PromoKind } from "@prisma/client";

export interface PromoView {
  id: string;
  code: string;
  kind: PromoKind; // PERCENT | FIXED
  value: number;
  active: boolean;
  expiresAt?: Date;
  maxUses?: number;
  usedCount: number;
  note?: string;
  createdAt: Date;
}

export type PromoCheck =
  | { ok: true; promo: PromoView; }
  | { ok: false; reason: "NOT_FOUND" | "INACTIVE" | "EXPIRED" | "MAX_USES" };

function toView(row: {
  id: string; code: string; kind: PromoKind; value: number; active: boolean;
  expiresAt: Date | null; maxUses: number | null; usedCount: number;
  note: string | null; createdAt: Date;
}): PromoView {
  return {
    id: row.id,
    code: row.code,
    kind: row.kind,
    value: row.value,
    active: row.active,
    expiresAt: row.expiresAt ?? undefined,
    maxUses: row.maxUses ?? undefined,
    usedCount: row.usedCount,
    note: row.note ?? undefined,
    createdAt: row.createdAt,
  };
}

/** Normalisasi input kode (trim + uppercase) agar "summer10" == "SUMMER10". */
export function normalizeCode(code: string): string {
  return code.trim().toUpperCase();
}

/** Validasi sebuah kode promo terhadap aturan aktif/kedaluwarsa/kuota. */
export async function checkPromoCode(code: string): Promise<PromoCheck> {
  const normalized = normalizeCode(code);
  if (!normalized) return { ok: false, reason: "NOT_FOUND" };
  const row = await prisma.promoCode.findUnique({ where: { code: normalized } });
  if (!row) return { ok: false, reason: "NOT_FOUND" };
  if (!row.active) return { ok: false, reason: "INACTIVE" };
  if (row.expiresAt && row.expiresAt.getTime() < Date.now()) {
    return { ok: false, reason: "EXPIRED" };
  }
  if (row.maxUses != null && row.usedCount >= row.maxUses) {
    return { ok: false, reason: "MAX_USES" };
  }
  return { ok: true, promo: toView(row) };
}

/** Hitung potongan rupiah sebuah promo terhadap total sewa (dibatasi ≤ total). */
export function computeDiscount(promo: Pick<PromoView, "kind" | "value">, total: number): number {
  const raw =
    promo.kind === "PERCENT"
      ? Math.floor((total * Math.min(Math.max(promo.value, 0), 100)) / 100)
      : promo.value;
  return Math.min(Math.max(0, raw), total);
}

/** Catat satu pemakaian kode (dipanggil saat Booking ber-promo berhasil dibuat). */
export async function recordPromoUse(code: string): Promise<void> {
  await prisma.promoCode
    .update({ where: { code: normalizeCode(code) }, data: { usedCount: { increment: 1 } } })
    .catch(() => {}); // kode terhapus admin di sela waktu → abaikan, booking tetap sah
}

// --- CRUD untuk panel admin ---

export async function listPromoCodes(): Promise<PromoView[]> {
  const rows = await prisma.promoCode.findMany({ orderBy: { createdAt: "desc" } });
  return rows.map(toView);
}

export async function getPromoCode(id: string): Promise<PromoView | undefined> {
  const row = await prisma.promoCode.findUnique({ where: { id } });
  return row ? toView(row) : undefined;
}

export interface PromoInput {
  code: string;
  kind: PromoKind;
  value: number;
  active: boolean;
  expiresAt?: Date;
  maxUses?: number;
  note?: string;
}

export async function createPromoCode(input: PromoInput): Promise<void> {
  await prisma.promoCode.create({
    data: {
      code: normalizeCode(input.code),
      kind: input.kind,
      value: input.value,
      active: input.active,
      expiresAt: input.expiresAt ?? null,
      maxUses: input.maxUses ?? null,
      note: input.note || null,
    },
  });
}

export async function updatePromoCode(id: string, input: PromoInput): Promise<void> {
  await prisma.promoCode.update({
    where: { id },
    data: {
      code: normalizeCode(input.code),
      kind: input.kind,
      value: input.value,
      active: input.active,
      expiresAt: input.expiresAt ?? null,
      maxUses: input.maxUses ?? null,
      note: input.note || null,
    },
  });
}

export async function deletePromoCode(id: string): Promise<void> {
  await prisma.promoCode.delete({ where: { id } });
}

export interface PromoUsageRow {
  bookingId: string;
  customerName: string;
  carName: string;
  status: string;
  discountAmount: number;
  createdAt: Date;
}

/** Booking terbaru yang memakai sebuah kode (insight pemakaian promo di admin). */
export async function listBookingsForPromo(code: string): Promise<PromoUsageRow[]> {
  const rows = await prisma.booking.findMany({
    where: { promoCode: normalizeCode(code) },
    include: {
      carModel: { select: { brand: true, name: true } },
      customer: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 25,
  });
  return rows.map((r) => ({
    bookingId: r.id,
    customerName: r.customer.name ?? "—",
    carName: `${r.carModel.brand} ${r.carModel.name}`,
    status: r.status,
    discountAmount: r.discountAmount ?? 0,
    createdAt: r.createdAt,
  }));
}

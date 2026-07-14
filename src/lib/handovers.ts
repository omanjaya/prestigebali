// Serah-terima kendaraan (Berita Acara). Query Prisma untuk checklist kondisi
// mobil saat Pengambilan (OUT) & Pengembalian (IN). Satu OUT + satu IN per booking.

import { prisma } from "@/lib/prisma";
import type { HandoverPhase } from "@prisma/client";

export type { HandoverPhase };

export interface HandoverView {
  id: string;
  phase: HandoverPhase;
  odometer: number;
  fuelEighths: number; // 0..8 (E..F)
  exteriorClean: boolean;
  interiorClean: boolean;
  tiresOk: boolean;
  docStnk: boolean;
  spareTire: boolean;
  jack: boolean;
  toolkit: boolean;
  firstAidKit: boolean;
  accessories: string[];
  damageNotes?: string;
  notes?: string;
  staffName?: string;
  signedByStaff: boolean;
  signedByCustomer: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/** Pasangan checklist untuk satu booking. */
export interface HandoverPair {
  out?: HandoverView;
  in?: HandoverView;
}

/** Field kelengkapan standar — dipakai bersama form, komparasi & cetak. */
export const EQUIPMENT_FIELDS = [
  { key: "docStnk", label: "STNK" },
  { key: "spareTire", label: "Ban serep" },
  { key: "jack", label: "Dongkrak & kunci roda" },
  { key: "toolkit", label: "Tool kit" },
  { key: "firstAidKit", label: "P3K" },
] as const;

/** Field kondisi umum. */
export const CONDITION_FIELDS = [
  { key: "exteriorClean", label: "Eksterior bersih" },
  { key: "interiorClean", label: "Interior bersih" },
  { key: "tiresOk", label: "Kondisi ban OK" },
] as const;

export type EquipmentKey = (typeof EQUIPMENT_FIELDS)[number]["key"];
export type ConditionKey = (typeof CONDITION_FIELDS)[number]["key"];

type Row = Awaited<ReturnType<typeof prisma.handover.findMany>>[number];

function toView(row: Row): HandoverView {
  return {
    id: row.id,
    phase: row.phase,
    odometer: row.odometer,
    fuelEighths: row.fuelEighths,
    exteriorClean: row.exteriorClean,
    interiorClean: row.interiorClean,
    tiresOk: row.tiresOk,
    docStnk: row.docStnk,
    spareTire: row.spareTire,
    jack: row.jack,
    toolkit: row.toolkit,
    firstAidKit: row.firstAidKit,
    accessories: row.accessories,
    damageNotes: row.damageNotes ?? undefined,
    notes: row.notes ?? undefined,
    staffName: row.staffName ?? undefined,
    signedByStaff: row.signedByStaff,
    signedByCustomer: row.signedByCustomer,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

/** Ambil checklist OUT & IN untuk sebuah booking. */
export async function getHandovers(bookingId: string): Promise<HandoverPair> {
  const rows = await prisma.handover.findMany({ where: { bookingId } });
  const pair: HandoverPair = {};
  for (const row of rows) {
    if (row.phase === "OUT") pair.out = toView(row);
    else pair.in = toView(row);
  }
  return pair;
}

/** Level BBM sebagai teks, mis. 8 → "F (penuh)", 4 → "1/2", 0 → "E (kosong)". */
export function fuelLabel(eighths: number): string {
  const e = Math.min(8, Math.max(0, Math.round(eighths)));
  if (e === 0) return "E (kosong)";
  if (e === 8) return "F (penuh)";
  if (e === 4) return "1/2";
  if (e === 2) return "1/4";
  if (e === 6) return "3/4";
  return `${e}/8`;
}

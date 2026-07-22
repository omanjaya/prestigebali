// Unit (CarUnit) — helper baca & tulis untuk pengelolaan armada fisik oleh Admin dan
// untuk Alokasi Unit ke Booking. Istilah: CONTEXT.md (Unit, Alokasi, Stok).

import { prisma } from "@/lib/prisma";

export interface UnitView {
  id: string;
  carModelId: string;
  plate: string;
  color: string;
  odometer: number;
  condition?: string;
}

type UnitRow = {
  id: string;
  carModelId: string;
  plate: string;
  color: string;
  odometer: number;
  condition: string | null;
};

function toView(row: UnitRow): UnitView {
  return {
    id: row.id,
    carModelId: row.carModelId,
    plate: row.plate,
    color: row.color,
    odometer: row.odometer,
    condition: row.condition ?? undefined,
  };
}

/** Semua Unit di bawah sebuah Mobil (untuk picker Alokasi). */
export async function listUnitsForModel(carModelId: string): Promise<UnitView[]> {
  const rows = await prisma.carUnit.findMany({
    where: { carModelId },
    orderBy: { plate: "asc" },
  });
  return rows.map(toView);
}

/** Semua Unit lintas Mobil, disertai nama Mobil (untuk halaman kelola Unit admin). */
export async function listAllUnits(): Promise<(UnitView & { carName: string })[]> {
  const rows = await prisma.carUnit.findMany({
    include: { carModel: { select: { brand: true, name: true } } },
    orderBy: [{ carModelId: "asc" }, { plate: "asc" }],
  });
  return rows.map((r) => ({
    ...toView(r),
    carName: `${r.carModel.brand} ${r.carModel.name}`,
  }));
}

export async function getUnit(id: string): Promise<UnitView | undefined> {
  const row = await prisma.carUnit.findUnique({ where: { id } });
  return row ? toView(row) : undefined;
}

export async function createUnit(input: {
  carModelId: string;
  plate: string;
  color: string;
  odometer: number;
  condition?: string;
}): Promise<void> {
  await prisma.carUnit.create({
    data: {
      carModelId: input.carModelId,
      plate: input.plate,
      color: input.color,
      odometer: input.odometer,
      condition: input.condition || null,
    },
  });
}

export async function updateUnit(
  id: string,
  input: { plate: string; color: string; odometer: number; condition?: string },
): Promise<void> {
  await prisma.carUnit.update({
    where: { id },
    data: {
      plate: input.plate,
      color: input.color,
      odometer: input.odometer,
      condition: input.condition || null,
    },
  });
}

export async function deleteUnit(id: string): Promise<void> {
  await prisma.carUnit.delete({ where: { id } });
}

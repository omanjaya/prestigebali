// Katalog Mobil — query Prisma NYATA (menggantikan mock; DB di-seed via prisma/seed.mjs).
// API shape dipertahankan dari versi mock, tetapi kini async. Istilah: CONTEXT.md.

import { prisma } from "@/lib/prisma";
import type { Category as PrismaCategory } from "@prisma/client";

export type Category = PrismaCategory;

export const CATEGORY_LABEL: Record<Category, string> = {
  SPORT: "Sport / Supercar",
  LUXURY_SEDAN: "Sedan Mewah",
  LUXURY_SUV: "SUV Mewah",
  PREMIUM_MPV: "MPV Premium",
};

export interface CarModelView {
  id: string;
  name: string;
  brand: string;
  year: number;
  transmission: string;
  seats: number;
  category: Category;
  photos: string[];
  /** Tarif Harian (Lepas Kunci), rupiah. */
  dailyRate?: number;
  /** Paket 12 Jam (Pakai Sopir), rupiah. */
  chauffeurPackage?: number;
  stock: number;
}

type CarModelRow = {
  id: string;
  name: string;
  brand: string;
  year: number;
  transmission: string;
  seats: number;
  category: Category;
  photos: string[];
  dailyRate: number | null;
  chauffeurPackage: number | null;
  stock: number;
};

function toView(row: CarModelRow): CarModelView {
  return {
    id: row.id,
    name: row.name,
    brand: row.brand,
    year: row.year,
    transmission: row.transmission,
    seats: row.seats,
    category: row.category,
    photos: row.photos,
    dailyRate: row.dailyRate ?? undefined,
    chauffeurPackage: row.chauffeurPackage ?? undefined,
    stock: row.stock,
  };
}

export async function listCarModels(filter?: {
  category?: Category;
  brand?: string;
}): Promise<CarModelView[]> {
  const rows = await prisma.carModel.findMany({
    where: {
      ...(filter?.category ? { category: filter.category } : {}),
      ...(filter?.brand ? { brand: filter.brand } : {}),
    },
    orderBy: [{ brand: "asc" }, { name: "asc" }],
  });
  return rows.map(toView);
}

export async function getCarModel(id: string): Promise<CarModelView | undefined> {
  const row = await prisma.carModel.findUnique({ where: { id } });
  return row ? toView(row) : undefined;
}

export async function listCategories(): Promise<Category[]> {
  const rows = await prisma.carModel.findMany({ select: { category: true }, distinct: ["category"] });
  return rows.map((r) => r.category);
}

export async function listBrands(): Promise<string[]> {
  const rows = await prisma.carModel.findMany({
    select: { brand: true },
    distinct: ["brand"],
    orderBy: { brand: "asc" },
  });
  return rows.map((r) => r.brand);
}

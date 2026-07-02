// Data katalog MOCK untuk UI (belum ada DB/Docker). Bentuknya mencerminkan model
// Prisma `CarModel`. Ganti dengan query Prisma nyata saat DB siap.
// Istilah mengikuti CONTEXT.md (Mobil, Kategori, Stok, Tarif Harian, Paket 12 Jam).

export type Category = "SPORT" | "LUXURY_SEDAN" | "LUXURY_SUV" | "PREMIUM_MPV";

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
  /** URL foto; kosong → UI menampilkan placeholder gradien. */
  photos: string[];
  /** Tarif Harian (Lepas Kunci), rupiah. */
  dailyRate?: number;
  /** Paket 12 Jam (Pakai Sopir), rupiah. */
  chauffeurPackage?: number;
  stock: number;
}

const CATALOG: CarModelView[] = [
  {
    id: "ferrari-488",
    name: "488 GTB",
    brand: "Ferrari",
    year: 2019,
    transmission: "Otomatis",
    seats: 2,
    category: "SPORT",
    photos: [],
    dailyRate: 12_000_000,
    chauffeurPackage: 8_000_000,
    stock: 1,
  },
  {
    id: "lamborghini-huracan",
    name: "Huracán EVO",
    brand: "Lamborghini",
    year: 2021,
    transmission: "Otomatis",
    seats: 2,
    category: "SPORT",
    photos: [],
    dailyRate: 15_000_000,
    stock: 1,
  },
  {
    id: "mercedes-s-class",
    name: "S 450",
    brand: "Mercedes-Benz",
    year: 2022,
    transmission: "Otomatis",
    seats: 5,
    category: "LUXURY_SEDAN",
    photos: [],
    dailyRate: 5_000_000,
    chauffeurPackage: 3_500_000,
    stock: 2,
  },
  {
    id: "bmw-7",
    name: "740Li",
    brand: "BMW",
    year: 2021,
    transmission: "Otomatis",
    seats: 5,
    category: "LUXURY_SEDAN",
    photos: [],
    dailyRate: 4_500_000,
    chauffeurPackage: 3_200_000,
    stock: 1,
  },
  {
    id: "range-rover-vogue",
    name: "Range Rover Vogue",
    brand: "Land Rover",
    year: 2022,
    transmission: "Otomatis",
    seats: 5,
    category: "LUXURY_SUV",
    photos: [],
    dailyRate: 6_000_000,
    chauffeurPackage: 4_000_000,
    stock: 2,
  },
  {
    id: "toyota-alphard",
    name: "Alphard",
    brand: "Toyota",
    year: 2023,
    transmission: "Otomatis",
    seats: 7,
    category: "PREMIUM_MPV",
    photos: [],
    dailyRate: 2_500_000,
    chauffeurPackage: 1_800_000,
    stock: 4,
  },
];

export function listCarModels(filter?: { category?: Category; brand?: string }): CarModelView[] {
  return CATALOG.filter((c) => {
    if (filter?.category && c.category !== filter.category) return false;
    if (filter?.brand && c.brand !== filter.brand) return false;
    return true;
  });
}

export function getCarModel(id: string): CarModelView | undefined {
  return CATALOG.find((c) => c.id === id);
}

export function listCategories(): Category[] {
  return Array.from(new Set(CATALOG.map((c) => c.category)));
}

export function listBrands(): string[] {
  return Array.from(new Set(CATALOG.map((c) => c.brand))).sort();
}

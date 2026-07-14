// Seed katalog Mobil (CarModel + CarUnit) — id disamakan dengan src/lib/catalog.ts
// agar UI (yang masih membaca mock) dan DB konsisten. Jalankan: node prisma/seed.mjs
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Foto interim dari Unsplash (URL terverifikasi 200). Ganti dgn foto armada asli nanti.
const IMG = (id) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1400&q=72`;

const CARS = [
  { id: "ferrari-488", name: "488 GTB", brand: "Ferrari", year: 2019, transmission: "Automatic", seats: 2, category: "SPORT", stock: 1, dailyRate: 12_000_000, chauffeurPackage: 8_000_000, photos: [IMG("1535448580089-c7f9490c78b1")], units: [{ plate: "B 488 FER", color: "Merah" }] },
  { id: "lamborghini-huracan", name: "Huracán EVO", brand: "Lamborghini", year: 2021, transmission: "Automatic", seats: 2, category: "SPORT", stock: 1, dailyRate: 15_000_000, chauffeurPackage: null, photos: [IMG("1544218159-ee555140c5b0")], units: [{ plate: "B 63 LAM", color: "Hijau" }] },
  { id: "mercedes-s-class", name: "S 450", brand: "Mercedes-Benz", year: 2022, transmission: "Automatic", seats: 5, category: "LUXURY_SEDAN", stock: 2, dailyRate: 5_000_000, chauffeurPackage: 3_500_000, photos: [IMG("1610099610040-ab19f3a5ec35")], units: [{ plate: "B 450 MB", color: "Hitam" }, { plate: "B 451 MB", color: "Putih" }] },
  { id: "bmw-7", name: "740Li", brand: "BMW", year: 2021, transmission: "Automatic", seats: 5, category: "LUXURY_SEDAN", stock: 1, dailyRate: 4_500_000, chauffeurPackage: 3_200_000, photos: [IMG("1601362840469-51e4d8d58785")], units: [{ plate: "B 740 BW", color: "Hitam" }] },
  { id: "range-rover-vogue", name: "Range Rover Vogue", brand: "Land Rover", year: 2022, transmission: "Automatic", seats: 5, category: "LUXURY_SUV", stock: 2, dailyRate: 6_000_000, chauffeurPackage: 4_000_000, photos: [IMG("1549632891-a0bea6d0355b")], units: [{ plate: "B 1 RRV", color: "Hitam" }, { plate: "B 2 RRV", color: "Putih" }] },
  { id: "toyota-alphard", name: "Alphard", brand: "Toyota", year: 2023, transmission: "Automatic", seats: 7, category: "PREMIUM_MPV", stock: 4, dailyRate: 2_500_000, chauffeurPackage: 1_800_000, photos: [IMG("1558101847-e017d5e414a4")], units: [{ plate: "B 100 ALP", color: "Hitam" }, { plate: "B 101 ALP", color: "Hitam" }, { plate: "B 102 ALP", color: "Putih" }, { plate: "B 103 ALP", color: "Putih" }] },
];

for (const { units, ...car } of CARS) {
  await prisma.carModel.upsert({
    where: { id: car.id },
    create: { ...car },
    update: { ...car },
  });
  for (const unit of units) {
    await prisma.carUnit.upsert({
      where: { plate: unit.plate },
      create: { ...unit, carModelId: car.id },
      update: { ...unit, carModelId: car.id },
    });
  }
}

const models = await prisma.carModel.count();
const unitCount = await prisma.carUnit.count();
console.log(`Seed selesai: ${models} Mobil, ${unitCount} Unit.`);
await prisma.$disconnect();

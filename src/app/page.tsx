// Etalase / Landing — Server Component (force-dynamic, baca DB).
// Menyiapkan data plain lalu menyerahkan ke <Landing/> (client, beranimasi).

import { listCarModels, listCategories, listBrands, CATEGORY_LABEL } from "@/lib/catalog";
import { Landing, type CarCard } from "./landing";

export const dynamic = "force-dynamic";

export default async function Page() {
  const [cars, categories, brands] = await Promise.all([
    listCarModels(),
    listCategories(),
    listBrands(),
  ]);

  const cards: CarCard[] = cars.map((c) => ({
    id: c.id,
    name: c.name,
    brand: c.brand,
    year: c.year,
    transmission: c.transmission,
    seats: c.seats,
    category: c.category,
    categoryLabel: CATEGORY_LABEL[c.category],
    photo: c.photos[0],
    dailyRate: c.dailyRate,
    chauffeurPackage: c.chauffeurPackage,
  }));

  const categoryOptions = categories.map((value) => ({ value, label: CATEGORY_LABEL[value] }));

  return <Landing cars={cards} categories={categoryOptions} brands={brands} />;
}

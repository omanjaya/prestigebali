// Etalase (showroom, browse-first) — Server Component.
// Menampilkan hero, filter Kategori/Brand via URL search params, dan grid katalog Mobil.

import {
  listCarModels,
  listCategories,
  listBrands,
  CATEGORY_LABEL,
  type Category,
} from "@/lib/catalog";
import { formatIDR, MODE_LABEL } from "@/ui/format";
import { Container, Card, CardBody, CardMedia, Badge, ButtonLink } from "@/ui/primitives";

// Selalu render dinamis: katalog dibaca langsung dari DB (Prisma).
export const dynamic = "force-dynamic";

/** Bangun querystring `?category=...&brand=...`, hanya sertakan nilai yang ada. */
function buildHref(params: { category?: string; brand?: string }): string {
  const sp = new URLSearchParams();
  if (params.category) sp.set("category", params.category);
  if (params.brand) sp.set("brand", params.brand);
  const qs = sp.toString();
  return qs ? `/?${qs}` : "/";
}

function isCategory(value: string | undefined, categories: Category[]): value is Category {
  return value !== undefined && (categories as string[]).includes(value);
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; brand?: string }>;
}) {
  const { category: rawCategory, brand: rawBrand } = await searchParams;

  const categories = await listCategories();
  const brands = await listBrands();

  // Hanya kategori valid yang dipakai sebagai filter; sisanya diabaikan.
  const activeCategory = isCategory(rawCategory, categories) ? rawCategory : undefined;
  const activeBrand = rawBrand && brands.includes(rawBrand) ? rawBrand : undefined;

  const cars = await listCarModels({ category: activeCategory, brand: activeBrand });

  return (
    <Container>
      {/* Hero */}
      <section className="hero">
        <h1>
          Sewa Mobil Mewah dengan Standar <span style={{ color: "var(--accent)" }}>Prestige</span>
        </h1>
        <p className="muted" style={{ fontSize: "1.1rem", maxWidth: 640 }}>
          Koleksi supercar, sedan, SUV, dan MPV premium siap mengantar setiap momen penting Anda.
          Pilih <strong>Lepas Kunci</strong> untuk kebebasan berkendara, atau{" "}
          <strong>Pakai Sopir</strong> untuk kenyamanan tanpa kompromi.
        </p>
      </section>

      {/* Filter Kategori */}
      <div className="stack" style={{ marginBottom: "2rem", gap: "0.75rem" }}>
        <div className="stack" style={{ gap: "0.4rem" }}>
          <span className="muted" style={{ fontSize: "0.85rem" }}>
            Kategori
          </span>
          <div className="row">
            <FilterChip
              href={buildHref({ brand: activeBrand })}
              label="Semua"
              active={!activeCategory}
            />
            {categories.map((cat) => (
              <FilterChip
                key={cat}
                href={buildHref({ category: cat, brand: activeBrand })}
                label={CATEGORY_LABEL[cat]}
                active={activeCategory === cat}
              />
            ))}
          </div>
        </div>

        {/* Filter Brand */}
        <div className="stack" style={{ gap: "0.4rem" }}>
          <span className="muted" style={{ fontSize: "0.85rem" }}>
            Merek
          </span>
          <div className="row">
            <FilterChip
              href={buildHref({ category: activeCategory })}
              label="Semua"
              active={!activeBrand}
            />
            {brands.map((brand) => (
              <FilterChip
                key={brand}
                href={buildHref({ category: activeCategory, brand })}
                label={brand}
                active={activeBrand === brand}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Grid katalog / empty state */}
      {cars.length === 0 ? (
        <Card>
          <CardBody>
            <h3 style={{ marginTop: 0 }}>Tidak ada mobil yang cocok</h3>
            <p className="muted" style={{ margin: 0 }}>
              Coba ubah atau atur ulang filter untuk melihat koleksi lainnya.
            </p>
            <div style={{ marginTop: "1rem" }}>
              <ButtonLink href="/" variant="ghost">
                Atur Ulang Filter
              </ButtonLink>
            </div>
          </CardBody>
        </Card>
      ) : (
        <div className="grid" style={{ paddingBottom: "3rem" }}>
          {cars.map((car) => (
            <Card key={car.id}>
              <CardMedia label={`${car.brand} ${car.name}`} />
              <CardBody>
                <div className="row" style={{ justifyContent: "space-between", alignItems: "start" }}>
                  <div>
                    <h3 style={{ margin: 0 }}>{car.name}</h3>
                    <span className="muted">{car.brand}</span>
                  </div>
                  <Badge variant="accent">{CATEGORY_LABEL[car.category]}</Badge>
                </div>

                <p className="muted" style={{ fontSize: "0.85rem", margin: "0.75rem 0 0" }}>
                  {car.year} · {car.transmission} · {car.seats} kursi
                </p>

                <div className="stack" style={{ gap: "0.25rem", margin: "0.9rem 0" }}>
                  {car.dailyRate !== undefined ? (
                    <div className="row" style={{ justifyContent: "space-between", gap: "0.5rem" }}>
                      <span className="muted" style={{ fontSize: "0.85rem" }}>
                        {MODE_LABEL.SELF_DRIVE}
                      </span>
                      <strong>{formatIDR(car.dailyRate)}</strong>
                    </div>
                  ) : null}
                  {car.chauffeurPackage !== undefined ? (
                    <div className="row" style={{ justifyContent: "space-between", gap: "0.5rem" }}>
                      <span className="muted" style={{ fontSize: "0.85rem" }}>
                        {MODE_LABEL.CHAUFFEUR}
                      </span>
                      <strong>{formatIDR(car.chauffeurPackage)}</strong>
                    </div>
                  ) : null}
                </div>

                <ButtonLink href={`/mobil/${car.id}`} variant="primary">
                  Lihat Detail
                </ButtonLink>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </Container>
  );
}

/** Chip filter berbasis link; yang aktif ditandai `badge badge-accent`. */
function FilterChip({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <a href={href} className={active ? "badge badge-accent" : "badge"}>
      {label}
    </a>
  );
}

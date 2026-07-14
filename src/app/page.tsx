// Etalase (showroom, browse-first) — Editorial Noir. Server Component.
// Hero full-bleed + filter Kategori/Brand (URL search params) + grid katalog berfoto.

import Image from "next/image";
import {
  listCarModels,
  listCategories,
  listBrands,
  CATEGORY_LABEL,
  type Category,
} from "@/lib/catalog";
import { formatIDR, MODE_LABEL } from "@/ui/format";
import { Container, Card, CardBody, CardMedia, Badge, ButtonLink } from "@/ui/primitives";
import { Icon } from "@/ui/icons";

export const dynamic = "force-dynamic";

const HERO_IMG =
  "https://images.unsplash.com/photo-1577473403731-a36ec9087f44?auto=format&fit=crop&w=2000&q=75";

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
  const activeCategory = isCategory(rawCategory, categories) ? rawCategory : undefined;
  const activeBrand = rawBrand && brands.includes(rawBrand) ? rawBrand : undefined;
  const cars = await listCarModels({ category: activeCategory, brand: activeBrand });

  return (
    <>
      {/* Hero full-bleed */}
      <section className="hero">
        <div className="hero-media">
          <Image src={HERO_IMG} alt="Mobil mewah Prestige" fill priority sizes="100vw" />
        </div>
        <div className="hero-scrim" />
        <div className="hero-content">
          <Container>
            <div className="hero-text rise">
              <span className="kicker">Sewa Mobil Mewah · Jakarta</span>
              <h1>
                Berkendara dalam
                <br />
                keheningan yang mewah.
              </h1>
              <div className="hero-rule" />
              <p className="muted" style={{ fontSize: "1.05rem", maxWidth: 500 }}>
                Koleksi supercar, sedan, SUV, dan MPV premium. Pilih <strong>Lepas Kunci</strong>{" "}
                untuk kebebasan berkendara, atau <strong>Pakai Sopir</strong> untuk kenyamanan
                tanpa kompromi.
              </p>
              <div className="row" style={{ marginTop: "1.75rem" }}>
                <ButtonLink href="#koleksi" variant="primary">
                  Jelajahi Koleksi <Icon name="arrow" size={16} />
                </ButtonLink>
              </div>
            </div>
          </Container>
        </div>
      </section>

      <Container>
        {/* Filter */}
        <div id="koleksi" className="section-head">
          <div>
            <span className="eyebrow">Koleksi</span>
            <h2 style={{ margin: "0.5rem 0 0" }}>Armada Prestige</h2>
          </div>
          <span className="muted" style={{ fontSize: "0.85rem" }}>
            {cars.length} mobil tersedia
          </span>
        </div>

        <div className="stack" style={{ marginBottom: "2.5rem", gap: "1rem" }}>
          <div className="stack" style={{ gap: "0.55rem" }}>
            <span className="eyebrow">Kategori</span>
            <div className="row">
              <FilterChip href={buildHref({ brand: activeBrand })} label="Semua" active={!activeCategory} />
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
          <div className="stack" style={{ gap: "0.55rem" }}>
            <span className="eyebrow">Merek</span>
            <div className="row">
              <FilterChip href={buildHref({ category: activeCategory })} label="Semua" active={!activeBrand} />
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

        {/* Grid */}
        {cars.length === 0 ? (
          <Card>
            <CardBody>
              <h3 style={{ marginTop: 0 }}>Tidak ada mobil yang cocok</h3>
              <p className="muted" style={{ margin: "0 0 1.25rem" }}>
                Coba ubah atau atur ulang filter untuk melihat koleksi lainnya.
              </p>
              <ButtonLink href="/" variant="ghost">
                Atur ulang filter
              </ButtonLink>
            </CardBody>
          </Card>
        ) : (
          <div className="grid" style={{ paddingBottom: "1rem" }}>
            {cars.map((car) => (
              <Card key={car.id}>
                <CardMedia label={`${car.brand} ${car.name}`} src={car.photos[0]} />
                <CardBody>
                  <div className="row" style={{ justifyContent: "space-between", alignItems: "start" }}>
                    <div>
                      <h3 style={{ margin: 0, fontSize: "1.4rem" }}>{car.name}</h3>
                      <span className="muted" style={{ fontSize: "0.9rem" }}>
                        {car.brand} · {car.year}
                      </span>
                    </div>
                    <Badge variant="accent">{CATEGORY_LABEL[car.category]}</Badge>
                  </div>

                  <p className="muted" style={{ fontSize: "0.82rem", margin: "0.85rem 0 0" }}>
                    {car.transmission} · {car.seats} kursi
                  </p>

                  <hr className="divider" style={{ margin: "1.1rem 0" }} />

                  <div className="stack" style={{ gap: "0.4rem", marginBottom: "1.25rem" }}>
                    {car.dailyRate !== undefined ? (
                      <div className="row" style={{ justifyContent: "space-between" }}>
                        <span className="eyebrow">{MODE_LABEL.SELF_DRIVE}</span>
                        <span>
                          <span className="price">{formatIDR(car.dailyRate)}</span>{" "}
                          <span className="price-unit">/ hari</span>
                        </span>
                      </div>
                    ) : null}
                    {car.chauffeurPackage !== undefined ? (
                      <div className="row" style={{ justifyContent: "space-between" }}>
                        <span className="eyebrow">{MODE_LABEL.CHAUFFEUR}</span>
                        <span>
                          <span className="price">{formatIDR(car.chauffeurPackage)}</span>{" "}
                          <span className="price-unit">/ 12 jam</span>
                        </span>
                      </div>
                    ) : null}
                  </div>

                  <ButtonLink href={`/mobil/${car.id}`} variant="primary">
                    Lihat detail <Icon name="arrow" size={16} />
                  </ButtonLink>
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </Container>
    </>
  );
}

function FilterChip({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <a href={href} className={active ? "badge badge-accent" : "badge"}>
      {label}
    </a>
  );
}

// Halaman Detail Mobil — Editorial Noir. Server Component (async).
// Data via getCarModel (DB); foto nyata (Unsplash interim) via CardMedia.

import { notFound } from "next/navigation";

import { getCarModel, CATEGORY_LABEL } from "@/lib/catalog";
import { formatIDR, MODE_LABEL } from "@/ui/format";
import { Container, Card, CardMedia, Badge, ButtonLink } from "@/ui/primitives";
import { Icon } from "@/ui/icons";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const car = await getCarModel(id);
  if (!car) notFound();

  const specs: { label: string; value: string }[] = [
    { label: "Transmission", value: car.transmission },
    { label: "Capacity", value: `${car.seats} seats` },
    { label: "Year", value: String(car.year) },
    {
      label: "Availability",
      value: car.stock > 0 ? `${car.stock} unit${car.stock === 1 ? "" : "s"}` : "Out of stock",
    },
  ];

  return (
    <Container style={{ padding: "2.5rem 0 1rem" }}>
      <ButtonLink href="/" variant="ghost">
        <Icon name="chevron" size={15} style={{ transform: "rotate(180deg)" }} /> Collection
      </ButtonLink>

      <div
        className="detail-grid rise"
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.25fr) minmax(0, 1fr)",
          gap: "2.5rem",
          alignItems: "start",
          marginTop: "1.5rem",
        }}
      >
        {/* Media */}
        <Card>
          <div style={{ aspectRatio: "4 / 3", position: "relative" }}>
            <CardMedia label={`${car.brand} ${car.name}`} src={car.photos[0]} priority sizes="(max-width: 800px) 100vw, 55vw" />
          </div>
        </Card>

        {/* Informasi */}
        <div className="stack" style={{ gap: "1.75rem" }}>
          <div>
            <span className="kicker">{CATEGORY_LABEL[car.category]}</span>
            <h1 style={{ margin: "0.6rem 0 0.3rem" }}>{car.name}</h1>
            <p className="muted" style={{ margin: 0 }}>
              {car.brand} · {car.year}
            </p>
          </div>

          <div>
            <span className="eyebrow">Specifications</span>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.9rem 1.5rem", marginTop: "0.9rem" }}>
              {specs.map((s) => (
                <div key={s.label} style={{ borderTop: "1px solid var(--border)", paddingTop: "0.6rem" }}>
                  <div className="muted" style={{ fontSize: "0.75rem" }}>{s.label}</div>
                  <div style={{ marginTop: "0.15rem" }}>{s.value}</div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <span className="eyebrow">Rates</span>
            <div className="stack" style={{ gap: "0.65rem", marginTop: "0.9rem" }}>
              {car.dailyRate != null ? (
                <div className="row" style={{ justifyContent: "space-between", borderTop: "1px solid var(--border)", paddingTop: "0.65rem" }}>
                  <span className="row" style={{ gap: "0.55rem" }}>
                    <Icon name="key" size={17} style={{ color: "var(--accent)" }} />
                    {MODE_LABEL.SELF_DRIVE}
                  </span>
                  <span>
                    <span className="price">{formatIDR(car.dailyRate)}</span>{" "}
                    <span className="price-unit">/ day</span>
                  </span>
                </div>
              ) : null}
              {car.chauffeurPackage != null ? (
                <div className="row" style={{ justifyContent: "space-between", borderTop: "1px solid var(--border)", paddingTop: "0.65rem" }}>
                  <span className="row" style={{ gap: "0.55rem" }}>
                    <Icon name="steering" size={17} style={{ color: "var(--accent)" }} />
                    {MODE_LABEL.CHAUFFEUR}
                  </span>
                  <span>
                    <span className="price">{formatIDR(car.chauffeurPackage)}</span>{" "}
                    <span className="price-unit">/ 12h</span>
                  </span>
                </div>
              ) : null}
              {car.dailyRate == null && car.chauffeurPackage == null ? (
                <span className="muted">Contact us for pricing.</span>
              ) : null}
            </div>
          </div>

          <div className="row">
            <ButtonLink href={`/booking/${car.id}`} variant="primary">
              Book now <Icon name="arrow" size={16} />
            </ButtonLink>
          </div>

          <p className="muted" style={{ margin: 0, fontSize: "0.82rem", display: "flex", gap: "0.5rem", alignItems: "flex-start" }}>
            <Icon name="shield" size={16} style={{ marginTop: "2px", flexShrink: 0 }} />
            The specific colour and unit are assigned by our team; customers don&apos;t choose the colour.
          </p>
        </div>
      </div>
    </Container>
  );
}

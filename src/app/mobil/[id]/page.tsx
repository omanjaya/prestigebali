// Halaman Detail Mobil — Server Component (async). Bahasa Indonesia, tema luxury.
// Data mock via getCarModel; foto belum ada → placeholder CardMedia.

import { notFound } from "next/navigation";

import { getCarModel, CATEGORY_LABEL } from "@/lib/catalog";
import { formatIDR, MODE_LABEL } from "@/ui/format";
import {
  Container,
  Card,
  CardBody,
  CardMedia,
  Badge,
  ButtonLink,
} from "@/ui/primitives";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const car = getCarModel(id);
  if (!car) notFound();

  const specs: string[] = [
    car.transmission,
    `${car.seats} kursi`,
    car.stock > 0 ? `${car.stock} unit tersedia` : "Stok habis",
  ];

  return (
    <Container style={{ padding: "2rem 0" }}>
      <div
        className="grid"
        style={{ gridTemplateColumns: "minmax(0, 1.2fr) minmax(0, 1fr)", alignItems: "start" }}
      >
        {/* Kolom kiri — media */}
        <Card>
          <CardMedia label={`${car.brand} ${car.name}`} />
        </Card>

        {/* Kolom kanan — informasi */}
        <div className="stack">
          <div>
            <h1 style={{ margin: 0 }}>{car.name}</h1>
            <p className="muted" style={{ margin: "0.25rem 0 0" }}>
              {car.brand} · {car.year}
            </p>
          </div>

          <div className="row">
            <Badge variant="accent">{CATEGORY_LABEL[car.category]}</Badge>
          </div>

          <Card>
            <CardBody>
              <h3 style={{ marginTop: 0 }}>Spesifikasi</h3>
              <ul className="stack" style={{ margin: 0, paddingLeft: "1.1rem", gap: "0.35rem" }}>
                {specs.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <h3 style={{ marginTop: 0 }}>Tarif</h3>
              <div className="stack" style={{ gap: "0.5rem" }}>
                {car.dailyRate != null ? (
                  <div className="row" style={{ justifyContent: "space-between" }}>
                    <span className="muted">{MODE_LABEL.SELF_DRIVE}</span>
                    <strong>{formatIDR(car.dailyRate)} / hari</strong>
                  </div>
                ) : null}
                {car.chauffeurPackage != null ? (
                  <div className="row" style={{ justifyContent: "space-between" }}>
                    <span className="muted">{MODE_LABEL.CHAUFFEUR}</span>
                    <strong>{formatIDR(car.chauffeurPackage)} / 12 jam</strong>
                  </div>
                ) : null}
                {car.dailyRate == null && car.chauffeurPackage == null ? (
                  <span className="muted">Hubungi admin untuk informasi tarif.</span>
                ) : null}
              </div>
            </CardBody>
          </Card>

          <div className="row">
            <ButtonLink href={`/booking/${car.id}`} variant="primary">
              Booking Sekarang
            </ButtonLink>
            <ButtonLink href="/">Kembali ke Etalase</ButtonLink>
          </div>

          <p className="muted" style={{ margin: 0, fontSize: "0.85rem" }}>
            Warna dan unit spesifik dialokasikan oleh admin; pelanggan tidak memilih warna.
          </p>
        </div>
      </div>
    </Container>
  );
}

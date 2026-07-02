// Halaman Form Booking — Server Component.
// Menampilkan ringkasan Mobil + tarif lalu merender form (Client Component).

import { notFound } from "next/navigation";

import { getCarModel } from "@/lib/catalog";
import { CATEGORY_LABEL } from "@/lib/catalog";
import { formatIDR, MODE_LABEL } from "@/ui/format";
import { Card, CardBody, Container, PageHeader } from "@/ui/primitives";

import { BookingForm } from "./booking-form";

export default async function BookingPage({
  params,
}: {
  params: Promise<{ carModelId: string }>;
}) {
  const { carModelId } = await params;
  const car = await getCarModel(carModelId);
  if (!car) notFound();

  return (
    <Container>
      <PageHeader
        title="Buat Booking"
        subtitle="Lengkapi detail sewa Anda. Tim Prestige akan menindaklanjuti setelah DP diterima."
      />

      <div className="grid" style={{ gridTemplateColumns: "minmax(280px, 360px) 1fr", alignItems: "start" }}>
        <Card>
          <CardBody>
            <div className="stack" style={{ gap: "0.5rem" }}>
              <div>
                <div className="muted" style={{ fontSize: "0.8rem" }}>
                  {car.brand} · {car.year} · {CATEGORY_LABEL[car.category]}
                </div>
                <h2 style={{ margin: "0.15rem 0 0" }}>{car.name}</h2>
              </div>

              <div className="muted" style={{ fontSize: "0.9rem" }}>
                {car.transmission} · {car.seats} kursi · Stok {car.stock}
              </div>

              <div className="stack" style={{ gap: "0.35rem", marginTop: "0.5rem" }}>
                <div className="row" style={{ justifyContent: "space-between" }}>
                  <span className="muted">{MODE_LABEL.SELF_DRIVE} (Tarif Harian)</span>
                  <strong>{car.dailyRate != null ? formatIDR(car.dailyRate) : "—"}</strong>
                </div>
                <div className="row" style={{ justifyContent: "space-between" }}>
                  <span className="muted">{MODE_LABEL.CHAUFFEUR} (Paket 12 Jam)</span>
                  <strong>
                    {car.chauffeurPackage != null ? formatIDR(car.chauffeurPackage) : "—"}
                  </strong>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <BookingForm carModelId={car.id} />
          </CardBody>
        </Card>
      </div>
    </Container>
  );
}

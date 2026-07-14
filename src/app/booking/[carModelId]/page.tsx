// Booking Form page — Server Component.
// Shows the car summary + rates, then renders the form (Client Component).

import Image from "next/image";
import { notFound } from "next/navigation";

import { getCarModel } from "@/lib/catalog";
import { CATEGORY_LABEL } from "@/lib/catalog";
import { waLink } from "@/lib/site-config";
import { formatIDR, MODE_LABEL } from "@/ui/format";
import { Icon } from "@/ui/icons";
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

  const photo = car.photos[0];

  return (
    <Container>
      <style>{bookingCss}</style>

      <div className="reveal">
        <PageHeader
          kicker="Reservation"
          title="Create Booking"
          subtitle="Complete your rental details below. The Prestige team will follow up personally once your deposit is received."
        />
      </div>

      <div className="bk-layout reveal">
        {/* ---- Car summary / rates ---- */}
        <aside className="bk-summary">
          <Card>
            {photo ? (
              <div className="card-media">
                <Image
                  src={photo}
                  alt={`${car.brand} ${car.name}`}
                  fill
                  sizes="(max-width: 860px) 100vw, 380px"
                  priority
                />
              </div>
            ) : null}

            <CardBody>
              <div className="stack" style={{ gap: "1.35rem" }}>
                <div>
                  <span className="kicker">{CATEGORY_LABEL[car.category]}</span>
                  <h2 style={{ margin: "0.55rem 0 0.4rem" }}>{car.name}</h2>
                  <p className="muted" style={{ margin: 0, fontSize: "0.85rem" }}>
                    {car.brand} · {car.year} · {car.transmission} · {car.seats} seats
                  </p>
                </div>

                <hr className="divider" style={{ margin: 0 }} />

                <div className="stack" style={{ gap: "1rem" }}>
                  <div className="bk-rate">
                    <div className="stack" style={{ gap: "0.15rem" }}>
                      <span className="eyebrow">{MODE_LABEL.SELF_DRIVE}</span>
                      <span className="muted" style={{ fontSize: "0.75rem" }}>
                        Daily rate
                      </span>
                    </div>
                    <span className="price">
                      {car.dailyRate != null ? formatIDR(car.dailyRate) : "—"}
                    </span>
                  </div>

                  <div className="bk-rate">
                    <div className="stack" style={{ gap: "0.15rem" }}>
                      <span className="eyebrow">{MODE_LABEL.CHAUFFEUR}</span>
                      <span className="muted" style={{ fontSize: "0.75rem" }}>
                        12-hour package
                      </span>
                    </div>
                    <span className="price">
                      {car.chauffeurPackage != null ? formatIDR(car.chauffeurPackage) : "—"}
                    </span>
                  </div>
                </div>

                <hr className="divider" style={{ margin: 0 }} />

                <div className="stack" style={{ gap: "0.55rem" }}>
                  <span className="eyebrow">Concierge</span>
                  <a
                    href={waLink(`Hi Prestige, I'd like to book the ${car.brand} ${car.name}.`)}
                    target="_blank"
                    rel="noreferrer"
                    className="bk-wa"
                  >
                    Questions? Chat with us
                    <Icon name="arrow" size={15} />
                  </a>
                </div>
              </div>
            </CardBody>
          </Card>
        </aside>

        {/* ---- Booking form ---- */}
        <div className="bk-form-col">
          <Card>
            <CardBody>
              <BookingForm carModelId={car.id} />
            </CardBody>
          </Card>
        </div>
      </div>
    </Container>
  );
}

/* Booking-specific layout & accents (Warm Noir). Scoped by bk- prefixes so no
   other page is affected. Responsive: two columns on desktop → one on mobile. */
const bookingCss = `
  .bk-layout {
    display: grid;
    grid-template-columns: minmax(300px, 380px) 1fr;
    gap: clamp(1.5rem, 4vw, 3rem);
    align-items: start;
    margin: 0.5rem 0 clamp(3rem, 8vw, 5rem);
  }
  .bk-summary {
    position: sticky;
    top: 96px;
  }
  .bk-rate {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 1rem;
  }
  .bk-wa {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    color: var(--accent);
    font-size: 0.85rem;
    transition: gap 0.25s ease, color 0.25s ease;
  }
  .bk-wa:hover {
    gap: 0.8rem;
    color: var(--accent-hi);
  }
  @media (max-width: 860px) {
    .bk-layout {
      grid-template-columns: 1fr;
    }
    .bk-summary {
      position: static;
    }
  }
`;

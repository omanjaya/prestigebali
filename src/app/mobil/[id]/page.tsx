// Halaman Detail Mobil — Ivory & Gold, i18n. Server Component (async).
// Data via getCarModel (DB); galeri foto (1..n) dirender oleh <Gallery> (client).

import { notFound } from "next/navigation";

import { getCarModel, CATEGORY_LABEL } from "@/lib/catalog";
import { getT } from "@/i18n/server";
import { siteMessages } from "@/i18n/messages/site";
import { Money } from "@/i18n/client";
import { Container, Card, ButtonLink } from "@/ui/primitives";
import { Icon } from "@/ui/icons";

import { Gallery } from "./gallery";

type SpecIcon = "steering" | "user" | "calendar" | "check";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [car, { t }] = await Promise.all([getCarModel(id), getT(siteMessages)]);
  if (!car) notFound();

  const unitLabel = car.stock === 1 ? t("site.detail.unit") : t("site.detail.units");
  const specs: { label: string; value: string; icon: SpecIcon }[] = [
    { label: t("common.transmission"), value: car.transmission, icon: "steering" },
    { label: t("common.capacity"), value: `${car.seats} ${t("common.seats")}`, icon: "user" },
    { label: t("common.year"), value: String(car.year), icon: "calendar" },
    {
      label: t("common.availability"),
      value: car.stock > 0 ? `${car.stock} ${unitLabel}` : t("site.detail.outOfStock"),
      icon: "check",
    },
  ];

  return (
    <Container style={{ padding: "2.5rem 0 4rem" }}>
      <ButtonLink href="/" variant="ghost">
        <Icon name="chevron" size={15} style={{ transform: "rotate(180deg)" }} /> {t("site.detail.back")}
      </ButtonLink>

      <div
        className="detail-grid rise"
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.4fr) minmax(0, 1fr)",
          gap: "clamp(2rem, 4vw, 3.5rem)",
          alignItems: "start",
          marginTop: "1.75rem",
        }}
      >
        {/* Media — editorial hero frame */}
        <Card style={{ position: "sticky", top: "96px" }}>
          <Gallery
            photos={car.photos}
            alt={`${car.brand} ${car.name}`}
            categoryLabel={CATEGORY_LABEL[car.category]}
          />
        </Card>

        {/* Informasi */}
        <div className="stack" style={{ gap: "2rem" }}>
          <div className="reveal">
            <span className="kicker">{CATEGORY_LABEL[car.category]}</span>
            <h1 style={{ margin: "0.7rem 0 0.35rem" }}>{car.name}</h1>
            <p className="muted" style={{ margin: 0 }}>
              {car.brand} · {car.year}
            </p>
          </div>

          <hr className="divider" style={{ margin: 0 }} />

          <div className="reveal">
            <span className="eyebrow">{t("site.detail.specifications")}</span>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "1rem 1.5rem",
                marginTop: "1.1rem",
              }}
            >
              {specs.map((s) => (
                <div
                  key={s.label}
                  className="row"
                  style={{
                    gap: "0.7rem",
                    alignItems: "flex-start",
                    flexWrap: "nowrap",
                    borderTop: "1px solid var(--border)",
                    paddingTop: "0.8rem",
                  }}
                >
                  <Icon
                    name={s.icon}
                    size={18}
                    style={{ color: "var(--accent)", marginTop: "3px", flexShrink: 0 }}
                  />
                  <div>
                    <div className="eyebrow" style={{ fontSize: "0.62rem" }}>
                      {s.label}
                    </div>
                    <div style={{ marginTop: "0.2rem" }}>{s.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="reveal">
            <span className="eyebrow">{t("site.detail.rates")}</span>
            <div className="stack" style={{ gap: "0.75rem", marginTop: "1.1rem" }}>
              {car.dailyRate != null ? (
                <div
                  className="row"
                  style={{
                    justifyContent: "space-between",
                    borderTop: "1px solid var(--border)",
                    paddingTop: "0.75rem",
                  }}
                >
                  <span className="row" style={{ gap: "0.6rem" }}>
                    <Icon name="key" size={18} style={{ color: "var(--accent)" }} />
                    {t("common.mode.selfDrive")}
                  </span>
                  <span>
                    <span className="price">
                      <Money idr={car.dailyRate} />
                    </span>{" "}
                    <span className="price-unit">{t("common.perDay")}</span>
                  </span>
                </div>
              ) : null}
              {car.chauffeurPackage != null ? (
                <div
                  className="row"
                  style={{
                    justifyContent: "space-between",
                    borderTop: "1px solid var(--border)",
                    paddingTop: "0.75rem",
                  }}
                >
                  <span className="row" style={{ gap: "0.6rem" }}>
                    <Icon name="steering" size={18} style={{ color: "var(--accent)" }} />
                    {t("common.mode.chauffeur")}
                  </span>
                  <span>
                    <span className="price">
                      <Money idr={car.chauffeurPackage} />
                    </span>{" "}
                    <span className="price-unit">{t("common.per12h")}</span>
                  </span>
                </div>
              ) : null}
              {car.dailyRate == null && car.chauffeurPackage == null ? (
                <span className="muted">{t("site.detail.contactPricing")}</span>
              ) : null}
            </div>
          </div>

          <div className="reveal row" style={{ marginTop: "0.25rem" }}>
            <ButtonLink href={`/booking/${car.id}`} variant="primary">
              {t("common.nav.bookNow")} <Icon name="arrow" size={16} />
            </ButtonLink>
          </div>

          <p
            className="muted"
            style={{
              margin: 0,
              fontSize: "0.82rem",
              display: "flex",
              gap: "0.5rem",
              alignItems: "flex-start",
            }}
          >
            <Icon name="shield" size={16} style={{ marginTop: "2px", flexShrink: 0 }} />
            {t("site.detail.disclaimer")}
          </p>
        </div>
      </div>
    </Container>
  );
}

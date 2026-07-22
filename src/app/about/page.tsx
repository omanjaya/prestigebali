// About Us — Ivory & Gold brand story. Server Component (async), i18n via getT.
// Reuses global presentational classes (.section/.stats-band/.feature-grid/.cta-band)
// so no new stylesheet is needed — consistent with the rest of the light theme.

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { getT } from "@/i18n/server";
import { siteMessages } from "@/i18n/messages/site";
import { waLink } from "@/lib/site-config";
import { Container, Card, CardMedia } from "@/ui/primitives";
import { Icon } from "@/ui/icons";

export const metadata: Metadata = {
  title: "About Us — Prestige Bali",
  description: "A curated fleet, professional chauffeurs and 24/7 concierge care across Bali.",
};

const BANNER_IMG =
  "https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?auto=format&fit=crop&w=2000&q=80";
const COLLAGE_1 =
  "https://images.unsplash.com/photo-1494905998402-395d579af36f?auto=format&fit=crop&w=900&q=80";
const COLLAGE_2 =
  "https://images.unsplash.com/photo-1570733577524-3a047079e80d?auto=format&fit=crop&w=900&q=80";

export default async function AboutPage() {
  const { t } = await getT(siteMessages);

  const stats = [
    { value: t("site.about.stat1Value"), label: t("site.about.stat1Label") },
    { value: t("site.about.stat2Value"), label: t("site.about.stat2Label") },
    { value: t("site.about.stat3Value"), label: t("site.about.stat3Label") },
  ];

  return (
    <>
      <Container style={{ padding: "4.5rem 0 1rem", textAlign: "center" }}>
        <div className="kicker">{t("site.about.kicker")}</div>
        <h1 style={{ margin: "0.7rem auto 0", maxWidth: "20ch" }}>{t("site.about.title")}</h1>
        <p className="muted" style={{ maxWidth: 620, margin: "1.1rem auto 0" }}>
          {t("site.about.lede")}
        </p>
      </Container>

      <Container style={{ padding: "2.5rem 0" }}>
        <Card>
          <div style={{ aspectRatio: "21 / 9", position: "relative" }}>
            <CardMedia label="Prestige Bali" src={BANNER_IMG} priority sizes="100vw" />
          </div>
        </Card>
      </Container>

      <Container style={{ padding: "1rem 0 3rem" }}>
        <div className="stack" style={{ maxWidth: 720, margin: "0 auto", gap: "1.1rem" }}>
          <p>{t("site.about.body1")}</p>
          <p>{t("site.about.body2")}</p>
          <p>{t("site.about.body3")}</p>
        </div>
      </Container>

      <Container style={{ padding: "0 0 3rem" }}>
        <div className="grid" style={{ gridTemplateColumns: "repeat(2, 1fr)" }}>
          <Card>
            <div style={{ aspectRatio: "4 / 3", position: "relative" }}>
              <CardMedia label="Prestige Bali" src={COLLAGE_1} sizes="(max-width: 700px) 100vw, 50vw" />
            </div>
          </Card>
          <Card>
            <div style={{ aspectRatio: "4 / 3", position: "relative" }}>
              <CardMedia label="Prestige Bali" src={COLLAGE_2} sizes="(max-width: 700px) 100vw, 50vw" />
            </div>
          </Card>
        </div>
      </Container>

      <section className="stats-band">
        <div className="container stats-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
          {stats.map((s) => (
            <div key={s.label} className="stat-item">
              <div className="stat-num">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="cta-band">
        <div className="container">
          <div className="cta-inner">
            <span className="kicker">{t("site.about.kicker")}</span>
            <h2 className="cta-title">{t("site.about.title")}</h2>
            <div className="row" style={{ justifyContent: "center", marginTop: "0.5rem" }}>
              <a
                href={waLink("Hi Prestige Bali, I'd like to learn more.")}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
              >
                {t("site.about.ctaWhatsApp")} <Icon name="arrow" size={16} />
              </a>
              <Link href="/#collection" className="btn">
                {t("site.about.ctaFleet")}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

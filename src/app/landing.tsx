"use client";

// Landing page — Ivory & Gold (carlux-inspired), i18n, rich motion, fully responsive.
// Data (plain, serializable) datang dari page.tsx (server) agar Prisma tak bocor ke client.

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  AnimatePresence,
  animate,
  motion,
  useInView,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { useI18n, Money } from "@/i18n/client";
import { waLink } from "@/lib/site-config";
import { Icon } from "@/ui/icons";
import { Reveal, StaggerGroup, StaggerItem } from "@/ui/motion";
import { BaliStory } from "@/ui/bali-story";
import { HowItWorks, Testimonials, Faq } from "@/ui/landing-trust";

export type CarCard = {
  id: string;
  name: string;
  brand: string;
  year: number;
  transmission: string;
  seats: number;
  category: string;
  categoryLabel: string;
  photo?: string;
  dailyRate?: number;
  chauffeurPackage?: number;
};

const EASE = [0.2, 0.7, 0.2, 1] as const;
const HERO_IMG =
  "https://images.unsplash.com/photo-1577473403731-a36ec9087f44?auto=format&fit=crop&w=2200&q=80";

export function Landing({
  cars,
  categories,
  brands,
}: {
  cars: CarCard[];
  categories: { value: string; label: string }[];
  brands: string[];
}) {
  return (
    <>
      <Hero />
      <UspStrip />
      <BrandMarquee brands={brands} />
      <Collection cars={cars} categories={categories} brands={brands} />
      <OffersBand />
      <Experience />
      <BaliStory />
      <HowItWorks />
      <Modes />
      <Testimonials />
      <Stats carCount={cars.length} brandCount={brands.length} />
      <Faq />
      <FinalCTA />
    </>
  );
}

/* ----------------------------- Hero -----------------------------
   Konten (teks) selalu terlihat; entrance via CSS (.hero-anim di landing.css) — tak
   bergantung JS. Parallax gambar (Framer) hanya enhancement; gambar tetap tampil bila
   JS/parallax tak jalan. */
function Hero() {
  const { t } = useI18n();
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const scale = useTransform(scrollYProgress, [0, 1], [1.06, 1.16]);

  return (
    <section className="hero" ref={ref}>
      <motion.div className="hero-media" style={reduce ? undefined : { y, scale }}>
        <Image src={HERO_IMG} alt="Luxury supercar" fill priority sizes="100vw" />
      </motion.div>
      <div className="hero-scrim" />

      <div className="hero-content">
        <div className="container">
          <div className="hero-text">
            <span className="kicker hero-anim">{t("site.hero.kicker")}</span>
            <h1 className="hero-title hero-anim">
              {t("site.hero.title1")}
              <br />
              {t("site.hero.title2")}
            </h1>
            <div className="hero-rule hero-anim" />
            <p className="muted hero-sub hero-anim">{t("site.hero.sub")}</p>
            <div className="row hero-actions hero-anim">
              <Link href="#collection" className="btn btn-primary">
                {t("site.hero.ctaPrimary")} <Icon name="arrow" size={16} />
              </Link>
              <Link href="#modes" className="btn">
                {t("site.hero.ctaSecondary")}
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="hero-scroll">
        <span className="eyebrow">{t("site.hero.scroll")}</span>
        <span className="hero-scroll-line" />
      </div>
    </section>
  );
}

/* ---------------------------- USP strip --------------------------- */
function UspStrip() {
  const { t } = useI18n();
  return (
    <section className="usp-strip">
      <div className="container usp-grid">
        <div className="usp-item">
          <span className="usp-icon">
            <Icon name="coin" size={20} />
          </span>
          <div>
            <p className="usp-title">{t("site.usp.deposit.title")}</p>
            <p className="muted usp-body">{t("site.usp.deposit.body")}</p>
          </div>
        </div>
        <div className="usp-item">
          <span className="usp-icon">
            <Icon name="percent" size={20} />
          </span>
          <div>
            <p className="usp-title">{t("site.usp.offers.title")}</p>
            <p className="muted usp-body">{t("site.usp.offers.body")}</p>
            <a
              className="usp-cta"
              href={waLink(t("site.usp.offers.cta"))}
              target="_blank"
              rel="noopener noreferrer"
            >
              {t("site.usp.offers.cta")} <Icon name="arrow" size={13} />
            </a>
          </div>
        </div>
        <div className="usp-item">
          <span className="usp-icon">
            <Icon name="mapPin" size={20} />
          </span>
          <div>
            <p className="usp-title">{t("site.usp.delivery.title")}</p>
            <p className="muted usp-body">{t("site.usp.delivery.body")}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* -------------------------- Offers band ---------------------------- */
const OFFER_CARDS = [
  { icon: "percent" as const, title: "site.offers.card1.title", body: "site.offers.card1.body" },
  { icon: "calendar" as const, title: "site.offers.card2.title", body: "site.offers.card2.body" },
  { icon: "steering" as const, title: "site.offers.card3.title", body: "site.offers.card3.body" },
];

function OffersBand() {
  const { t } = useI18n();
  return (
    <section className="offers-band">
      <div className="offers-inner">
        <div className="offers-copy">
          <span className="kicker">{t("site.offers.kicker")}</span>
          <h2 className="offers-title">{t("site.offers.title")}</h2>
          <p className="muted">{t("site.offers.body")}</p>
        </div>
        <a
          href={waLink(t("site.offers.cta"))}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-primary"
        >
          {t("site.offers.cta")} <Icon name="arrow" size={16} />
        </a>
      </div>

      <div className="offers-cards">
        {OFFER_CARDS.map((c) => (
          <div key={c.title} className="offers-card">
            <span className="offers-card-icon">
              <Icon name={c.icon} size={18} />
            </span>
            <h3 className="offers-card-title">{t(c.title)}</h3>
            <p className="muted offers-card-body">{t(c.body)}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ------------------------- Brand marquee ------------------------- */
function BrandMarquee({ brands }: { brands: string[] }) {
  const items = brands.length ? brands : ["Ferrari", "Lamborghini", "Mercedes-Benz", "BMW"];
  const loop = [...items, ...items, ...items, ...items];
  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee-track">
        {loop.map((b, i) => (
          <span key={`${b}-${i}`} className="marquee-item">
            {b}
            <span className="marquee-dot" />
          </span>
        ))}
      </div>
    </div>
  );
}

/* -------------------------- Experience -------------------------- */
const FEATURE_ICONS: Parameters<typeof Icon>[0]["name"][] = ["shield", "calendar", "steering", "clock"];
const FEATURE_KEYS = [
  { title: "site.experience.feature1.title", body: "site.experience.feature1.body" },
  { title: "site.experience.feature2.title", body: "site.experience.feature2.body" },
  { title: "site.experience.feature3.title", body: "site.experience.feature3.body" },
  { title: "site.experience.feature4.title", body: "site.experience.feature4.body" },
] as const;

function Experience() {
  const { t } = useI18n();
  return (
    <section id="experience" className="section container">
      <Reveal>
        <span className="eyebrow">{t("site.experience.kicker")}</span>
        <h2 className="section-title">{t("site.experience.title")}</h2>
      </Reveal>
      <StaggerGroup className="feature-grid">
        {FEATURE_KEYS.map((f, i) => (
          <StaggerItem key={f.title} className="feature">
            <span className="feature-icon">
              <Icon name={FEATURE_ICONS[i]!} size={22} />
            </span>
            <h3 className="feature-title">{t(f.title)}</h3>
            <p className="muted">{t(f.body)}</p>
          </StaggerItem>
        ))}
      </StaggerGroup>
    </section>
  );
}

/* -------------------------- Collection -------------------------- */
function Collection({
  cars,
  categories,
  brands,
}: {
  cars: CarCard[];
  categories: { value: string; label: string }[];
  brands: string[];
}) {
  const { t } = useI18n();
  const [cat, setCat] = useState<string | null>(null);
  const [brand, setBrand] = useState<string | null>(null);
  const filtered = cars.filter((c) => (!cat || c.category === cat) && (!brand || c.brand === brand));

  return (
    <section id="collection" className="section container">
      <Reveal>
        <div className="section-head">
          <div>
            <span className="eyebrow">{t("site.collection.kicker")}</span>
            <h2 className="section-title" style={{ margin: "0.4rem 0 0" }}>
              {t("site.collection.title")}
            </h2>
          </div>
          <span className="muted" style={{ fontSize: "0.85rem" }}>
            {filtered.length} {t("site.collection.available")}
          </span>
        </div>
      </Reveal>

      <FleetShowcase cars={cars} />

      <Reveal delay={0.05}>
        <div className="filters">
          <div className="filter-row">
            <span className="eyebrow">{t("site.collection.categoryLabel")}</span>
            <div className="chips">
              <Chip active={!cat} onClick={() => setCat(null)}>{t("site.collection.all")}</Chip>
              {categories.map((c) => (
                <Chip key={c.value} active={cat === c.value} onClick={() => setCat(c.value)}>
                  {c.label}
                </Chip>
              ))}
            </div>
          </div>
          <div className="filter-row">
            <span className="eyebrow">{t("site.collection.marqueLabel")}</span>
            <div className="chips">
              <Chip active={!brand} onClick={() => setBrand(null)}>{t("site.collection.all")}</Chip>
              {brands.map((b) => (
                <Chip key={b} active={brand === b} onClick={() => setBrand(b)}>
                  {b}
                </Chip>
              ))}
            </div>
          </div>
        </div>
      </Reveal>

      {/* Tiap kartu reveal saat masuk layar (CSS scroll-driven, robust). */}
      <div className="grid car-grid">
        {filtered.map((car) => (
          <div key={car.id} className="reveal">
            <CarTile car={car} />
          </div>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="muted" style={{ textAlign: "center", padding: "3rem 0" }}>
          {t("site.collection.noMatch")}
        </p>
      ) : null}
    </section>
  );
}

/* Showcase sinematik: slideshow 1 mobil/slide, auto-advance + crossfade + ken-burns,
   kontrol (panah/dot), pause saat hover, reveal saat masuk layar. */
function FleetShowcase({ cars }: { cars: CarCard[] }) {
  const { t } = useI18n();
  const slides = cars.filter((c) => c.photo);
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (paused || reduce || slides.length < 2) return;
    const timer = setInterval(() => setI((v) => (v + 1) % slides.length), 5200);
    return () => clearInterval(timer);
  }, [paused, reduce, slides.length]);

  if (slides.length === 0) return null;
  const active = slides[i] ?? slides[0]!;
  const go = (n: number) => setI((v) => (v + n + slides.length) % slides.length);

  return (
    <div
      className="showcase reveal"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="showcase-stage">
        <AnimatePresence>
          <motion.div
            key={active.id}
            className="showcase-slide"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9, ease: EASE }}
          >
            <motion.div
              className="showcase-img"
              initial={reduce ? false : { scale: 1.14 }}
              animate={{ scale: 1 }}
              transition={{ duration: 6.5, ease: "linear" }}
            >
              <Image src={active.photo!} alt={`${active.brand} ${active.name}`} fill priority sizes="100vw" />
            </motion.div>
          </motion.div>
        </AnimatePresence>
        <div className="showcase-scrim" />

        <div className="showcase-overlay">
          <motion.div
            key={`${active.id}-text`}
            initial={reduce ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.12 }}
          >
            <span className="kicker">{active.categoryLabel}</span>
            <h3 className="showcase-title">
              {active.brand} {active.name}
            </h3>
            <div className="showcase-rate">
              {active.dailyRate != null ? (
                <>
                  <span className="price">
                    <Money idr={active.dailyRate} />
                  </span>{" "}
                  <span className="price-unit">
                    {t("common.perDay")} · {t("common.mode.selfDrive")}
                  </span>
                </>
              ) : active.chauffeurPackage != null ? (
                <>
                  <span className="price">
                    <Money idr={active.chauffeurPackage} />
                  </span>{" "}
                  <span className="price-unit">
                    {t("common.per12h")} · {t("common.mode.chauffeur")}
                  </span>
                </>
              ) : null}
            </div>
            <Link href={`/mobil/${active.id}`} className="btn btn-primary">
              {t("common.cta.viewDetails")} <Icon name="arrow" size={16} />
            </Link>
          </motion.div>
        </div>

        <button className="showcase-nav prev" onClick={() => go(-1)} aria-label="Previous car">
          <Icon name="chevron" size={20} style={{ transform: "rotate(180deg)" }} />
        </button>
        <button className="showcase-nav next" onClick={() => go(1)} aria-label="Next car">
          <Icon name="chevron" size={20} />
        </button>
      </div>

      <div className="showcase-dots">
        {slides.map((s, idx) => (
          <button
            key={s.id}
            className={idx === i ? "s-dot is-active" : "s-dot"}
            onClick={() => setI(idx)}
            aria-label={`Show ${s.brand} ${s.name}`}
          />
        ))}
      </div>
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button type="button" onClick={onClick} className={active ? "chip is-active" : "chip"}>
      {children}
    </button>
  );
}

function CarTile({ car }: { car: CarCard }) {
  const { t } = useI18n();
  return (
    <Link href={`/mobil/${car.id}`} className="car-tile">
      <div className="car-media">
        {car.photo ? (
          <Image src={car.photo} alt={`${car.brand} ${car.name}`} fill sizes="(max-width: 700px) 100vw, 33vw" />
        ) : (
          <div className="car-media-empty">
            <span>{car.brand}</span>
          </div>
        )}
        <span className="car-cat">{car.categoryLabel}</span>
      </div>
      <div className="car-body">
        <div className="car-head">
          <h3 className="car-name">{car.name}</h3>
          <span className="muted car-brand">
            {car.brand} · {car.year}
          </span>
        </div>
        <p className="muted car-spec">
          {car.transmission} · {car.seats} {t("common.seats")}
        </p>
        <hr className="divider" style={{ margin: "1rem 0" }} />
        <div className="car-rates">
          {car.dailyRate != null ? (
            <div className="rate">
              <span className="eyebrow">{t("common.mode.selfDrive")}</span>
              <span>
                <span className="price">
                  <Money idr={car.dailyRate} />
                </span>{" "}
                <span className="price-unit">{t("common.perDay")}</span>
              </span>
            </div>
          ) : null}
          {car.chauffeurPackage != null ? (
            <div className="rate">
              <span className="eyebrow">{t("common.mode.chauffeur")}</span>
              <span>
                <span className="price">
                  <Money idr={car.chauffeurPackage} />
                </span>{" "}
                <span className="price-unit">{t("common.per12h")}</span>
              </span>
            </div>
          ) : null}
        </div>
        <span className="car-cta">
          {t("common.cta.viewDetails")} <Icon name="arrow" size={15} />
        </span>
      </div>
    </Link>
  );
}

/* ---------------------------- Modes ----------------------------- */
function Modes() {
  const { t } = useI18n();
  const modes = [
    {
      icon: "key" as const,
      tag: t("common.mode.selfDrive"),
      title: t("site.modes.selfDrive.title"),
      body: t("site.modes.selfDrive.body"),
      img: "https://images.unsplash.com/photo-1544218159-ee555140c5b0?auto=format&fit=crop&w=1200&q=75",
    },
    {
      icon: "steering" as const,
      tag: t("common.mode.chauffeur"),
      title: t("site.modes.chauffeur.title"),
      body: t("site.modes.chauffeur.body"),
      img: "https://images.unsplash.com/photo-1603658313849-58e9848fbf29?auto=format&fit=crop&w=1200&q=75",
    },
  ];
  return (
    <section id="modes" className="section container">
      <Reveal>
        <span className="eyebrow">{t("site.modes.kicker")}</span>
        <h2 className="section-title">{t("site.modes.title")}</h2>
      </Reveal>
      <div className="modes-grid">
        {modes.map((m, i) => (
          <Reveal key={m.tag} delay={i * 0.1} className="mode-card">
            <div className="mode-media">
              <Image src={m.img} alt={m.tag} fill sizes="(max-width: 800px) 100vw, 50vw" />
              <span className="mode-icon">
                <Icon name={m.icon} size={20} />
              </span>
            </div>
            <div className="mode-body">
              <span className="kicker">{m.tag}</span>
              <h3 className="mode-title">{m.title}</h3>
              <p className="muted">{m.body}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ---------------------------- Stats ----------------------------- */
function Stats({ carCount, brandCount }: { carCount: number; brandCount: number }) {
  const { t } = useI18n();
  const stats = [
    { value: brandCount, suffix: "", label: t("site.stats.marques") },
    { value: Math.max(carCount, 6), suffix: "+", label: t("site.stats.vehicles") },
    { value: 24, suffix: "/7", label: t("site.stats.concierge") },
    { value: 100, suffix: "%", label: t("site.stats.insured") },
  ];
  return (
    <section className="stats-band">
      <div className="container stats-grid">
        {stats.map((s) => (
          <Counter key={s.label} value={s.value} suffix={s.suffix} label={s.label} />
        ))}
      </div>
    </section>
  );
}

function Counter({ value, suffix, label }: { value: number; suffix: string; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const reduce = useReducedMotion();
  // SSR/fallback menampilkan nilai akhir (robust utk no-JS/crawler); count-up saat di-scroll.
  const [n, setN] = useState(value);

  useEffect(() => {
    if (!inView || reduce) return;
    const controls = animate(0, value, {
      duration: 1.4,
      ease: EASE,
      onUpdate: (v) => setN(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, value, reduce]);

  return (
    <div ref={ref} className="stat-item">
      <div className="stat-num">
        {n}
        <span className="stat-suffix">{suffix}</span>
      </div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

/* --------------------------- Final CTA -------------------------- */
function FinalCTA() {
  const { t } = useI18n();
  return (
    <section className="cta-band">
      <div className="container">
        <Reveal className="cta-inner">
          <span className="kicker">{t("site.finalCta.kicker")}</span>
          <h2 className="cta-title">{t("site.finalCta.title")}</h2>
          <p className="muted cta-sub">{t("site.finalCta.sub")}</p>
          <Link href="#collection" className="btn btn-primary">
            {t("site.finalCta.cta")} <Icon name="arrow" size={16} />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

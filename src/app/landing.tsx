"use client";

// Landing page — Editorial Noir, English, rich motion, fully responsive.
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
import { formatIDR } from "@/ui/format";
import { Icon } from "@/ui/icons";
import { Reveal, StaggerGroup, StaggerItem } from "@/ui/motion";

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
      <BrandMarquee brands={brands} />
      <Experience />
      <Collection cars={cars} categories={categories} brands={brands} />
      <Modes />
      <Stats carCount={cars.length} brandCount={brands.length} />
      <FinalCTA />
    </>
  );
}

/* ----------------------------- Hero -----------------------------
   Konten (teks) selalu terlihat; entrance via CSS (.hero-anim di landing.css) — tak
   bergantung JS. Parallax gambar (Framer) hanya enhancement; gambar tetap tampil bila
   JS/parallax tak jalan. */
function Hero() {
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
            <span className="kicker hero-anim">Luxury Car Rental · Bali</span>
            <h1 className="hero-title hero-anim">
              The art
              <br />
              of arriving.
            </h1>
            <div className="hero-rule hero-anim" />
            <p className="muted hero-sub hero-anim">
              A curated fleet of supercars, sedans, SUVs and premium MPVs. Choose{" "}
              <strong>Self-Drive</strong> for the freedom of the road, or <strong>Chauffeur</strong>{" "}
              for effortless luxury.
            </p>
            <div className="row hero-actions hero-anim">
              <Link href="#collection" className="btn btn-primary">
                Explore the Fleet <Icon name="arrow" size={16} />
              </Link>
              <Link href="#modes" className="btn">
                Ways to Ride
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="hero-scroll">
        <span className="eyebrow">Scroll</span>
        <span className="hero-scroll-line" />
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
const FEATURES: { icon: Parameters<typeof Icon>[0]["name"]; title: string; body: string }[] = [
  { icon: "shield", title: "Impeccable Fleet", body: "Every car detailed, serviced and insured before it reaches you." },
  { icon: "calendar", title: "Seamless Booking", body: "Reserve online in minutes, with instant confirmation and secure payment." },
  { icon: "steering", title: "Discreet Chauffeurs", body: "Professional drivers for weddings, events and executive travel." },
  { icon: "clock", title: "24/7 Concierge", body: "A dedicated team on hand, from first enquiry to safe return." },
];

function Experience() {
  return (
    <section id="experience" className="section container">
      <Reveal>
        <span className="eyebrow">Why Prestige</span>
        <h2 className="section-title">An experience, not a transaction.</h2>
      </Reveal>
      <StaggerGroup className="feature-grid">
        {FEATURES.map((f) => (
          <StaggerItem key={f.title} className="feature">
            <span className="feature-icon">
              <Icon name={f.icon} size={22} />
            </span>
            <h3 className="feature-title">{f.title}</h3>
            <p className="muted">{f.body}</p>
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
  const [cat, setCat] = useState<string | null>(null);
  const [brand, setBrand] = useState<string | null>(null);
  const filtered = cars.filter((c) => (!cat || c.category === cat) && (!brand || c.brand === brand));

  return (
    <section id="collection" className="section container">
      <Reveal>
        <div className="section-head">
          <div>
            <span className="eyebrow">The Collection</span>
            <h2 className="section-title" style={{ margin: "0.4rem 0 0" }}>
              Choose your drive.
            </h2>
          </div>
          <span className="muted" style={{ fontSize: "0.85rem" }}>
            {filtered.length} available
          </span>
        </div>
      </Reveal>

      <Reveal delay={0.05}>
        <div className="filters">
          <div className="filter-row">
            <span className="eyebrow">Category</span>
            <div className="chips">
              <Chip active={!cat} onClick={() => setCat(null)}>All</Chip>
              {categories.map((c) => (
                <Chip key={c.value} active={cat === c.value} onClick={() => setCat(c.value)}>
                  {c.label}
                </Chip>
              ))}
            </div>
          </div>
          <div className="filter-row">
            <span className="eyebrow">Marque</span>
            <div className="chips">
              <Chip active={!brand} onClick={() => setBrand(null)}>All</Chip>
              {brands.map((b) => (
                <Chip key={b} active={brand === b} onClick={() => setBrand(b)}>
                  {b}
                </Chip>
              ))}
            </div>
          </div>
        </div>
      </Reveal>

      <motion.div layout className="grid car-grid">
        {/* initial={false}: kartu langsung tampil saat load; animasi hanya saat filter berubah. */}
        <AnimatePresence mode="popLayout" initial={false}>
          {filtered.map((car) => (
            <motion.div
              key={car.id}
              layout
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.5, ease: EASE }}
            >
              <CarTile car={car} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {filtered.length === 0 ? (
        <p className="muted" style={{ textAlign: "center", padding: "3rem 0" }}>
          No cars match those filters.
        </p>
      ) : null}
    </section>
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
          {car.transmission} · {car.seats} seats
        </p>
        <hr className="divider" style={{ margin: "1rem 0" }} />
        <div className="car-rates">
          {car.dailyRate != null ? (
            <div className="rate">
              <span className="eyebrow">Self-Drive</span>
              <span>
                <span className="price">{formatIDR(car.dailyRate)}</span>{" "}
                <span className="price-unit">/ day</span>
              </span>
            </div>
          ) : null}
          {car.chauffeurPackage != null ? (
            <div className="rate">
              <span className="eyebrow">Chauffeur</span>
              <span>
                <span className="price">{formatIDR(car.chauffeurPackage)}</span>{" "}
                <span className="price-unit">/ 12h</span>
              </span>
            </div>
          ) : null}
        </div>
        <span className="car-cta">
          View details <Icon name="arrow" size={15} />
        </span>
      </div>
    </Link>
  );
}

/* ---------------------------- Modes ----------------------------- */
function Modes() {
  const modes = [
    {
      icon: "key" as const,
      tag: "Self-Drive",
      title: "Take the wheel.",
      body: "Full freedom of the road. Verified licence, refundable deposit, transparent mileage.",
      img: "https://images.unsplash.com/photo-1544218159-ee555140c5b0?auto=format&fit=crop&w=1200&q=75",
    },
    {
      icon: "steering" as const,
      tag: "Chauffeur",
      title: "Be driven.",
      body: "A professional driver for weddings, events and executive travel. Sit back and arrive in style.",
      img: "https://images.unsplash.com/photo-1603658313849-58e9848fbf29?auto=format&fit=crop&w=1200&q=75",
    },
  ];
  return (
    <section id="modes" className="section container">
      <Reveal>
        <span className="eyebrow">Two Ways to Ride</span>
        <h2 className="section-title">However you wish to arrive.</h2>
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
  const stats = [
    { value: brandCount, suffix: "", label: "Marques" },
    { value: Math.max(carCount, 6), suffix: "+", label: "Vehicles" },
    { value: 24, suffix: "/7", label: "Concierge" },
    { value: 100, suffix: "%", label: "Insured" },
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
  return (
    <section className="cta-band">
      <div className="container">
        <Reveal className="cta-inner">
          <span className="kicker">Ready when you are</span>
          <h2 className="cta-title">Reserve your drive.</h2>
          <p className="muted cta-sub">
            Browse the collection and book in minutes — instant confirmation, secure payment.
          </p>
          <Link href="#collection" className="btn btn-primary">
            Explore the Fleet <Icon name="arrow" size={16} />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

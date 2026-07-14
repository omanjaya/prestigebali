"use client";

// Landing — Trust content sections (Warm Noir, English, premium tone).
// Exports: HowItWorks, Testimonials, Faq. Styling in landing-trust.module.css.
// Spacing via global .section/.container; entrance via global .reveal class.
// (File is "use client" because <Faq/> holds accordion state; the other two are
//  purely presentational and render identically on the server.)

import { useId, useState } from "react";
import { Icon } from "@/ui/icons";
import styles from "./landing-trust.module.css";

/* --------------------------- How it works --------------------------- */
const STEPS: { icon: Parameters<typeof Icon>[0]["name"]; title: string; body: string }[] = [
  {
    icon: "check",
    title: "Choose your car",
    body: "Browse the collection and pick the marque, category and dates that suit your journey.",
  },
  {
    icon: "calendar",
    title: "Book & pay the deposit online",
    body: "Reserve in minutes with instant confirmation and a secure, refundable deposit.",
  },
  {
    icon: "steering",
    title: "Self-drive or be chauffeured",
    body: "Take the wheel yourself, or let a discreet professional driver do the honours.",
  },
];

export function HowItWorks() {
  return (
    <section className="section container">
      <div className="reveal">
        <span className="eyebrow">Simple &amp; Seamless</span>
        <h2 className="section-title">How it works</h2>
      </div>
      <ol className={styles.steps}>
        {STEPS.map((s, i) => (
          <li key={s.title} className={`${styles.step} reveal`}>
            <span className={styles.stepNum}>{String(i + 1).padStart(2, "0")}</span>
            <span className={styles.stepConnector}>
              <Icon name={s.icon} size={18} />
            </span>
            <h3 className={styles.stepTitle}>{s.title}</h3>
            <p className="muted">{s.body}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

/* ---------------------------- Testimonials -------------------------- */
const QUOTES: { text: string; name: string; meta: string }[] = [
  {
    text: "Our Bentley was waiting at the villa gate, immaculate and on time. The chauffeur made every evening in Seminyak feel effortless.",
    name: "Amara S.",
    meta: "Singapore",
  },
  {
    text: "Self-drove a Range Rover along the Bukit coast for a week. Faultless car, transparent deposit, and a team that answered at midnight.",
    name: "James W.",
    meta: "Australia",
  },
  {
    text: "They arranged a Mercedes for our wedding in Ubud down to the last detail. Discreet, elegant, and genuinely luxurious.",
    name: "Putri R.",
    meta: "Jakarta",
  },
];

export function Testimonials() {
  return (
    <section className="section container">
      <div className="reveal">
        <span className="eyebrow">Testimonials</span>
        <h2 className="section-title">What guests say</h2>
      </div>
      <div className={styles.quoteGrid}>
        {QUOTES.map((q) => (
          <figure key={q.name} className={`${styles.quoteCard} reveal`}>
            <span className={styles.quoteMark} aria-hidden="true">
              &ldquo;
            </span>
            <blockquote className={styles.quoteText}>{q.text}</blockquote>
            <figcaption className={styles.quoteFoot}>
              <span className={styles.quoteRule} aria-hidden="true" />
              <span className={styles.quoteName}>{q.name}</span>
              <span className={styles.quoteMeta}>{q.meta}</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

/* -------------------------------- FAQ ------------------------------- */
const FAQS: { q: string; a: string }[] = [
  {
    q: "Do you deliver the car to my hotel or villa?",
    a: "Yes. We deliver and collect at any hotel, villa or private residence across Seminyak, Canggu, Ubud, Nusa Dua and the airport, at a time that suits your itinerary.",
  },
  {
    q: "What do I need to drive myself?",
    a: "For self-drive we require a valid passport and either a national driving licence with an International Driving Permit, or an Indonesian licence. A refundable security deposit is held for the rental period.",
  },
  {
    q: "How does the deposit and insurance work?",
    a: "A refundable deposit secures your booking and is returned in full on safe return of the vehicle. Every car is comprehensively insured, with the coverage and excess set out clearly before you confirm.",
  },
  {
    q: "Can I book a chauffeur for a wedding or event?",
    a: "Absolutely. Our discreet, professionally attired chauffeurs are available for weddings, photoshoots and executive travel, with flexible hourly and full-day packages tailored to your schedule.",
  },
  {
    q: "What is your cancellation policy?",
    a: "Plans change. Cancel at least 48 hours before your start time for a full refund of the deposit; inside 48 hours we will always work with you to reschedule wherever possible.",
  },
];

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  const baseId = useId();

  return (
    <section className="section container">
      <div className="reveal">
        <span className="eyebrow">FAQ</span>
        <h2 className="section-title">Frequently asked</h2>
      </div>
      <div className={`${styles.faqList} reveal`}>
        {FAQS.map((item, i) => {
          const isOpen = open === i;
          const btnId = `${baseId}-faq-btn-${i}`;
          const panelId = `${baseId}-faq-panel-${i}`;
          return (
            <div key={item.q} className={styles.faqItem}>
              <h3 style={{ margin: 0 }}>
                <button
                  type="button"
                  id={btnId}
                  className={styles.faqTrigger}
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => setOpen(isOpen ? null : i)}
                >
                  {item.q}
                  <span className={`${styles.faqIcon} ${isOpen ? styles.faqIconOpen : ""}`}>
                    <Icon name="chevron" size={20} />
                  </span>
                </button>
              </h3>
              <div
                id={panelId}
                role="region"
                aria-labelledby={btnId}
                className={`${styles.faqPanel} ${isOpen ? styles.faqPanelOpen : ""}`}
              >
                <div className={styles.faqPanelInner}>
                  <p className={styles.faqAnswer}>{item.a}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

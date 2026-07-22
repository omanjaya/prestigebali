"use client";

// Landing — Trust content sections (Ivory & Gold, i18n, premium tone).
// Exports: HowItWorks, Testimonials, Faq. Styling in landing-trust.module.css.
// Spacing via global .section/.container; entrance via global .reveal class.

import { useId, useState } from "react";
import { useI18n } from "@/i18n/client";
import { Icon } from "@/ui/icons";
import styles from "./landing-trust.module.css";

/* --------------------------- How it works --------------------------- */
const STEPS: { icon: Parameters<typeof Icon>[0]["name"]; title: string; body: string }[] = [
  { icon: "check", title: "site.howItWorks.step1.title", body: "site.howItWorks.step1.body" },
  { icon: "calendar", title: "site.howItWorks.step2.title", body: "site.howItWorks.step2.body" },
  { icon: "steering", title: "site.howItWorks.step3.title", body: "site.howItWorks.step3.body" },
];

export function HowItWorks() {
  const { t } = useI18n();
  return (
    <section className="section container">
      <div className="reveal">
        <span className="eyebrow">{t("site.howItWorks.kicker")}</span>
        <h2 className="section-title">{t("site.howItWorks.title")}</h2>
      </div>
      <ol className={styles.steps}>
        {STEPS.map((s, i) => (
          <li key={s.title} className={`${styles.step} reveal`}>
            <span className={styles.stepNum}>{String(i + 1).padStart(2, "0")}</span>
            <span className={styles.stepConnector}>
              <Icon name={s.icon} size={18} />
            </span>
            <h3 className={styles.stepTitle}>{t(s.title)}</h3>
            <p className="muted">{t(s.body)}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

/* ---------------------------- Testimonials -------------------------- */
const QUOTES: { text: string; name: string; meta: string }[] = [
  { text: "site.testimonials.q1.text", name: "site.testimonials.q1.name", meta: "site.testimonials.q1.meta" },
  { text: "site.testimonials.q2.text", name: "site.testimonials.q2.name", meta: "site.testimonials.q2.meta" },
  { text: "site.testimonials.q3.text", name: "site.testimonials.q3.name", meta: "site.testimonials.q3.meta" },
];

export function Testimonials() {
  const { t } = useI18n();
  return (
    <section className="section container">
      <div className="reveal">
        <span className="eyebrow">{t("site.testimonials.kicker")}</span>
        <h2 className="section-title">{t("site.testimonials.title")}</h2>
      </div>
      <div className={styles.quoteGrid}>
        {QUOTES.map((q) => (
          <figure key={q.name} className={`${styles.quoteCard} reveal`}>
            <span className={styles.quoteMark} aria-hidden="true">
              &ldquo;
            </span>
            <blockquote className={styles.quoteText}>{t(q.text)}</blockquote>
            <figcaption className={styles.quoteFoot}>
              <span className={styles.quoteRule} aria-hidden="true" />
              <span className={styles.quoteName}>{t(q.name)}</span>
              <span className={styles.quoteMeta}>{t(q.meta)}</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

/* -------------------------------- FAQ ------------------------------- */
const FAQS: { q: string; a: string }[] = [
  { q: "site.faq.q1.q", a: "site.faq.q1.a" },
  { q: "site.faq.q2.q", a: "site.faq.q2.a" },
  { q: "site.faq.q3.q", a: "site.faq.q3.a" },
  { q: "site.faq.q4.q", a: "site.faq.q4.a" },
  { q: "site.faq.q5.q", a: "site.faq.q5.a" },
];

export function Faq() {
  const { t } = useI18n();
  const [open, setOpen] = useState<number | null>(0);
  const baseId = useId();

  return (
    <section className="section container">
      <div className="reveal">
        <span className="eyebrow">{t("site.faq.kicker")}</span>
        <h2 className="section-title">{t("site.faq.title")}</h2>
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
                  {t(item.q)}
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
                  <p className={styles.faqAnswer}>{t(item.a)}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

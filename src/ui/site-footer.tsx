// Rich multi-column footer (async server component) — Ivory & Gold, i18n.
// Brand + explore + contact + assurance columns, with a bottom © / Admin bar.

import { getT } from "@/i18n/server";
import { siteMessages } from "@/i18n/messages/site";
import { SITE, waLink } from "@/lib/site-config";
import { Icon } from "@/ui/icons";
import styles from "./site-footer.module.css";

const YEAR = new Date().getFullYear();

export async function SiteFooter() {
  const { t } = await getT(siteMessages);

  const EXPLORE = [
    { label: t("common.nav.fleet"), href: "/#collection" },
    { label: t("site.nav.experience"), href: "/#experience" },
    { label: t("common.nav.about"), href: "/about" },
    { label: t("common.nav.blog"), href: "/blog" },
  ] as const;

  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.inner}>
          {/* Brand */}
          <div className={`${styles.col} ${styles.brandCol}`}>
            <p className={styles.brand}>Prestige Bali</p>
            <p className={styles.blurb}>{t("common.footer.tagline")}</p>
            <div className={styles.social}>
              <a
                className={styles.socialLink}
                href={SITE.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Prestige Bali on Instagram"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <rect x="3" y="3" width="18" height="18" rx="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.3" cy="6.7" r="0.9" fill="currentColor" stroke="none" />
                </svg>
              </a>
              <a
                className={styles.socialLink}
                href={SITE.maps}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Find Prestige Bali on the map"
              >
                <Icon name="mapPin" size={18} />
              </a>
            </div>
          </div>

          {/* Explore */}
          <nav className={styles.col} aria-label="Explore">
            <p className={styles.heading}>{t("common.nav.fleet")}</p>
            <ul className={styles.links}>
              {EXPLORE.map((item) => (
                <li key={item.href}>
                  <a className={styles.link} href={item.href}>
                    <Icon name="chevron" size={14} />
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Contact */}
          <div className={styles.col}>
            <p className={styles.heading}>{t("common.nav.contact")}</p>
            <a
              className={styles.contactRow}
              href={waLink("Hi Prestige Bali, I'd like to enquire about a car.")}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className={styles.contactLabel}>WhatsApp</span>
              <span className={styles.contactValue}>{t("common.cta.chatWhatsApp")}</span>
            </a>
            <a className={styles.contactRow} href={`tel:${SITE.phone.replace(/\s/g, "")}`}>
              <span className={styles.contactLabel}>Phone</span>
              <span className={styles.contactValue}>{SITE.phone}</span>
            </a>
            <a className={styles.contactRow} href={`mailto:${SITE.email}`}>
              <span className={styles.contactLabel}>Email</span>
              <span className={styles.contactValue}>{SITE.email}</span>
            </a>
            <div className={styles.contactRow}>
              <span className={styles.contactLabel}>Address</span>
              <span className={styles.contactValue}>{SITE.address}</span>
            </div>
            <div className={styles.contactRow}>
              <span className={styles.contactLabel}>Hours</span>
              <span className={styles.contactValue}>{SITE.hours}</span>
            </div>
          </div>
        </div>

        <p className={styles.assurance}>
          <Icon name="shield" size={16} />
          Secure payments · Fully insured fleet
        </p>
      </div>

      <div className={styles.bottom}>
        <div className="container">
          <div className={styles.bottomInner}>
            <span className={styles.copy}>
              © {YEAR} Prestige Bali — {t("common.footer.rights")}
            </span>
            <a className={styles.adminLink} href="/admin">
              Admin
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default SiteFooter;

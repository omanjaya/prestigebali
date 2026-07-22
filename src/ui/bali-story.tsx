"use client";

// Bali Story — a "sense of Bali" editorial section for the landing.
// Ties the fleet to exploring the island in style: Seminyak to Ubud, cliffside
// weddings, coastal sunset drives. Ivory & gold, i18n. Robust: content is
// always visible; `.reveal` only adds a scroll entrance.

import Image from "next/image";
import Link from "next/link";
import { useI18n } from "@/i18n/client";
import { Icon } from "@/ui/icons";
import styles from "@/ui/bali-story.module.css";

const HERO_IMG =
  "https://images.unsplash.com/photo-1555400038-63f5ba517a47?auto=format&fit=crop&w=1400&q=80";
const COAST_IMG =
  "https://images.unsplash.com/photo-1502209738978-796c3441d964?auto=format&fit=crop&w=900&q=80";
const ROAD_IMG =
  "https://images.unsplash.com/photo-1510716248200-0d4eea294f00?auto=format&fit=crop&w=900&q=80";

export function BaliStory() {
  const { t } = useI18n();
  return (
    <section id="bali" className={`section ${styles.story}`}>
      <div className="container">
        <div className={styles.grid}>
          <div className={`${styles.hero} reveal`}>
            <Image
              src={HERO_IMG}
              alt="Emerald rice terraces on the road toward Ubud"
              fill
              sizes="(max-width: 860px) 100vw, 50vw"
            />
            <div className={styles.heroScrim} />
            <span className={styles.heroCaption}>
              <Icon name="mapPin" size={15} />
              {t("site.baliStory.caption")}
            </span>
          </div>

          <div className={`${styles.copy} reveal`}>
            <span className="kicker">{t("site.baliStory.kicker")}</span>
            <h2 className={styles.title}>{t("site.baliStory.title")}</h2>
            <div className={styles.rule} />
            <p className={styles.lede}>{t("site.baliStory.lede")}</p>
            <p className={`muted ${styles.body}`}>{t("site.baliStory.body")}</p>

            <div className={styles.collage}>
              <div className={styles.tile}>
                <Image
                  src={COAST_IMG}
                  alt="Cliffside coastline above the Indian Ocean at dusk"
                  fill
                  sizes="(max-width: 860px) 50vw, 25vw"
                />
              </div>
              <div className={styles.tile}>
                <Image
                  src={ROAD_IMG}
                  alt="A lush road winding through tropical Bali"
                  fill
                  sizes="(max-width: 860px) 50vw, 25vw"
                />
              </div>
            </div>

            <Link href="/#collection" className={styles.cta}>
              {t("site.baliStory.cta")} <Icon name="arrow" size={15} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

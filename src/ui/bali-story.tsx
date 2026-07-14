// Bali Story — a "sense of Bali" editorial section for the landing.
// Ties the fleet to exploring the island in style: Seminyak to Ubud, cliffside
// weddings, coastal sunset drives. Warm-noir, gold used sparingly. English copy.
// Robust: content is always visible; `.reveal` only adds a scroll entrance.

import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/ui/icons";
import styles from "@/ui/bali-story.module.css";

const HERO_IMG =
  "https://images.unsplash.com/photo-1555400038-63f5ba517a47?auto=format&fit=crop&w=1400&q=80";
const COAST_IMG =
  "https://images.unsplash.com/photo-1502209738978-796c3441d964?auto=format&fit=crop&w=900&q=80";
const ROAD_IMG =
  "https://images.unsplash.com/photo-1510716248200-0d4eea294f00?auto=format&fit=crop&w=900&q=80";

export function BaliStory() {
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
              Ubud · Central Bali
            </span>
          </div>

          <div className={`${styles.copy} reveal`}>
            <span className="kicker">Explore Bali</span>
            <h2 className={styles.title}>From Seminyak to Ubud, in your own key.</h2>
            <div className={styles.rule} />
            <p className={styles.lede}>
              The island rewards those who take the scenic way. A morning through the rice
              terraces, an afternoon along cliff roads above the Indian Ocean, and a car that
              belongs in the frame.
            </p>
            <p className={`muted ${styles.body}`}>
              Arrive at a Uluwatu clifftop wedding without a crease. Trace the coast as the light
              turns gold over Canggu. Slip up to Ubud for dinner among the terraces. Whichever
              road you choose, the fleet is prepared, insured and waiting.
            </p>

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
              Choose your drive <Icon name="arrow" size={15} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

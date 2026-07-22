// Galeri foto mobil — Client Component.
// Foto utama besar (4:3) + baris thumbnail (bila >1 foto). Ganti foto via klik
// thumbnail atau panah kiri/kanan (keyboard) dengan crossfade halus.
"use client";

import Image from "next/image";
import { useCallback, useState, type KeyboardEvent } from "react";

/** Placeholder blur netral (gradasi hangat) — disalin dari src/ui/primitives.tsx
 *  (MEDIA_BLUR tidak diekspor dari sana). */
const MEDIA_BLUR =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='5'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop offset='0' stop-color='%23e4dccb'/%3E%3Cstop offset='0.5' stop-color='%23cfc4ac'/%3E%3Cstop offset='1' stop-color='%23b3a586'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='8' height='5' fill='url(%23g)'/%3E%3C/svg%3E";

export function Gallery({
  photos,
  alt,
  categoryLabel,
}: {
  photos: string[];
  alt: string;
  categoryLabel: string;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const count = photos.length;

  const go = useCallback(
    (delta: number) => {
      if (count < 2) return;
      setActiveIndex((i) => (i + delta + count) % count);
    },
    [count],
  );

  const onKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        go(-1);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        go(1);
      }
    },
    [go],
  );

  if (count === 0) {
    return (
      <div className="mgal">
        <style>{galleryCss}</style>
        <div className="mgal-main card-media--empty" style={{ aspectRatio: "4 / 3" }}>
          <span>{alt}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="mgal">
      <style>{galleryCss}</style>
      <div
        className="mgal-main"
        style={{ aspectRatio: "4 / 3" }}
        tabIndex={0}
        role="group"
        aria-label={alt}
        aria-roledescription="galeri foto"
        onKeyDown={onKeyDown}
      >
        <span className="car-cat" style={{ top: "1.1rem", left: "1.1rem" }}>
          {categoryLabel}
        </span>
        {photos.map((src, i) => (
          <div key={src} className={`mgal-frame${i === activeIndex ? " is-active" : ""}`}>
            <Image
              src={src}
              alt={alt}
              fill
              sizes="(max-width: 800px) 100vw, 58vw"
              priority={i === 0}
              placeholder="blur"
              blurDataURL={MEDIA_BLUR}
            />
          </div>
        ))}
      </div>

      {count > 1 ? (
        <div className="mgal-thumbs">
          {photos.map((src, i) => (
            <button
              key={src}
              type="button"
              className={`mgal-thumb${i === activeIndex ? " is-active" : ""}`}
              onClick={() => setActiveIndex(i)}
              aria-label={`${alt} — foto ${i + 1} dari ${count}`}
              aria-current={i === activeIndex}
            >
              <Image src={src} alt="" fill sizes="72px" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

/* Prefiks mgal- agar tidak bentrok dengan gaya global lain. */
const galleryCss = `
  .mgal-main {
    position: relative;
    overflow: hidden;
    background: var(--surface-2);
  }
  .mgal-frame {
    position: absolute;
    inset: 0;
    opacity: 0;
    transition: opacity 0.45s ease;
    pointer-events: none;
  }
  .mgal-frame img {
    object-fit: cover;
  }
  .mgal-frame.is-active {
    opacity: 1;
    pointer-events: auto;
  }
  .mgal-thumbs {
    display: flex;
    gap: 0.6rem;
    padding: 0.75rem;
    flex-wrap: wrap;
  }
  .mgal-thumb {
    position: relative;
    width: 72px;
    height: 72px;
    flex: 0 0 auto;
    padding: 0;
    overflow: hidden;
    border-radius: var(--radius);
    border: 1px solid var(--border);
    background: var(--surface-2);
    cursor: pointer;
    opacity: 0.62;
    transition: opacity 0.25s ease, border-color 0.25s ease;
  }
  .mgal-thumb img {
    object-fit: cover;
  }
  .mgal-thumb:hover {
    opacity: 0.9;
  }
  .mgal-thumb.is-active {
    opacity: 1;
    border: 2px solid var(--accent);
  }
`;

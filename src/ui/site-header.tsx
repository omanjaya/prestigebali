"use client";

// Header scroll-aware + menu mobile. Tanpa "Admin" di topbar (per permintaan).
// Nav berupa anchor ke section landing + CTA.

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const LINKS = [
  { href: "/#collection", label: "Collection" },
  { href: "/#experience", label: "Experience" },
  { href: "/#modes", label: "Ways to Ride" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const isLanding = pathname === "/";
  // Landing: topbar tersembunyi di hero, muncul saat scroll. Halaman lain: selalu terlihat.
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const visible = !isLanding || scrolled;

  useEffect(() => {
    if (!isLanding) return; // halaman non-landing tak butuh logika scroll
    const onScroll = () => setScrolled(window.scrollY > 120);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isLanding]);

  // Beri padding-atas pada konten halaman non-landing agar tak tertutup header fixed.
  useEffect(() => {
    document.body.classList.toggle("inner-page", !isLanding);
    return () => document.body.classList.remove("inner-page");
  }, [isLanding]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className={`site-header${visible || open ? " is-visible" : ""}`}>
      <div className="container site-header-inner">
        <Link href="/" className="brand" onClick={() => setOpen(false)}>
          <span className="brand-name">Prestige</span>
          <span className="brand-loc">Bali</span>
        </Link>

        <nav className="site-nav site-nav--desktop">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="nav-link">
              {l.label}
            </Link>
          ))}
          <Link href="/#collection" className="btn btn-primary btn-sm">
            Book Now
          </Link>
        </nav>

        <button
          className="nav-toggle"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span className={`nav-toggle-bar${open ? " a" : ""}`} />
          <span className={`nav-toggle-bar${open ? " b" : ""}`} />
        </button>
      </div>

      <AnimatePresence>
        {open ? (
          <motion.div
            className="mobile-menu"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.28, ease: [0.2, 0.7, 0.2, 1] }}
          >
            <nav className="mobile-menu-nav">
              {LINKS.map((l, i) => (
                <motion.div
                  key={l.href}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 + i * 0.06 }}
                >
                  <Link href={l.href} onClick={() => setOpen(false)}>
                    {l.label}
                  </Link>
                </motion.div>
              ))}
              <Link href="/#collection" className="btn btn-primary" onClick={() => setOpen(false)}>
                Book Now
              </Link>
            </nav>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}

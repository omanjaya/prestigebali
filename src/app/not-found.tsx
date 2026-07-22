// 404 global — editorial, bilingual (EN+ID) statis sederhana (tanpa i18n provider).
// Server Component: dirender di dalam RootLayout (header/footer tetap tampil).

import Link from "next/link";
import type { Metadata } from "next";
import { waLink } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Page not found — Prestige Bali",
};

export default function NotFound() {
  return (
    <section className="status-page">
      <div className="container status-page-inner">
        <span className="kicker">404</span>
        <h1 className="status-page-title">
          Halaman tidak ditemukan
          <br />
          Page not found
        </h1>
        <div className="status-page-rule" />
        <p className="muted status-page-sub">
          Tautan yang Anda tuju mungkin sudah tidak berlaku atau halamannya telah dipindahkan.
          <br />
          The link you followed may be outdated, or the page may have moved.
        </p>
        <div className="row status-page-actions">
          <Link href="/" className="btn btn-primary">
            Back to Home
          </Link>
          <a
            href={waLink("Halo, saya butuh bantuan menemukan halaman di situs Prestige Bali.")}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-ghost"
          >
            Chat WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}

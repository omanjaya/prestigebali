import type { Metadata } from "next";
import Link from "next/link";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";

// Editorial Noir (ADR: redesign premium): serif display + sans bersih (maks 2 typeface).
const display = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});
const body = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Prestige — Sewa Mobil Mewah",
  description: "Booking mobil mewah: lepas kunci atau pakai sopir.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" className={`${display.variable} ${body.variable}`}>
      <body>
        <header className="site-header">
          <div className="container site-header-inner">
            <Link href="/" className="brand">
              Prestige
            </Link>
            <nav className="site-nav">
              <Link href="/">Etalase</Link>
              <Link href="/admin">Admin</Link>
            </nav>
          </div>
        </header>

        <main>{children}</main>

        <footer className="site-footer">
          <div className="container site-footer-inner">
            <span className="footer-brand">Prestige</span>
            <span className="muted footer-tag">
              Sewa Mobil Mewah · Lepas Kunci &amp; Pakai Sopir
            </span>
          </div>
        </footer>
      </body>
    </html>
  );
}

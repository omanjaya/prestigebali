import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import "./landing.css";
import { SiteHeader } from "@/ui/site-header";
import Link from "next/link";

// Editorial Noir: serif display + sans bersih (maks 2 typeface).
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
  title: "Prestige — Luxury Car Rental",
  description: "Self-drive or chauffeur. A curated fleet of the world's finest cars.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body>
        <SiteHeader />
        <main>{children}</main>
        <footer className="site-footer">
          <div className="container site-footer-inner">
            <span className="footer-brand">Prestige</span>
            <span className="muted footer-tag">
              Luxury Car Rental · Self-Drive &amp; Chauffeur
            </span>
            <Link href="/admin" className="footer-admin muted">
              Admin
            </Link>
          </div>
        </footer>
      </body>
    </html>
  );
}

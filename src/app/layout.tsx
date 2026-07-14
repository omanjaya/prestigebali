import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";
import "./landing.css";
import { SiteHeader } from "@/ui/site-header";
import { SmoothScroll } from "@/ui/smooth-scroll";
import { CustomCursor } from "@/ui/custom-cursor";
import Link from "next/link";

// Warm Noir: Fraunces (serif display hangat/berkarakter) + Inter (body bersih).
const display = Fraunces({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});
const body = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Prestige Bali — Luxury Car Rental",
  description: "Self-drive or chauffeur in Bali. A curated fleet of the world's finest cars.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body>
        <SmoothScroll />
        <CustomCursor />
        <SiteHeader />
        <main>{children}</main>
        <footer className="site-footer">
          <div className="container site-footer-inner">
            <span className="footer-brand">Prestige Bali</span>
            <span className="muted footer-tag">
              Luxury Car Rental · Bali · Self-Drive &amp; Chauffeur
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

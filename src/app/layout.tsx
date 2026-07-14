import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";
import "./landing.css";
import { SiteHeader } from "@/ui/site-header";
import { SmoothScroll } from "@/ui/smooth-scroll";
import { CustomCursor } from "@/ui/custom-cursor";
import { SiteFooter } from "@/ui/site-footer";
import { WhatsAppFab } from "@/ui/whatsapp-fab";

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
  openGraph: {
    title: "Prestige Bali — Luxury Car Rental",
    description: "Self-drive or chauffeur in Bali. A curated fleet of the world's finest cars.",
    siteName: "Prestige Bali",
    locale: "en_US",
    type: "website",
  },
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
        <SiteFooter />
        <WhatsAppFab />
      </body>
    </html>
  );
}

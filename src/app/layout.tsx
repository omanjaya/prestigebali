import type { Metadata } from "next";
import { Cormorant_Garamond, Jost } from "next/font/google";
import "./globals.css";
import "./landing.css";
import { SiteHeader } from "@/ui/site-header";
import { SmoothScroll } from "@/ui/smooth-scroll";
import { CustomCursor } from "@/ui/custom-cursor";
import { SiteFooter } from "@/ui/site-footer";
import { WhatsAppFab } from "@/ui/whatsapp-fab";
import { HideOnAdmin } from "@/ui/hide-on-admin";
import { I18nProvider } from "@/i18n/client";
import { mergeMessages } from "@/i18n/config";
import { getCurrency, getLocale } from "@/i18n/server";
import { commonMessages } from "@/i18n/messages/common";
import { siteMessages } from "@/i18n/messages/site";
import { bookingMessages } from "@/i18n/messages/booking";

// Cormorant Garamond (serif fashion-editorial kontras tinggi) + Jost (sans geometris
// ramping). Keduanya mendukung Cyrillic — judul & body locale RU ikut premium.
const display = Cormorant_Garamond({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});
const body = Jost({
  subsets: ["latin", "cyrillic"],
  weight: ["300", "400", "500", "600"],
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

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // i18n (halaman pelanggan): locale dari cookie / Accept-Language, mata uang display-only.
  const locale = await getLocale();
  const currency = await getCurrency(locale);
  const messages = mergeMessages(locale, commonMessages, siteMessages, bookingMessages);
  // Kurs efektif dari Settings admin (fallback konstanta bila DB belum siap).
  const rates = await import("@/lib/settings")
    .then((m) => m.getRates())
    .catch(() => undefined);

  return (
    <html lang={locale} className={`${display.variable} ${body.variable}`}>
      <body>
        <I18nProvider locale={locale} currency={currency} messages={messages} rates={rates}>
          {/* Kursor custom & smooth-scroll hanya untuk situs pelanggan — di admin
              (alat kerja) keduanya justru mengganggu: kursor ring menutupi data,
              Lenis membuat scroll tabel terasa melayang. */}
          <HideOnAdmin>
            <SmoothScroll />
            <CustomCursor />
            <SiteHeader />
          </HideOnAdmin>
          <main>{children}</main>
          <HideOnAdmin>
            <SiteFooter />
            <WhatsAppFab />
          </HideOnAdmin>
        </I18nProvider>
      </body>
    </html>
  );
}

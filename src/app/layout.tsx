import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Prestige — Sewa Mobil Mewah",
  description: "Booking mobil mewah: lepas kunci atau pakai sopir.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
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
      <body>
        <header className="site-header">
          <div className="container">
            <Link href="/" className="brand">
              Prestige
            </Link>
            <div className="spacer" />
            <nav className="row" style={{ gap: "1.25rem" }}>
              <Link href="/">Etalase</Link>
              <Link href="/admin" className="muted">
                Admin
              </Link>
            </nav>
          </div>
        </header>

        <main>{children}</main>

        <footer className="site-footer">
          <div className="container">
            <span>© Prestige — Sewa Mobil Mewah</span>
            <div className="spacer" />
            <span className="muted">Lepas Kunci · Pakai Sopir</span>
          </div>
        </footer>
      </body>
    </html>
  );
}

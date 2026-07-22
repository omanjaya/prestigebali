"use client";

// Menyembunyikan chrome situs pelanggan (footer, WhatsApp FAB) pada rute /admin —
// area admin punya shell sendiri (sidebar). Children boleh Server Component
// (diteruskan sebagai prop dari root layout).

import { usePathname } from "next/navigation";

export function HideOnAdmin({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;
  return <>{children}</>;
}

// Reveal helpers — CSS scroll-driven (lihat .reveal/.stagger di landing.css).
// TIDAK bergantung JS untuk visibilitas: konten selalu ada & terlihat sebagai fallback
// (mis. browser tanpa animation-timeline, reduced-motion, atau JS gagal). Animasi hanya
// enhancement saat di-scroll. Ini menghindari "section blank" bila animasi tak jalan.

import type { CSSProperties, ReactNode } from "react";

export function Reveal({
  children,
  className,
  as = "div",
  style,
}: {
  children: ReactNode;
  /** Diabaikan pada mode CSS scroll-driven; dipertahankan agar pemanggil lama tetap valid. */
  delay?: number;
  y?: number;
  className?: string;
  as?: "div" | "section" | "li" | "span";
  style?: CSSProperties;
}) {
  const Tag = as;
  return (
    <Tag className={className ? `reveal ${className}` : "reveal"} style={style}>
      {children}
    </Tag>
  );
}

export function StaggerGroup({
  children,
  className,
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div className={className ? `stagger ${className}` : "stagger"} style={style}>
      {children}
    </div>
  );
}

export function StaggerItem({
  children,
  className,
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div className={className} style={style}>
      {children}
    </div>
  );
}

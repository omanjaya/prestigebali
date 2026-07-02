// Primitives presentasi bersama (server-component friendly, tanpa hooks).
// Semua halaman memakai ini agar visual konsisten. Kelas didefinisikan di globals.css.

import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";

export function Container({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div className="container" style={style}>
      {children}
    </div>
  );
}

export function Card({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div className="card" style={style}>
      {children}
    </div>
  );
}

export function CardBody({ children }: { children: ReactNode }) {
  return <div className="card-body">{children}</div>;
}

/** Placeholder media gradien (foto Mobil belum ada). */
export function CardMedia({ label }: { label: string }) {
  return <div className="card-media">{label}</div>;
}

export function Badge({
  children,
  variant = "default",
}: {
  children: ReactNode;
  variant?: "default" | "accent" | "ok" | "danger";
}) {
  const cls = variant === "default" ? "badge" : `badge badge-${variant}`;
  return <span className={cls}>{children}</span>;
}

type ButtonVariant = "default" | "primary" | "ghost";
function btnClass(variant: ButtonVariant): string {
  if (variant === "primary") return "btn btn-primary";
  if (variant === "ghost") return "btn btn-ghost";
  return "btn";
}

/** Tautan bergaya tombol (untuk navigasi). */
export function ButtonLink({
  href,
  children,
  variant = "default",
}: {
  href: string;
  children: ReactNode;
  variant?: ButtonVariant;
}) {
  return (
    <Link href={href} className={btnClass(variant)}>
      {children}
    </Link>
  );
}

export function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor?: string;
  children: ReactNode;
}) {
  return (
    <div className="field">
      <label htmlFor={htmlFor}>{label}</label>
      {children}
    </div>
  );
}

export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div style={{ padding: "2rem 0 1rem" }}>
      <h1 style={{ margin: 0 }}>{title}</h1>
      {subtitle ? <p className="muted" style={{ margin: "0.25rem 0 0" }}>{subtitle}</p> : null}
    </div>
  );
}

// Primitives presentasi bersama (server-component friendly, tanpa hooks).
// Editorial Noir. Kelas di globals.css. API dijaga stabil (halaman lain tak berubah).

import Link from "next/link";
import Image from "next/image";
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

/**
 * Media Mobil: foto nyata (Next Image) bila `src` ada, jika tidak placeholder duotone
 * elegan bertuliskan `label`. `sizes` menyesuaikan grid katalog.
 */
export function CardMedia({
  label,
  src,
  priority,
  sizes = "(max-width: 700px) 100vw, 33vw",
}: {
  label: string;
  src?: string;
  priority?: boolean;
  sizes?: string;
}) {
  if (!src) {
    return (
      <div className="card-media card-media--empty">
        <span>{label}</span>
      </div>
    );
  }
  return (
    <div className="card-media">
      <Image src={src} alt={label} fill sizes={sizes} priority={priority} />
    </div>
  );
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

export function PageHeader({
  title,
  subtitle,
  kicker,
}: {
  title: string;
  subtitle?: string;
  kicker?: string;
}) {
  return (
    <div style={{ padding: "3rem 0 1.5rem" }}>
      {kicker ? <div className="kicker" style={{ marginBottom: "0.75rem" }}>{kicker}</div> : null}
      <h1 style={{ margin: 0 }}>{title}</h1>
      {subtitle ? (
        <p className="muted" style={{ margin: "0.6rem 0 0", maxWidth: 560 }}>
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}

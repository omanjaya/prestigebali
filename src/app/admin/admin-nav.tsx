"use client";

// Sub-nav admin (sticky di bawah header situs). Active link via pathname.

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOutAction } from "./actions";

const LINKS = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/reports", label: "Reports" },
  { href: "/admin/cars", label: "Fleet" },
];

export function AdminNav({ email }: { email?: string | null }) {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  return (
    <div className="admin-bar">
      <div className="container admin-bar-inner">
        <span className="admin-brandmark">
          Prestige <em>Admin</em>
        </span>
        <nav className="admin-links">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={isActive(l.href) ? "admin-link is-active" : "admin-link"}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <span className="admin-spacer" />
        {email ? <span className="admin-email">{email}</span> : null}
        <form action={signOutAction}>
          <button type="submit" className="btn btn-sm btn-ghost">
            Sign out
          </button>
        </form>
      </div>
    </div>
  );
}

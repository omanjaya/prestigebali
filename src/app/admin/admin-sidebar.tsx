"use client";

// Sidebar admin — navigasi utama panel /admin. Desktop: kolom kiri sticky dengan
// grup menu berikon; mobile (<940px): topbar + drawer overlay. Active link via
// pathname. Menggantikan AdminNav (top bar) lama.

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Icon } from "@/ui/icons";
import { signOutAction } from "./actions";

type IconName = Parameters<typeof Icon>[0]["name"];

/** Badge angka per menu: key cocok dengan `badge` pada link. */
export interface SidebarBadges {
  approvals?: number; // Booking menunggu approve (Dashboard)
  chat?: number; // Pesan pelanggan belum dibaca (Chat)
}

const GROUPS: {
  label: string;
  links: { href: string; label: string; icon: IconName; badge?: keyof SidebarBadges }[];
}[] = [
  {
    label: "Operations",
    links: [
      { href: "/admin", label: "Dashboard", icon: "grid", badge: "approvals" },
      { href: "/admin/chat", label: "Chat", icon: "chat", badge: "chat" },
      { href: "/admin/payments", label: "Payments", icon: "coin" },
    ],
  },
  {
    label: "Fleet",
    links: [
      { href: "/admin/cars", label: "Cars", icon: "steering" },
      { href: "/admin/units", label: "Units", icon: "key" },
    ],
  },
  {
    label: "Marketing",
    links: [
      { href: "/admin/promos", label: "Promo Codes", icon: "percent" },
      { href: "/admin/posts", label: "Blog Posts", icon: "pen" },
    ],
  },
  {
    label: "Insights",
    links: [{ href: "/admin/reports", label: "Reports", icon: "chart" }],
  },
  {
    label: "System",
    links: [{ href: "/admin/settings", label: "Settings", icon: "gear" }],
  },
];

function NavContent({
  email,
  badges,
  onNavigate,
}: {
  email?: string | null;
  badges?: SidebarBadges;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  // Halaman tanpa entri menu sendiri (detail booking, handover) dianggap bagian
  // Dashboard agar admin tidak kehilangan orientasi di sidebar.
  const isActive = (href: string) =>
    href === "/admin"
      ? pathname === "/admin" ||
        pathname.startsWith("/admin/bookings") ||
        pathname.startsWith("/admin/handover")
      : pathname.startsWith(href);

  return (
    <>
      <Link href="/admin" className="admin-side-brand" onClick={onNavigate}>
        Prestige <em>Admin</em>
      </Link>

      <nav className="admin-side-nav">
        {GROUPS.map((g) => (
          <div key={g.label} className="admin-side-group">
            <span className="admin-side-group-label">{g.label}</span>
            {g.links.map((l) => {
              const n = l.badge ? (badges?.[l.badge] ?? 0) : 0;
              const active = isActive(l.href);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={onNavigate}
                  aria-current={active ? "page" : undefined}
                  className={active ? "admin-side-link is-active" : "admin-side-link"}
                >
                  <Icon name={l.icon} size={17} />
                  {l.label}
                  {n > 0 ? <span className="admin-side-badge">{n > 99 ? "99+" : n}</span> : null}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="admin-side-foot">
        <Link href="/" className="admin-side-link admin-side-view-site" onClick={onNavigate}>
          <Icon name="arrow" size={15} style={{ transform: "rotate(180deg)" }} />
          View site
        </Link>
        {email ? <span className="admin-side-email">{email}</span> : null}
        <form action={signOutAction}>
          <button type="submit" className="btn btn-sm btn-ghost" style={{ width: "100%" }}>
            Sign out
          </button>
        </form>
      </div>
    </>
  );
}

export function AdminSidebar({
  email,
  badges,
}: {
  email?: string | null;
  badges?: SidebarBadges;
}) {
  const [open, setOpen] = useState(false);

  // Drawer mobile: kunci scroll body saat terbuka + tutup dengan tombol Escape.
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      {/* Desktop */}
      <aside className="admin-sidebar">
        <NavContent email={email} badges={badges} />
      </aside>

      {/* Mobile: topbar + drawer */}
      <div className="admin-topbar">
        <Link href="/admin" className="admin-side-brand">
          Prestige <em>Admin</em>
        </Link>
        <button
          type="button"
          className="admin-burger"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>
      {open ? (
        <div className="admin-drawer-scrim" onClick={() => setOpen(false)}>
          <div className="admin-drawer" onClick={(e) => e.stopPropagation()}>
            <NavContent email={email} badges={badges} onNavigate={() => setOpen(false)} />
          </div>
        </div>
      ) : null}
    </>
  );
}

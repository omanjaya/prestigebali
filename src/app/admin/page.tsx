// Dashboard admin (Overview). Auth guard + sub-nav ada di admin/layout.tsx.
// Fokus: KPI premium, panel "Needs attention", tabel booking dengan filter tab.

import Link from "next/link";
import { listBookings, type BookingView } from "@/lib/bookings";
import { Container } from "@/ui/primitives";
import { Icon } from "@/ui/icons";
import { formatIDR } from "@/ui/format";
import { BookingsTable } from "./bookings-table";

export const dynamic = "force-dynamic";

type KpiIcon = "key" | "calendar" | "shield" | "clock";

function isRevenueBearing(b: BookingView): boolean {
  return b.status !== "CANCELLED" && b.status !== "EXPIRED";
}

function Kpi({
  value,
  label,
  sub,
  icon,
  primary,
}: {
  value: string;
  label: string;
  sub: string;
  icon: KpiIcon;
  primary?: boolean;
}) {
  return (
    <div className={primary ? "kpi kpi-primary" : "kpi"}>
      <span className="kpi-icon">
        <Icon name={icon} size={18} />
      </span>
      <div className="kpi-value">{value}</div>
      <div className="kpi-label">{label}</div>
      <div className="kpi-sub">{sub}</div>
    </div>
  );
}

export default async function AdminPage() {
  const bookings = await listBookings();

  const revenue = bookings
    .filter(isRevenueBearing)
    .reduce((s, b) => s + (b.dpAmount ?? 0) + (b.settlementAmount ?? 0), 0);
  const active = bookings.filter((b) =>
    ["REQUESTED", "AWAITING_APPROVAL", "CONFIRMED", "ONGOING"].includes(b.status),
  ).length;
  const awaiting = bookings.filter((b) => b.status === "AWAITING_APPROVAL").length;
  const outstanding = bookings.filter(
    (b) => b.status === "CONFIRMED" && b.dpAmount != null && b.settlementAmount == null,
  );

  return (
    <Container style={{ padding: "2.5rem 0 4rem" }}>
      <div className="reveal" style={{ marginBottom: "2rem" }}>
        <span className="kicker">Overview</span>
        <h1 style={{ margin: "0.6rem 0 0.3rem" }}>Dashboard</h1>
        <p className="muted" style={{ margin: 0 }}>
          A live snapshot of bookings, revenue and fleet activity.
        </p>
      </div>

      <div className="reveal kpi-grid" style={{ marginBottom: "1.25rem" }}>
        <Kpi primary value={formatIDR(revenue)} label="Total Revenue" sub="DP + settlements received" icon="key" />
        <Kpi value={String(active)} label="Active Bookings" sub="in the pipeline" icon="calendar" />
        <Kpi value={String(awaiting)} label="Awaiting Approval" sub="self-drive verification" icon="shield" />
        <Kpi value={String(outstanding.length)} label="Outstanding" sub="deposit paid, balance due" icon="clock" />
      </div>

      {awaiting > 0 || outstanding.length > 0 ? (
        <div className="reveal attn-grid" style={{ marginBottom: "2.75rem" }}>
          {awaiting > 0 ? (
            <div className="attn-card">
              <span className="attn-num">{awaiting}</span>
              <div>
                <div style={{ fontWeight: 600 }}>Awaiting approval</div>
                <div className="muted" style={{ fontSize: "0.85rem" }}>
                  Self-drive bookings need driver verification.
                </div>
              </div>
            </div>
          ) : null}
          {outstanding.length > 0 ? (
            <Link href="/admin/reports" className="attn-card">
              <span className="attn-num">{outstanding.length}</span>
              <div>
                <div style={{ fontWeight: 600 }}>Outstanding payments</div>
                <div className="muted" style={{ fontSize: "0.85rem" }}>
                  Confirmed bookings awaiting balance — view in reports.
                </div>
              </div>
              <span className="admin-spacer" />
              <Icon name="arrow" size={16} style={{ color: "var(--accent)" }} />
            </Link>
          ) : null}
        </div>
      ) : null}

      <div className="reveal" id="bookings">
        <div
          className="row"
          style={{ justifyContent: "space-between", alignItems: "baseline", marginBottom: "1rem" }}
        >
          <h2 style={{ margin: 0 }}>Bookings</h2>
          <span className="eyebrow">{bookings.length} total</span>
        </div>
        <BookingsTable bookings={bookings} />
      </div>
    </Container>
  );
}

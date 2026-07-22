// Dashboard admin (Overview). Auth guard + sub-nav ada di admin/layout.tsx.
// Fokus: KPI premium, panel "Needs attention", tabel booking dengan cari + filter + pagination.

import Link from "next/link";
import { listBookings, searchBookings, type BookingView } from "@/lib/bookings";
import { listAllUnits, type UnitView } from "@/lib/units";
import type { BookingStatus } from "@/domain/booking/booking";
import { Container } from "@/ui/primitives";
import { Icon } from "@/ui/icons";
import { formatIDR } from "@/ui/format";
import { BookingsTable } from "./bookings-table";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 25;

const STATUS_VALUES: BookingStatus[] = [
  "REQUESTED",
  "AWAITING_APPROVAL",
  "CONFIRMED",
  "ONGOING",
  "COMPLETED",
  "CANCELLED",
  "EXPIRED",
];

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

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const pick = (key: string): string => {
    const v = sp[key];
    return typeof v === "string" ? v : "";
  };

  const q = pick("q");
  const statusRaw = pick("status");
  const status = STATUS_VALUES.includes(statusRaw as BookingStatus)
    ? (statusRaw as BookingStatus)
    : undefined;
  const pageRaw = Number(pick("page"));
  const page = Number.isFinite(pageRaw) && pageRaw > 0 ? Math.floor(pageRaw) : 1;

  // KPI (Revenue/Active/Awaiting/Outstanding) DAN badge angka tab status memakai
  // listBookings() (100 booking terbaru, TIDAK terpengaruh ?q/?status/?page) — supaya
  // kartu ringkasan tetap menunjukkan gambaran keseluruhan meski admin sedang mencari
  // atau memfilter tabel di bawahnya. Tabel bookingnya sendiri (rows) datang dari
  // searchBookings() terpisah, yang baru menerapkan q/status/pagination.
  const [kpiBookings, allUnits, search] = await Promise.all([
    listBookings(),
    listAllUnits(),
    searchBookings({ q: q || undefined, status, page, pageSize: PAGE_SIZE }),
  ]);

  const unitsByModel = allUnits.reduce<Record<string, UnitView[]>>((map, u) => {
    (map[u.carModelId] ??= []).push(u);
    return map;
  }, {});

  const revenue = kpiBookings
    .filter(isRevenueBearing)
    .reduce((s, b) => s + (b.dpAmount ?? 0) + (b.settlementAmount ?? 0), 0);
  const active = kpiBookings.filter((b) =>
    ["REQUESTED", "AWAITING_APPROVAL", "CONFIRMED", "ONGOING"].includes(b.status),
  ).length;
  const awaiting = kpiBookings.filter((b) => b.status === "AWAITING_APPROVAL").length;
  const outstanding = kpiBookings.filter(
    (b) => b.status === "CONFIRMED" && b.dpAmount != null && b.settlementAmount == null,
  );

  const tabCounts: Partial<Record<BookingStatus, number>> = {};
  for (const st of STATUS_VALUES) {
    tabCounts[st] = kpiBookings.filter((b) => b.status === st).length;
  }

  const { rows, total, pageSize } = search;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  function pageHref(p: number): string {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (status) params.set("status", status);
    params.set("page", String(p));
    return `/admin?${params.toString()}#bookings`;
  }

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
          <span className="eyebrow">{total} total</span>
        </div>

        <form method="GET" className="admin-filter-bar" style={{ marginBottom: "1rem" }}>
          <input type="hidden" name="status" value={status ?? ""} />
          <label style={{ flex: "1 1 220px" }}>
            Cari
            <input type="text" name="q" defaultValue={q} placeholder="Cari kode / nama / HP…" />
          </label>
          <button type="submit" className="btn btn-sm btn-primary">
            Search
          </button>
          <Link href="/admin#bookings" className="btn btn-sm btn-ghost">
            Reset
          </Link>
        </form>

        <BookingsTable
          bookings={rows}
          units={unitsByModel}
          q={q || undefined}
          status={status}
          counts={tabCounts}
          allCount={kpiBookings.length}
        />

        <div
          className="row"
          style={{ justifyContent: "space-between", alignItems: "center", marginTop: "1.25rem" }}
        >
          {page > 1 ? (
            <Link href={pageHref(page - 1)} className="btn btn-sm btn-ghost">
              Prev
            </Link>
          ) : (
            <span className="btn btn-sm btn-ghost" aria-disabled="true" style={{ opacity: 0.4 }}>
              Prev
            </span>
          )}
          <span className="muted" style={{ fontSize: "0.85rem" }}>
            Page {page} of {totalPages}
          </span>
          {page < totalPages ? (
            <Link href={pageHref(page + 1)} className="btn btn-sm btn-ghost">
              Next
            </Link>
          ) : (
            <span className="btn btn-sm btn-ghost" aria-disabled="true" style={{ opacity: 0.4 }}>
              Next
            </span>
          )}
        </div>
      </div>
    </Container>
  );
}

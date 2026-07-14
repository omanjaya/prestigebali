// Admin · Reports — read-only analytics page (Warm Noir, English UI).
// Server Component async: numbers come from getReports() (aggregated from DB).
// Visualizations use single-hue CSS bars (no chart library) for an elegant,
// honest read of revenue-per-car, rental mode split, and fleet utilization.

import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { getReports } from "@/lib/reports";
import { Container, Card, CardBody } from "@/ui/primitives";
import { Icon } from "@/ui/icons";
import { formatIDR, formatWIB } from "@/ui/format";

// Always read the freshest DB — never cache the reports page.
export const dynamic = "force-dynamic";

type StatIcon = "key" | "calendar" | "clock" | "shield";

function StatTile({ value, label, icon }: { value: string; label: string; icon: StatIcon }) {
  return (
    <div className="stat">
      <div
        className="row"
        style={{ justifyContent: "space-between", alignItems: "flex-start", gap: "0.75rem" }}
      >
        <div className="stat-value">{value}</div>
        <span
          aria-hidden="true"
          style={{
            display: "inline-flex",
            color: "var(--accent)",
            border: "1px solid var(--border-strong)",
            borderRadius: "999px",
            padding: "0.4rem",
          }}
        >
          <Icon name={icon} size={16} />
        </span>
      </div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

/** Percentage width for a value against a max, clamped 0–100 (0 → 0). */
function barPct(value: number, max: number): number {
  if (max <= 0) return 0;
  return Math.max(0, Math.min(100, (value / max) * 100));
}

export default async function ReportsPage() {
  const s = await auth();
  if (s?.user?.role !== "ADMIN") redirect("/login");

  const report = await getReports();
  const {
    revenueTotal,
    revenueThisMonth,
    dpTotal,
    perCar,
    mode,
    outstanding,
    utilizationDays,
    generatedAt,
  } = report;

  // Bars are scaled to the top performer so the leader reads as a full bar and
  // everything else is honestly proportional to it.
  const maxRevenue = perCar.reduce((m, r) => Math.max(m, r.revenue), 0);

  // Mode split as share of total rides (guard divide-by-zero).
  const modeTotal = mode.selfDrive + mode.chauffeur;
  const selfDrivePct = barPct(mode.selfDrive, modeTotal);
  const chauffeurPct = barPct(mode.chauffeur, modeTotal);

  return (
    <Container style={{ paddingBottom: "3rem" }}>
      <style>{`
        .rp-bar-track {
          position: relative;
          height: 8px;
          border-radius: 2px;
          background: var(--surface-2);
          border: 1px solid var(--border);
          overflow: hidden;
        }
        .rp-bar-fill {
          position: absolute;
          inset: 0 auto 0 0;
          height: 100%;
          border-radius: 2px;
          background: var(--accent);
        }
        .rp-mode-row {
          display: grid;
          grid-template-columns: 120px 1fr auto;
          align-items: center;
          gap: 1rem;
          margin: 0.9rem 0;
        }
        .rp-mode-label {
          font-size: 0.72rem;
          font-weight: 600;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--muted);
        }
        .rp-carbar {
          min-width: 120px;
        }
        @media (max-width: 640px) {
          .rp-mode-row {
            grid-template-columns: 90px 1fr auto;
            gap: 0.6rem;
          }
        }
      `}</style>

      {/* ---- Header ---- */}
      <div
        className="reveal row"
        style={{
          justifyContent: "space-between",
          alignItems: "flex-end",
          gap: "1.5rem",
          padding: "3rem 0 2rem",
          borderBottom: "1px solid var(--border)",
          marginBottom: "2.5rem",
        }}
      >
        <div>
          <div className="kicker" style={{ marginBottom: "0.75rem" }}>
            Admin · Reports
          </div>
          <h1 style={{ margin: 0 }}>Reports</h1>
          <p className="muted" style={{ margin: "0.6rem 0 0" }}>
            Generated {formatWIB(generatedAt)}
          </p>
        </div>
        <Link href="/admin" className="btn btn-sm btn-ghost">
          ← Back to Admin
        </Link>
      </div>

      {/* ---- KPI row ---- */}
      <div
        className="reveal"
        style={{
          display: "grid",
          gap: "1rem",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          marginBottom: "2.5rem",
        }}
      >
        <StatTile value={formatIDR(revenueTotal)} label="Revenue" icon="key" />
        <StatTile value={formatIDR(revenueThisMonth)} label="This month" icon="calendar" />
        <StatTile value={formatIDR(dpTotal)} label="Deposits received" icon="shield" />
        <StatTile value={String(outstanding.length)} label="Outstanding" icon="clock" />
      </div>

      {/* ---- Revenue & bookings per car ---- */}
      <div className="reveal" style={{ marginBottom: "2.5rem" }}>
        <Card>
          <CardBody>
            <div
              className="row"
              style={{
                justifyContent: "space-between",
                alignItems: "baseline",
                marginBottom: "0.75rem",
              }}
            >
              <h2 style={{ margin: 0 }}>Revenue &amp; bookings per car</h2>
              <span className="eyebrow">{perCar.length} models</span>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Car</th>
                    <th style={{ textAlign: "right" }}>Bookings</th>
                    <th style={{ textAlign: "right" }}>Revenue</th>
                    <th style={{ textAlign: "right" }}>Days</th>
                    <th style={{ minWidth: 180 }}>Share</th>
                  </tr>
                </thead>
                <tbody>
                  {perCar.map((r) => (
                    <tr key={r.carModelId}>
                      <td style={{ fontWeight: 600 }}>{r.carName}</td>
                      <td style={{ textAlign: "right" }}>{r.bookings}</td>
                      <td style={{ textAlign: "right" }} className="price">
                        {formatIDR(r.revenue)}
                      </td>
                      <td style={{ textAlign: "right" }} className="muted">
                        {r.daysRented}
                      </td>
                      <td className="rp-carbar">
                        <div
                          className="rp-bar-track"
                          aria-hidden="true"
                          title={formatIDR(r.revenue)}
                        >
                          <div
                            className="rp-bar-fill"
                            style={{ width: `${barPct(r.revenue, maxRevenue)}%` }}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                  {perCar.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="muted" style={{ textAlign: "center" }}>
                        No cars yet.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* ---- By mode ---- */}
      <div className="reveal" style={{ marginBottom: "2.5rem" }}>
        <Card>
          <CardBody>
            <div
              className="row"
              style={{
                justifyContent: "space-between",
                alignItems: "baseline",
                marginBottom: "0.5rem",
              }}
            >
              <h2 style={{ margin: 0 }}>By mode</h2>
              <span className="eyebrow">{modeTotal} bookings</span>
            </div>

            <div className="rp-mode-row">
              <span className="rp-mode-label">Self-Drive</span>
              <div className="rp-bar-track" aria-hidden="true">
                <div className="rp-bar-fill" style={{ width: `${selfDrivePct}%` }} />
              </div>
              <span className="muted" style={{ fontSize: "0.85rem", whiteSpace: "nowrap" }}>
                {mode.selfDrive} · {Math.round(selfDrivePct)}%
              </span>
            </div>

            <div className="rp-mode-row">
              <span className="rp-mode-label">Chauffeur</span>
              <div className="rp-bar-track" aria-hidden="true">
                <div className="rp-bar-fill" style={{ width: `${chauffeurPct}%` }} />
              </div>
              <span className="muted" style={{ fontSize: "0.85rem", whiteSpace: "nowrap" }}>
                {mode.chauffeur} · {Math.round(chauffeurPct)}%
              </span>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* ---- Fleet utilization ---- */}
      <div className="reveal" style={{ marginBottom: "2.5rem" }}>
        <Card>
          <CardBody>
            <div
              className="row"
              style={{
                justifyContent: "space-between",
                alignItems: "baseline",
                marginBottom: "0.75rem",
              }}
            >
              <h2 style={{ margin: 0 }}>Fleet utilization</h2>
              <span className="eyebrow">{utilizationDays} rented days</span>
            </div>
            <p className="muted" style={{ marginTop: 0, marginBottom: "1rem" }}>
              Total active rental-days across the fleet, and how they split per model.
            </p>
            <div style={{ overflowX: "auto" }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Car</th>
                    <th style={{ textAlign: "right" }}>Stock</th>
                    <th style={{ textAlign: "right" }}>Days rented</th>
                    <th style={{ minWidth: 180 }}>Share</th>
                  </tr>
                </thead>
                <tbody>
                  {perCar.map((r) => (
                    <tr key={r.carModelId}>
                      <td style={{ fontWeight: 600 }}>{r.carName}</td>
                      <td style={{ textAlign: "right" }} className="muted">
                        {r.stock}
                      </td>
                      <td style={{ textAlign: "right" }}>{r.daysRented}</td>
                      <td className="rp-carbar">
                        <div className="rp-bar-track" aria-hidden="true">
                          <div
                            className="rp-bar-fill"
                            style={{ width: `${barPct(r.daysRented, utilizationDays)}%` }}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                  {perCar.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="muted" style={{ textAlign: "center" }}>
                        No cars yet.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* ---- Outstanding payments ---- */}
      <div className="reveal">
        <Card>
          <CardBody>
            <div
              className="row"
              style={{
                justifyContent: "space-between",
                alignItems: "baseline",
                marginBottom: "0.75rem",
              }}
            >
              <h2 style={{ margin: 0 }}>Outstanding payments</h2>
              <span className="eyebrow">{outstanding.length} awaiting settlement</span>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Car</th>
                    <th>Customer</th>
                    <th style={{ textAlign: "right" }}>Deposit</th>
                    <th>Start date</th>
                    <th>Receipt</th>
                  </tr>
                </thead>
                <tbody>
                  {outstanding.map((o) => (
                    <tr key={o.id}>
                      <td style={{ fontWeight: 600 }}>{o.carName}</td>
                      <td>{o.customerName}</td>
                      <td style={{ textAlign: "right" }} className="price">
                        {formatIDR(o.dpAmount)}
                      </td>
                      <td>
                        <span
                          className="muted"
                          style={{ fontSize: "0.85rem", whiteSpace: "nowrap" }}
                        >
                          {formatWIB(o.startAt)}
                        </span>
                      </td>
                      <td>
                        <Link href={`/receipt/${o.id}`} className="btn btn-sm btn-ghost">
                          Receipt
                        </Link>
                      </td>
                    </tr>
                  ))}
                  {outstanding.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="muted" style={{ textAlign: "center" }}>
                        Nothing outstanding — all settled.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>
      </div>
    </Container>
  );
}

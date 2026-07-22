// Admin · Payments — daftar transaksi (DP, Pelunasan, Deposit, Refund) dengan filter
// periode/jenis/status via GET searchParams, dan ringkasan total per jenis untuk hasil
// terfilter. Auth guard di admin/layout.tsx.

import Link from "next/link";
import { listPayments, type PaymentFilter, type PaymentRow } from "@/lib/payments";
import type { PaymentKind, PaymentStatus } from "@prisma/client";
import { Container, Card, CardBody, Field } from "@/ui/primitives";
import { formatIDR, formatWIB } from "@/ui/format";

// Selalu baca DB terbaru — jangan cache halaman transaksi.
export const dynamic = "force-dynamic";

const KIND_VALUES: PaymentKind[] = ["DP", "SETTLEMENT", "DEPOSIT", "REFUND"];
const STATUS_VALUES: PaymentStatus[] = ["PENDING", "PAID", "FAILED", "REFUNDED"];

const KIND_LABEL: Record<PaymentKind, string> = {
  DP: "DP",
  SETTLEMENT: "Pelunasan",
  DEPOSIT: "Deposit",
  REFUND: "Refund",
};

function kindBadgeClass(kind: PaymentRow["kind"]): string {
  if (kind === "DP" || kind === "SETTLEMENT") return "badge badge-ok";
  if (kind === "REFUND") return "badge badge-danger";
  return "badge badge-accent";
}

function statusBadgeClass(status: PaymentRow["status"]): string {
  if (status === "PAID") return "badge badge-ok";
  if (status === "FAILED" || status === "REFUNDED") return "badge badge-danger";
  return "badge badge-accent";
}

function sumByKind(rows: PaymentRow[], kind: PaymentKind): number {
  return rows.filter((r) => r.kind === kind).reduce((s, r) => s + r.amount, 0);
}

function SummaryTile({ value, label }: { value: string; label: string }) {
  return (
    <div className="stat">
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

const PP_STYLE = `
  .pp-filter-item {
    flex: 1 1 160px;
    min-width: 160px;
  }
  @media (max-width: 640px) {
    .pp-filter-item {
      flex: 1 1 100%;
      min-width: 0;
    }
  }
`;

export default async function AdminPaymentsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const pick = (key: string): string => {
    const v = sp[key];
    return typeof v === "string" ? v : "";
  };

  const fromRaw = pick("from");
  const toRaw = pick("to");
  const kindRaw = pick("kind");
  const statusRaw = pick("status");

  const fromDate = fromRaw ? new Date(`${fromRaw}T00:00:00`) : undefined;
  const toDate = toRaw ? new Date(`${toRaw}T23:59:59.999`) : undefined;

  const filter: PaymentFilter = {
    from: fromDate && !Number.isNaN(fromDate.getTime()) ? fromDate : undefined,
    to: toDate && !Number.isNaN(toDate.getTime()) ? toDate : undefined,
    kind: KIND_VALUES.includes(kindRaw as PaymentKind) ? (kindRaw as PaymentKind) : undefined,
    status: STATUS_VALUES.includes(statusRaw as PaymentStatus)
      ? (statusRaw as PaymentStatus)
      : undefined,
  };

  const payments = await listPayments(filter);

  const dpTotal = sumByKind(payments, "DP");
  const settlementTotal = sumByKind(payments, "SETTLEMENT");
  const depositTotal = sumByKind(payments, "DEPOSIT");
  const refundTotal = sumByKind(payments, "REFUND");

  return (
    <Container style={{ paddingBottom: "3rem" }}>
      <style>{PP_STYLE}</style>

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
            Admin · Payments
          </div>
          <h1 style={{ margin: 0 }}>Payments</h1>
          <p className="muted" style={{ margin: "0.6rem 0 0" }}>
            Rekonsiliasi transaksi DP, Pelunasan, Deposit jaminan, dan Refund.
          </p>
        </div>
      </div>

      {/* ---- Filter bar ---- */}
      <div className="reveal" style={{ marginBottom: "2rem" }}>
        <Card>
          <CardBody>
            <form method="GET" className="admin-filter-bar">
              <div className="pp-filter-item">
                <Field label="Dari tanggal" htmlFor="from">
                  <input id="from" name="from" type="date" defaultValue={fromRaw} />
                </Field>
              </div>
              <div className="pp-filter-item">
                <Field label="Sampai tanggal" htmlFor="to">
                  <input id="to" name="to" type="date" defaultValue={toRaw} />
                </Field>
              </div>
              <div className="pp-filter-item">
                <Field label="Jenis" htmlFor="kind">
                  <select id="kind" name="kind" defaultValue={kindRaw}>
                    <option value="">All</option>
                    {KIND_VALUES.map((k) => (
                      <option key={k} value={k}>
                        {KIND_LABEL[k]}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
              <div className="pp-filter-item">
                <Field label="Status" htmlFor="status">
                  <select id="status" name="status" defaultValue={statusRaw}>
                    <option value="">All</option>
                    {STATUS_VALUES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
              <div className="admin-actions-row">
                <button type="submit" className="btn btn-primary">
                  Apply
                </button>
                <Link href="/admin/payments" className="btn btn-ghost">
                  Reset
                </Link>
              </div>
            </form>
          </CardBody>
        </Card>
      </div>

      {/* ---- Ringkasan ---- */}
      <div
        className="reveal"
        style={{
          display: "grid",
          gap: "1rem",
          gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
          marginBottom: "2.5rem",
        }}
      >
        <SummaryTile value={formatIDR(dpTotal)} label="DP total" />
        <SummaryTile value={formatIDR(settlementTotal)} label="Pelunasan total" />
        <SummaryTile value={formatIDR(depositTotal)} label="Deposit ditahan" />
        <SummaryTile value={formatIDR(refundTotal)} label="Refund total" />
      </div>

      {/* ---- Tabel transaksi ---- */}
      <div className="reveal">
        <Card>
          <CardBody>
            <div
              className="row"
              style={{ justifyContent: "space-between", alignItems: "baseline", marginBottom: "0.75rem" }}
            >
              <h2 style={{ margin: 0 }}>Transactions</h2>
              <span className="eyebrow">{payments.length} shown</span>
            </div>
            <div className="admin-table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Waktu</th>
                    <th>Jenis</th>
                    <th style={{ textAlign: "right" }}>Nominal</th>
                    <th>Status</th>
                    <th>Mobil</th>
                    <th>Pelanggan</th>
                    <th>Booking</th>
                    <th>Ref. Gateway</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p) => (
                    <tr key={p.id}>
                      <td className="muted" style={{ fontSize: "0.85rem", whiteSpace: "nowrap" }}>
                        {formatWIB(p.createdAt)}
                      </td>
                      <td>
                        <span className={kindBadgeClass(p.kind)}>{KIND_LABEL[p.kind]}</span>
                      </td>
                      <td style={{ textAlign: "right" }} className="price">
                        {formatIDR(p.amount)}
                      </td>
                      <td>
                        <span className={statusBadgeClass(p.status)}>{p.status}</span>
                      </td>
                      <td>{p.carName}</td>
                      <td>{p.customerName}</td>
                      <td>
                        <Link href={`/admin/bookings/${p.bookingId}`} className="btn btn-sm btn-ghost">
                          {p.bookingId}
                        </Link>
                      </td>
                      <td className="muted" style={{ fontSize: "0.78rem" }}>
                        {p.gatewayRef ?? "—"}
                      </td>
                    </tr>
                  ))}
                  {payments.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="muted" style={{ textAlign: "center", padding: "2rem" }}>
                        Tidak ada transaksi yang cocok dengan filter ini.
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

// Admin — Booking detail (pusat kendali satu booking): ringkasan, uang, verifikasi
// pengemudi (Self-Drive), riwayat pembayaran, dan aksi kondisional (sama persis
// logikanya dengan bookings-table.tsx di dashboard). Auth guard di admin/layout.tsx.

import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { getBooking } from "@/lib/bookings";
import { paymentsForBooking, type PaymentRow } from "@/lib/payments";
import { getConversationForBooking } from "@/lib/conversations";
import { listUnitsForModel } from "@/lib/units";
import { Container, Card, CardBody } from "@/ui/primitives";
import { Icon } from "@/ui/icons";
import { formatIDR, formatWIB, MODE_LABEL, STATUS_LABEL, statusBadgeClass } from "@/ui/format";
import { approveBooking, cancelBooking, allocateUnit, markOngoing, markCompleted } from "../../actions";
import { ConfirmButton } from "../../confirm-button";

// Selalu baca DB terbaru — jangan cache halaman detail booking.
export const dynamic = "force-dynamic";

const PAYMENT_KIND_LABEL: Record<PaymentRow["kind"], string> = {
  DP: "DP",
  SETTLEMENT: "Pelunasan",
  REFUND: "Refund",
  DEPOSIT: "Deposit jaminan",
};

function paymentKindBadgeClass(kind: PaymentRow["kind"]): string {
  if (kind === "DP" || kind === "SETTLEMENT") return "badge badge-ok";
  if (kind === "REFUND") return "badge badge-danger";
  return "badge badge-accent";
}

function paymentStatusBadgeClass(status: PaymentRow["status"]): string {
  if (status === "PAID") return "badge badge-ok";
  if (status === "FAILED" || status === "REFUNDED") return "badge badge-danger";
  return "badge badge-accent";
}

function Row({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="bk-row">
      <span className="bk-row-label">{label}</span>
      <span className="bk-row-value">{value}</span>
    </div>
  );
}

export default async function BookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const booking = await getBooking(id);
  if (!booking) notFound();

  const [payments, conversation, units] = await Promise.all([
    paymentsForBooking(id),
    getConversationForBooking(id),
    listUnitsForModel(booking.carModelId),
  ]);

  const messageCount = conversation?.messages.length ?? 0;
  const isSelfDrive = booking.mode === "SELF_DRIVE";
  const canApprove = booking.status === "AWAITING_APPROVAL" && !!booking.verificationSubmittedAt;
  const canAllocate = booking.status === "CONFIRMED" || booking.status === "ONGOING";
  const canMarkOngoing = booking.status === "CONFIRMED";
  const canMarkCompleted = booking.status === "ONGOING";
  const canCancel =
    booking.status === "REQUESTED" ||
    booking.status === "AWAITING_APPROVAL" ||
    booking.status === "CONFIRMED";

  return (
    <Container style={{ padding: "2.5rem 0 4rem" }}>
      <style>{`
        .bk-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.25rem;
        }
        .bk-row {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          gap: 1rem;
          padding: 0.5rem 0;
          border-bottom: 1px solid var(--border);
        }
        .bk-row:last-child {
          border-bottom: none;
        }
        .bk-row-label {
          font-size: 0.78rem;
          color: var(--muted);
          white-space: nowrap;
        }
        .bk-row-value {
          font-weight: 600;
          text-align: right;
        }
        @media (max-width: 860px) {
          .bk-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="reveal" style={{ marginBottom: "1.75rem" }}>
        <span className="kicker">Booking · {booking.id}</span>
        <div
          className="row"
          style={{ alignItems: "center", gap: "0.75rem", margin: "0.6rem 0 0.3rem" }}
        >
          <h1 style={{ margin: 0 }}>{booking.carName}</h1>
          <span className={statusBadgeClass(booking.status)}>{STATUS_LABEL[booking.status]}</span>
        </div>
        <p className="muted" style={{ margin: 0 }}>Dibuat {formatWIB(booking.createdAt)}</p>
      </div>

      <div className="reveal bk-grid" style={{ marginBottom: "1.25rem" }}>
        <Card>
          <CardBody>
            <h2 style={{ margin: "0 0 0.75rem" }}>Booking</h2>
            <Row label="Mode" value={MODE_LABEL[booking.mode]} />
            <Row
              label="Periode"
              value={`${formatWIB(booking.startAt)} – ${formatWIB(booking.endAt)}`}
            />
            <Row
              label="Pelanggan"
              value={
                <>
                  {booking.customerName}
                  <br />
                  <span className="muted" style={{ fontWeight: 400 }}>
                    {booking.customerPhone}
                  </span>
                </>
              }
            />
            <Row label="Unit teralokasi" value={booking.allocatedUnit ?? "Belum dialokasikan"} />
            {booking.holdExpiresAt ? (
              <Row label="Hold berakhir" value={formatWIB(booking.holdExpiresAt)} />
            ) : null}
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <h2 style={{ margin: "0 0 0.75rem" }}>Uang</h2>
            <Row label="DP" value={booking.dpAmount != null ? formatIDR(booking.dpAmount) : "—"} />
            <Row
              label="Pelunasan"
              value={booking.settlementAmount != null ? formatIDR(booking.settlementAmount) : "—"}
            />
            {booking.promoCode ? (
              <Row
                label="Diskon promo"
                value={`${booking.promoCode} · -${formatIDR(booking.discountAmount ?? 0)}`}
              />
            ) : null}
            {booking.depositAmount != null ? (
              <Row
                label="Deposit jaminan"
                value={
                  <>
                    {formatIDR(booking.depositAmount)}{" "}
                    <span className="muted" style={{ fontWeight: 400, fontSize: "0.78rem" }}>
                      (refundable)
                    </span>
                  </>
                }
              />
            ) : null}
          </CardBody>
        </Card>

        {isSelfDrive ? (
          <Card>
            <CardBody>
              <h2 style={{ margin: "0 0 0.75rem" }}>Verifikasi Pengemudi</h2>
              {booking.verificationSubmittedAt ? (
                <>
                  <Row label="Nama SIM" value={booking.licenseName ?? "—"} />
                  <Row label="No. SIM" value={booking.licenseNumber ?? "—"} />
                  <Row label="No. KTP" value={booking.ktpNumber ?? "—"} />
                  <Row label="Dikirim" value={formatWIB(booking.verificationSubmittedAt)} />
                </>
              ) : (
                <p className="muted" style={{ margin: 0 }}>
                  Belum dikirim data verifikasi pengemudi.
                </p>
              )}
            </CardBody>
          </Card>
        ) : null}

        <Card>
          <CardBody>
            <div
              className="row"
              style={{ justifyContent: "space-between", alignItems: "baseline", marginBottom: "0.75rem" }}
            >
              <h2 style={{ margin: 0 }}>Riwayat Pembayaran</h2>
              <span className="eyebrow">{payments.length} transaksi</span>
            </div>
            {payments.length === 0 ? (
              <p className="muted" style={{ margin: 0 }}>Belum ada transaksi.</p>
            ) : (
              <div className="admin-table-wrap">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Jenis</th>
                      <th style={{ textAlign: "right" }}>Nominal</th>
                      <th>Status</th>
                      <th>Ref. Gateway</th>
                      <th>Waktu</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((p) => (
                      <tr key={p.id}>
                        <td>
                          <span className={paymentKindBadgeClass(p.kind)}>
                            {PAYMENT_KIND_LABEL[p.kind]}
                          </span>
                        </td>
                        <td style={{ textAlign: "right" }} className="price">
                          {formatIDR(p.amount)}
                        </td>
                        <td>
                          <span className={paymentStatusBadgeClass(p.status)}>{p.status}</span>
                        </td>
                        <td className="muted" style={{ fontSize: "0.82rem" }}>
                          {p.gatewayRef ?? "—"}
                        </td>
                        <td className="muted" style={{ fontSize: "0.82rem", whiteSpace: "nowrap" }}>
                          {formatWIB(p.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      <div className="reveal" style={{ marginBottom: "1.75rem" }}>
        <Card>
          <CardBody>
            <h2 style={{ margin: "0 0 0.9rem" }}>Aksi</h2>
            <div className="admin-actions-row" style={{ marginBottom: "1rem" }}>
              {canApprove ? (
                <form action={approveBooking}>
                  <input type="hidden" name="bookingId" value={booking.id} />
                  <button type="submit" className="btn btn-primary">
                    Approve
                  </button>
                </form>
              ) : null}

              {canAllocate ? (
                <form
                  action={allocateUnit}
                  className="row"
                  style={{ gap: "0.4rem", alignItems: "center", flexWrap: "nowrap" }}
                >
                  <input type="hidden" name="bookingId" value={booking.id} />
                  <select
                    name="unitId"
                    defaultValue={booking.allocatedUnitId ?? ""}
                    style={{ maxWidth: 180 }}
                  >
                    <option value="" disabled>
                      Pilih unit…
                    </option>
                    {units.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.color} · {u.plate}
                      </option>
                    ))}
                  </select>
                  <button type="submit" className="btn">
                    {booking.allocatedUnitId ? "Reassign" : "Allocate"}
                  </button>
                </form>
              ) : null}

              {canMarkOngoing ? (
                <form action={markOngoing}>
                  <input type="hidden" name="bookingId" value={booking.id} />
                  <button type="submit" className="btn">
                    Mark Ongoing
                  </button>
                </form>
              ) : null}

              {canMarkCompleted ? (
                <form action={markCompleted}>
                  <input type="hidden" name="bookingId" value={booking.id} />
                  <button type="submit" className="btn">
                    Mark Completed
                  </button>
                </form>
              ) : null}

              {canCancel ? (
                <form action={cancelBooking}>
                  <input type="hidden" name="bookingId" value={booking.id} />
                  <ConfirmButton className="btn btn-ghost">Cancel</ConfirmButton>
                </form>
              ) : null}
            </div>

            <div className="admin-actions-row">
              <Link href={`/admin/handover/${booking.id}`} className="btn btn-sm btn-ghost">
                <Icon name="key" size={14} /> Handover form
              </Link>
              <Link href={`/admin/chat/${booking.id}`} className="btn btn-sm btn-ghost">
                <Icon name="chat" size={14} /> Open chat
                {messageCount > 0 ? ` (${messageCount})` : ""}
              </Link>
              <Link href={`/status/${booking.id}`} className="btn btn-sm btn-ghost" target="_blank">
                Customer status page ↗
              </Link>
              <Link href={`/receipt/${booking.id}`} className="btn btn-sm btn-ghost" target="_blank">
                Receipt ↗
              </Link>
            </div>
          </CardBody>
        </Card>
      </div>

      <Link href="/admin" className="btn btn-ghost">
        ← Dashboard
      </Link>
    </Container>
  );
}

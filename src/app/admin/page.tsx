// Panel Admin — ringkasan laporan + tabel Booking dengan aksi operator.
// Server Component async: seluruh angka dihitung dari listBookings() (data DB
// via Prisma). Aksi baris terhubung ke Server Actions di ./actions.ts.

import { listBookings } from "@/lib/bookings";
import type { BookingView } from "@/lib/bookings";
import { Container, Card, CardBody } from "@/ui/primitives";
import { Icon } from "@/ui/icons";
import { formatIDR, formatWIB, MODE_LABEL, STATUS_LABEL, statusBadgeClass } from "@/ui/format";
import { approveBooking, cancelBooking, allocateUnit, signOutAction } from "./actions";
import { auth } from "@/auth";
import Link from "next/link";

// Selalu baca DB terbaru — jangan cache halaman admin.
export const dynamic = "force-dynamic";

/** Status yang dianggap "menghasilkan/menahan" pendapatan (bukan batal/kedaluwarsa). */
function isRevenueBearing(b: BookingView): boolean {
  return b.status !== "CANCELLED" && b.status !== "EXPIRED";
}

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

export default async function AdminPage() {
  const session = await auth();
  const bookings = await listBookings();

  // Pendapatan: DP + Pelunasan yang telah diterima, kecuali Booking batal/kedaluwarsa.
  const pendapatan = bookings
    .filter(isRevenueBearing)
    .reduce((sum, b) => sum + (b.dpAmount ?? 0) + (b.settlementAmount ?? 0), 0);

  // Booking aktif: masih dalam alur sebelum/selagi berjalan.
  const bookingAktif = bookings.filter((b) =>
    ["REQUESTED", "AWAITING_APPROVAL", "CONFIRMED", "ONGOING"].includes(b.status),
  ).length;

  // Pembayaran tertunda: CONFIRMED ber-DP tapi belum ada Pelunasan (belum lunas).
  const tertundaList = bookings.filter(
    (b) => b.status === "CONFIRMED" && b.dpAmount != null && b.settlementAmount == null,
  );
  const pembayaranTertunda = tertundaList.length;

  // Menunggu persetujuan: Lepas Kunci perlu Verifikasi Pengemudi.
  const menungguPersetujuan = bookings.filter((b) => b.status === "AWAITING_APPROVAL").length;

  return (
    <Container style={{ paddingBottom: "3rem" }}>
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
            Admin
          </div>
          <h1 style={{ margin: 0 }}>Bookings</h1>
          <p className="muted" style={{ margin: "0.6rem 0 0", maxWidth: 560 }}>
            Reporting overview &amp; booking management.
          </p>
        </div>
        <div className="row" style={{ gap: "0.75rem", alignItems: "center" }}>
          {session?.user?.email ? (
            <span className="muted" style={{ fontSize: "0.82rem" }}>
              {session.user.email}
            </span>
          ) : null}
          <Link href="/admin/cars" className="btn btn-sm">
            Manage cars
          </Link>
          <form action={signOutAction}>
            <button type="submit" className="btn btn-sm btn-ghost">
              Sign out
            </button>
          </form>
        </div>
      </div>

      <div
        className="reveal"
        style={{
          display: "grid",
          gap: "1rem",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          marginBottom: "2.5rem",
        }}
      >
        <StatTile value={formatIDR(pendapatan)} label="Revenue" icon="key" />
        <StatTile value={String(bookingAktif)} label="Active Bookings" icon="calendar" />
        <StatTile value={String(pembayaranTertunda)} label="Outstanding Payments" icon="clock" />
        <StatTile value={String(menungguPersetujuan)} label="Awaiting Approval" icon="shield" />
      </div>

      <div className="reveal">
      <Card>
        <CardBody>
          <div
            className="row"
            style={{ justifyContent: "space-between", alignItems: "baseline", marginBottom: "0.5rem" }}
          >
            <h2 style={{ margin: 0 }}>Booking List</h2>
            <span className="eyebrow">{bookings.length} total</span>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Car</th>
                  <th>Customer</th>
                  <th>Mode</th>
                  <th>Period</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b.id}>
                    <td>
                      <span
                        className="muted"
                        style={{ fontFamily: "monospace", fontSize: "0.8rem", letterSpacing: "0.02em" }}
                      >
                        {b.id}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600 }}>{b.carName}</td>
                    <td>{b.customerName}</td>
                    <td>
                      <span className="badge">{MODE_LABEL[b.mode]}</span>
                    </td>
                    <td>
                      <span className="muted" style={{ fontSize: "0.85rem", whiteSpace: "nowrap" }}>
                        {formatWIB(b.startAt)}
                      </span>
                    </td>
                    <td>
                      <span className={statusBadgeClass(b.status)}>{STATUS_LABEL[b.status]}</span>
                    </td>
                    <td>
                      <div className="row" style={{ gap: "0.5rem", flexWrap: "nowrap" }}>
                        {b.status === "AWAITING_APPROVAL" ? (
                          <form action={approveBooking}>
                            <input type="hidden" name="bookingId" value={b.id} />
                            <button type="submit" className="btn btn-sm btn-primary">
                              Approve
                            </button>
                          </form>
                        ) : null}
                        {b.status === "CONFIRMED" ? (
                          <form action={allocateUnit}>
                            <input type="hidden" name="bookingId" value={b.id} />
                            <button type="submit" className="btn btn-sm">
                              Allocate Unit
                            </button>
                          </form>
                        ) : null}
                        {["REQUESTED", "AWAITING_APPROVAL", "CONFIRMED"].includes(b.status) ? (
                          <form action={cancelBooking}>
                            <input type="hidden" name="bookingId" value={b.id} />
                            <button type="submit" className="btn btn-sm btn-ghost">
                              Cancel
                            </button>
                          </form>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>
      </div>
    </Container>
  );
}

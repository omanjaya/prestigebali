// Panel Admin — ringkasan laporan + tabel Booking dengan aksi operator.
// Server Component async: seluruh angka dihitung dari listBookings() (data MOCK,
// belum ada DB). Aksi baris terhubung ke Server Actions di ./actions.ts.

import { listBookings } from "@/lib/mock-bookings";
import type { BookingView } from "@/lib/mock-bookings";
import { Container, Card, CardBody, PageHeader } from "@/ui/primitives";
import { formatIDR, formatWIB, MODE_LABEL, STATUS_LABEL, statusBadgeClass } from "@/ui/format";
import { approveBooking, cancelBooking, allocateUnit } from "./actions";

/** Status yang dianggap "menghasilkan/menahan" pendapatan (bukan batal/kedaluwarsa). */
function isRevenueBearing(b: BookingView): boolean {
  return b.status !== "CANCELLED" && b.status !== "EXPIRED";
}

function StatTile({ value, label }: { value: string; label: string }) {
  return (
    <Card>
      <CardBody>
        <div style={{ fontSize: "1.9rem", fontWeight: 700, lineHeight: 1.1 }}>{value}</div>
        <div className="muted" style={{ marginTop: "0.35rem" }}>
          {label}
        </div>
      </CardBody>
    </Card>
  );
}

export default async function AdminPage() {
  const bookings = listBookings();

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
      <PageHeader title="Panel Admin" subtitle="Ringkasan laporan & pengelolaan Booking." />

      <div className="grid" style={{ marginBottom: "1.5rem" }}>
        <StatTile value={formatIDR(pendapatan)} label="Pendapatan" />
        <StatTile value={String(bookingAktif)} label="Booking aktif" />
        <StatTile value={String(pembayaranTertunda)} label="Pembayaran Tertunda" />
        <StatTile value={String(menungguPersetujuan)} label="Menunggu Persetujuan" />
      </div>

      <Card>
        <CardBody>
          <h2 style={{ marginTop: 0 }}>Daftar Booking</h2>
          <div style={{ overflowX: "auto" }}>
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Mobil</th>
                  <th>Pelanggan</th>
                  <th>Mode</th>
                  <th>Periode</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b.id}>
                    <td>{b.id}</td>
                    <td>{b.carName}</td>
                    <td>{b.customerName}</td>
                    <td>{MODE_LABEL[b.mode]}</td>
                    <td>
                      <span className="muted" style={{ fontSize: "0.85rem" }}>
                        {formatWIB(b.startAt)}
                      </span>
                    </td>
                    <td>
                      <span className={statusBadgeClass(b.status)}>{STATUS_LABEL[b.status]}</span>
                    </td>
                    <td>
                      <div className="row" style={{ gap: "0.5rem" }}>
                        {b.status === "AWAITING_APPROVAL" ? (
                          <form action={approveBooking}>
                            <input type="hidden" name="bookingId" value={b.id} />
                            <button type="submit" className="btn btn-primary">
                              Setujui
                            </button>
                          </form>
                        ) : null}
                        {b.status === "CONFIRMED" ? (
                          <form action={allocateUnit}>
                            <input type="hidden" name="bookingId" value={b.id} />
                            <button type="submit" className="btn">
                              Alokasi Unit
                            </button>
                          </form>
                        ) : null}
                        {["REQUESTED", "AWAITING_APPROVAL", "CONFIRMED"].includes(b.status) ? (
                          <form action={cancelBooking}>
                            <input type="hidden" name="bookingId" value={b.id} />
                            <button type="submit" className="btn btn-ghost">
                              Batalkan
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
    </Container>
  );
}

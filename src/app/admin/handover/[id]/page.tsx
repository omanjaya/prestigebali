// Halaman admin serah-terima untuk satu booking: ringkasan + komparasi OUT vs IN
// + dua form checklist + link cetak Berita Acara. Auth guard di admin/layout.tsx.

import Link from "next/link";
import { getBooking } from "@/lib/bookings";
import { getHandovers, fuelLabel } from "@/lib/handovers";
import { Container } from "@/ui/primitives";
import { Icon } from "@/ui/icons";
import { formatWIB, MODE_LABEL, STATUS_LABEL, statusBadgeClass } from "@/ui/format";
import { HandoverForm } from "./handover-form";

export const dynamic = "force-dynamic";

export default async function HandoverAdminPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const booking = await getBooking(id);

  if (!booking) {
    return (
      <Container style={{ paddingTop: "3rem", paddingBottom: "3rem" }}>
        <span className="kicker">Admin · Serah Terima</span>
        <h1>Booking tidak ditemukan</h1>
        <p className="muted">Tidak ada booking dengan id “{id}”.</p>
        <Link href="/admin" className="btn btn-sm btn-ghost">
          ← Kembali ke dashboard
        </Link>
      </Container>
    );
  }

  const { out, in: inn } = await getHandovers(id);
  const bothDone = out && inn;
  const distance = bothDone ? inn.odometer - out.odometer : null;
  const fuelDrop = bothDone ? out.fuelEighths - inn.fuelEighths : null;
  const newDamage = inn?.damageNotes && inn.damageNotes !== out?.damageNotes;

  return (
    <Container style={{ paddingTop: "2.5rem", paddingBottom: "4rem" }}>
      <style>{`
        @media (max-width: 640px) {
          .ho-submit {
            width: 100%;
          }
        }
      `}</style>

      <div className="reveal" style={{ marginBottom: "1.75rem" }}>
        <span className="kicker">Admin · Serah Terima</span>
        <h1 style={{ margin: "0.6rem 0 0.3rem" }}>Berita Acara</h1>
        <p className="muted" style={{ margin: 0 }}>
          Checklist kondisi kendaraan saat pengambilan &amp; pengembalian.
        </p>
      </div>

      {/* Ringkasan booking */}
      <div className="reveal ho-summary" style={{ marginBottom: "1.5rem" }}>
        <div className="ho-summary-main">
          <span className={statusBadgeClass(booking.status)}>
            {STATUS_LABEL[booking.status]}
          </span>
          <h2 style={{ margin: "0.5rem 0 0.15rem" }}>{booking.carName}</h2>
          <p className="muted" style={{ margin: 0, fontSize: "0.9rem" }}>
            {booking.allocatedUnit ?? "Unit belum dialokasikan"}
          </p>
        </div>
        <dl className="ho-summary-meta">
          <div>
            <dt>Penyewa</dt>
            <dd>{booking.customerName}</dd>
          </div>
          <div>
            <dt>Mode</dt>
            <dd>{MODE_LABEL[booking.mode]}</dd>
          </div>
          <div>
            <dt>Periode</dt>
            <dd>
              {formatWIB(booking.startAt)} – {formatWIB(booking.endAt)}
            </dd>
          </div>
        </dl>
        <div className="ho-summary-actions">
          <Link href={`/handover/${id}`} className="btn btn-sm" target="_blank">
            <Icon name="arrow" size={14} /> Cetak Berita Acara
          </Link>
          <Link href={`/receipt/${id}`} className="btn btn-sm btn-ghost" target="_blank">
            Kwitansi
          </Link>
        </div>
      </div>

      {/* Komparasi OUT vs IN */}
      {bothDone ? (
        <div className="reveal ho-compare" style={{ marginBottom: "2rem" }}>
          <div className="ho-compare-item">
            <span className="ho-compare-label">Jarak ditempuh</span>
            <span className="ho-compare-value">
              {distance !== null && distance >= 0
                ? `${distance.toLocaleString("id-ID")} km`
                : "⚠ KM masuk < keluar"}
            </span>
            <span className="muted" style={{ fontSize: "0.78rem" }}>
              {out.odometer.toLocaleString("id-ID")} → {inn.odometer.toLocaleString("id-ID")}
            </span>
          </div>
          <div className="ho-compare-item">
            <span className="ho-compare-label">BBM</span>
            <span className="ho-compare-value">
              {fuelLabel(out.fuelEighths)} → {fuelLabel(inn.fuelEighths)}
            </span>
            <span className="muted" style={{ fontSize: "0.78rem" }}>
              {fuelDrop && fuelDrop > 0 ? `berkurang ${fuelDrop}/8` : "terisi penuh/sama"}
            </span>
          </div>
          <div className={`ho-compare-item${newDamage ? " ho-compare-flag" : ""}`}>
            <span className="ho-compare-label">Kerusakan baru</span>
            <span className="ho-compare-value">{newDamage ? "Ada — cek catatan" : "Tidak ada"}</span>
            {newDamage ? (
              <span className="muted" style={{ fontSize: "0.78rem" }}>
                {inn.damageNotes}
              </span>
            ) : null}
          </div>
        </div>
      ) : null}

      {/* Dua form */}
      <div className="reveal ho-forms">
        <HandoverForm bookingId={id} phase="OUT" existing={out} />
        <HandoverForm bookingId={id} phase="IN" existing={inn} />
      </div>
    </Container>
  );
}

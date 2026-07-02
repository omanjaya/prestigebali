// Halaman Status Booking (Server Component). Menampilkan proyeksi BookingView (mock)
// beserta timeline/stepper status. Data masih contoh sampai DB & read-API tersambung.

import { getBooking } from "@/lib/mock-bookings";
import {
  formatIDR,
  formatWIB,
  MODE_LABEL,
  STATUS_LABEL,
  statusBadgeClass,
} from "@/ui/format";
import { Container, Card, CardBody, ButtonLink } from "@/ui/primitives";
import type { BookingStatus, RentalMode } from "@/domain/booking/booking";

/** Terminal state yang menghentikan happy-path (ADR-0001). */
const TERMINAL: BookingStatus[] = ["EXPIRED", "CANCELLED"];

type Step = { status: BookingStatus; label: string };

/** Susun langkah happy-path sesuai mode. AWAITING_APPROVAL hanya untuk SELF_DRIVE. */
function steps(mode: RentalMode): Step[] {
  const order: BookingStatus[] = [
    "REQUESTED",
    "AWAITING_APPROVAL",
    "CONFIRMED",
    "ONGOING",
    "COMPLETED",
  ];
  return order
    .filter((s) => (s === "AWAITING_APPROVAL" ? mode === "SELF_DRIVE" : true))
    .map((s) => ({ status: s, label: STATUS_LABEL[s] }));
}

export default async function StatusPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const b = getBooking(id);

  if (!b) {
    return (
      <Container style={{ padding: "2rem 0" }}>
        <Card>
          <CardBody>
            <div className="stack">
              <h1 style={{ margin: 0 }}>Booking tidak ditemukan</h1>
              <p className="muted" style={{ margin: 0 }}>
                Kode booking &ldquo;{id}&rdquo; tidak dikenali. Periksa kembali tautan Anda.
              </p>
              <div className="row">
                <ButtonLink href="/" variant="primary">
                  Kembali ke Beranda
                </ButtonLink>
              </div>
            </div>
          </CardBody>
        </Card>
      </Container>
    );
  }

  const isTerminal = TERMINAL.includes(b.status);
  const flow = steps(b.mode);
  const currentIndex = flow.findIndex((s) => s.status === b.status);

  return (
    <Container style={{ padding: "2rem 0" }}>
      <div className="stack" style={{ gap: "1.25rem" }}>
        {/* 1. Header + status badge */}
        <div className="row">
          <h1 style={{ margin: 0 }}>Booking {b.id}</h1>
          <span className={statusBadgeClass(b.status)}>{STATUS_LABEL[b.status]}</span>
        </div>

        {/* 2. Timeline / stepper */}
        <Card>
          <CardBody>
            <h2 style={{ marginTop: 0 }}>Status Pesanan</h2>
            {isTerminal ? (
              <div className="stack" style={{ gap: "0.5rem" }}>
                <div className="row">
                  <span className="badge badge-danger">{STATUS_LABEL[b.status]}</span>
                </div>
                <p className="muted" style={{ margin: 0 }}>
                  {b.status === "EXPIRED"
                    ? "Masa tunggu pembayaran habis, hold stok dilepas."
                    : "Booking ini telah dibatalkan."}
                </p>
              </div>
            ) : (
              <ol
                className="stack"
                style={{ listStyle: "none", margin: 0, padding: 0, gap: "0.75rem" }}
              >
                {flow.map((step, i) => {
                  const done = currentIndex >= 0 && i < currentIndex;
                  const current = i === currentIndex;
                  const dotColor = current
                    ? "var(--accent)"
                    : done
                      ? "var(--ok)"
                      : "var(--border)";
                  return (
                    <li key={step.status} className="row" style={{ gap: "0.6rem" }}>
                      <span
                        aria-hidden
                        style={{
                          width: "0.9rem",
                          height: "0.9rem",
                          borderRadius: "999px",
                          background: current || done ? dotColor : "transparent",
                          border: `2px solid ${dotColor}`,
                          flex: "0 0 auto",
                        }}
                      />
                      <span
                        style={{
                          color: current
                            ? "var(--accent)"
                            : done
                              ? "var(--text)"
                              : "var(--muted)",
                          fontWeight: current ? 700 : 500,
                        }}
                      >
                        {step.label}
                        {current ? " · sekarang" : ""}
                      </span>
                    </li>
                  );
                })}
              </ol>
            )}
          </CardBody>
        </Card>

        {/* 3. Detail booking */}
        <Card>
          <CardBody>
            <h2 style={{ marginTop: 0 }}>Detail Booking</h2>
            <table className="table">
              <tbody>
                <tr>
                  <th style={{ width: "40%" }}>Mobil</th>
                  <td>{b.carName}</td>
                </tr>
                <tr>
                  <th>Mode</th>
                  <td>{MODE_LABEL[b.mode]}</td>
                </tr>
                <tr>
                  <th>Periode</th>
                  <td>
                    {formatWIB(b.startAt)} – {formatWIB(b.endAt)}
                  </td>
                </tr>
                <tr>
                  <th>Pelanggan</th>
                  <td>
                    {b.customerName} · {b.customerPhone}
                  </td>
                </tr>
                <tr>
                  <th>Unit dialokasikan</th>
                  <td>{b.allocatedUnit ?? "belum dialokasikan"}</td>
                </tr>
                <tr>
                  <th>DP</th>
                  <td>{b.dpAmount != null ? formatIDR(b.dpAmount) : "—"}</td>
                </tr>
                <tr>
                  <th>Pelunasan</th>
                  <td>
                    {b.settlementAmount != null ? formatIDR(b.settlementAmount) : "—"}
                  </td>
                </tr>
              </tbody>
            </table>
          </CardBody>
        </Card>

        {/* 4. CTA */}
        {b.status === "REQUESTED" ? (
          <div className="row">
            {/* TODO: wire ke pembayaran (Midtrans) */}
            <button type="button" className="btn btn-primary">
              Bayar DP
            </button>
          </div>
        ) : b.status === "CONFIRMED" && b.settlementAmount == null ? (
          <div className="row">
            {/* TODO: wire ke pembayaran (Midtrans) */}
            <button type="button" className="btn btn-primary">
              Bayar Pelunasan
            </button>
          </div>
        ) : null}

        {/* Catatan mock */}
        <p className="muted" style={{ margin: 0, fontSize: "0.85rem" }}>
          Data ini masih contoh (mock) sampai DB &amp; read-API tersambung.
        </p>
      </div>
    </Container>
  );
}

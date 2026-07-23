"use client";

// Tabel booking: tab status + search + pagination kini ditentukan SERVER-SIDE lewat
// searchBookings() di admin/page.tsx (?q, ?status, ?page) — komponen ini hanya
// merender rows halaman saat ini + tab-tab sebagai link yang menulis ?status= ke URL
// (mempertahankan ?q=), supaya tab tetap konsisten dengan pagination.
//
// Responsif: DUA markup dirender dari data yang sama — `.bt-desktop` (tabel, >760px)
// dan `.bt-cards` (satu kartu per booking, ≤760px); CSS (landing.css, kontrak bersama
// admin) yang memilih mana yang tampil, lihat komentar di sana. Supaya logika aksi per
// baris (Approve/Allocate/Ongoing/Completed/Cancel/Handover/Receipt + feedback) tidak
// terduplikasi antara dua markup, keduanya memakai SATU `<RowActions>` — hanya kelas
// pembungkus tombolnya yang beda (table butuh `.admin-actions-row` sendiri; kartu sudah
// dibungkus `.bt-card-actions` oleh induknya, jadi `RowActions` tak perlu bungkus lagi).
// `VerificationInfo` (snippet SIM/KTP untuk AWAITING_APPROVAL) juga sama-sama dipakai
// keduanya — komponen ini murni tampilan (tanpa state), jadi aman dipanggil dua kali.

import { useActionState } from "react";
import Link from "next/link";
import type { BookingView } from "@/lib/bookings";
import type { BookingStatus } from "@/domain/booking/booking";
import { formatIDR, formatWIB, MODE_LABEL, STATUS_LABEL, statusBadgeClass } from "@/ui/format";
import { bookingActionWithState, type BookingActionState } from "./actions";
import { ConfirmButton } from "./confirm-button";

type StatusTabKey = "ALL" | BookingStatus;

// Catatan: searchBookings() hanya menerima SATU BookingStatus (kontrak di lib/bookings.ts),
// jadi tab "Cancelled" lama yang menggabungkan CANCELLED+EXPIRED dipecah jadi dua tab
// terpisah — ini pilihan paling kecil perubahannya agar tiap tab tetap punya count &
// pagination yang benar-benar akurat lewat satu query status tunggal.
const STATUS_TABS: { key: StatusTabKey; label: string }[] = [
  { key: "ALL", label: "All" },
  { key: "REQUESTED", label: "Requested" },
  { key: "AWAITING_APPROVAL", label: "Awaiting" },
  { key: "CONFIRMED", label: "Confirmed" },
  { key: "ONGOING", label: "Ongoing" },
  { key: "COMPLETED", label: "Completed" },
  { key: "CANCELLED", label: "Cancelled" },
  { key: "EXPIRED", label: "Expired" },
];

function tabHref(key: StatusTabKey, q?: string): string {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (key !== "ALL") params.set("status", key);
  const qs = params.toString();
  return `/admin${qs ? `?${qs}` : ""}#bookings`;
}

/** Id pendek untuk kartu ponsel — cukup untuk dikenali tanpa memenuhi lebar kartu. */
function shortId(id: string): string {
  return id.length > 10 ? `${id.slice(0, 10)}…` : id;
}

/** "Rp 2.000.000 / Rp 8.000.000" (DP / total diterima sejauh ini) atau "—". */
function dpTotalLabel(b: BookingView): string {
  if (b.dpAmount == null) return "—";
  const total = b.dpAmount + (b.settlementAmount ?? 0);
  return `${formatIDR(b.dpAmount)} / ${formatIDR(total)}`;
}

export function BookingsTable({
  bookings,
  q,
  status,
  counts,
  allCount,
}: {
  bookings: BookingView[];
  /** Query pencarian aktif dari URL (?q=) — dipertahankan saat pindah tab. */
  q?: string;
  /** Status aktif dari URL (?status=) — undefined berarti tab "All". */
  status?: BookingStatus;
  /** Badge angka per status tab (dihitung admin/page.tsx dari dataset KPI). */
  counts?: Partial<Record<BookingStatus, number>>;
  /** Badge angka untuk tab "All". */
  allCount?: number;
}) {
  const activeKey: StatusTabKey = status ?? "ALL";
  const rows = bookings;

  return (
    <div>
      {/* Tab bisa lebih lebar dari layar ponsel (8 tab) — scroll horizontal di
          wrapper-nya sendiri alih-alih wrap jadi beberapa baris yang berantakan. */}
      <div style={{ overflowX: "auto" }}>
        <div className="tabs" style={{ flexWrap: "nowrap" }}>
          {STATUS_TABS.map((t) => (
            <Link
              key={t.key}
              href={tabHref(t.key, q)}
              className={t.key === activeKey ? "tab is-active" : "tab"}
              style={{ whiteSpace: "nowrap" }}
            >
              {t.label}
              <span className="tab-count">
                {t.key === "ALL" ? (allCount ?? 0) : (counts?.[t.key] ?? 0)}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* ---- Desktop: tabel ---- */}
      <div className="bt-desktop">
        <div className="admin-table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Car</th>
                <th>Customer</th>
                <th>Mode</th>
                <th>Period</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((b) => (
                <tr key={b.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{b.carName}</div>
                  </td>
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
                    {b.status === "AWAITING_APPROVAL" ? (
                      <VerificationInfo booking={b} />
                    ) : null}
                    <RowActions booking={b} />
                  </td>
                </tr>
              ))}
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="muted" style={{ textAlign: "center", padding: "2rem" }}>
                    No bookings in this view.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>

      {/* ---- Ponsel: kartu ---- */}
      <div className="bt-cards">
        {rows.map((b) => (
          <div className="bt-card" key={b.id}>
            <div className="bt-card-head">
              <div className="bt-card-title">{b.carName}</div>
              <span className={statusBadgeClass(b.status)}>{STATUS_LABEL[b.status]}</span>
            </div>
            <div className="bt-card-sub">
              {shortId(b.id)} · {b.customerName}
            </div>
            <dl style={{ margin: 0 }}>
              <div className="bt-card-row">
                <dt>Periode</dt>
                <dd>{formatWIB(b.startAt)}</dd>
              </div>
              <div className="bt-card-row">
                <dt>Mode</dt>
                <dd>{MODE_LABEL[b.mode]}</dd>
              </div>
              <div className="bt-card-row">
                <dt>DP / Total</dt>
                <dd>{dpTotalLabel(b)}</dd>
              </div>
              <div className="bt-card-row">
                <dt>Unit</dt>
                <dd>{b.allocatedUnit ?? "—"}</dd>
              </div>
            </dl>
            {b.status === "AWAITING_APPROVAL" ? <VerificationInfo booking={b} /> : null}
            <div className="bt-card-actions">
              <RowActions booking={b} className="" />
            </div>
          </div>
        ))}
        {rows.length === 0 ? (
          <div className="muted" style={{ textAlign: "center", padding: "2rem" }}>
            No bookings in this view.
          </div>
        ) : null}
      </div>
    </div>
  );
}

/** Snippet SIM/KTP untuk booking AWAITING_APPROVAL. Murni tampilan (tanpa state), jadi
 * aman dirender dua kali (tabel desktop + kartu ponsel) untuk booking yang sama. */
function VerificationInfo({ booking: b }: { booking: BookingView }) {
  if (!b.verificationSubmittedAt) {
    return (
      <div className="muted" style={{ fontSize: "0.78rem" }}>
        Menunggu data verifikasi dari pelanggan
      </div>
    );
  }
  return (
    <div style={{ fontSize: "0.78rem", lineHeight: 1.5 }}>
      <div style={{ fontWeight: 600 }}>{b.licenseName ?? "—"}</div>
      <div className="muted">
        SIM {b.licenseNumber ?? "—"} · KTP {b.ktpNumber ?? "—"}
      </div>
      <div className="muted">Submitted {formatWIB(b.verificationSubmittedAt)}</div>
    </div>
  );
}

const INITIAL_ACTION_STATE: BookingActionState = {};

/**
 * Aksi + feedback untuk SATU baris booking — dipakai baik di kolom Action tabel
 * desktop maupun di `.bt-card-actions` kartu ponsel, supaya set aksi (dan urutannya)
 * selalu identik di kedua tampilan. State di-scope per instance (bukan per tabel)
 * lewat useActionState terpisah, jadi sukses/gagal di satu baris/kartu tidak "bocor"
 * ke baris lain — dan karena kedua markup dirender sekaligus (CSS yang memilih mana
 * yang tampil), tiap booking punya DUA instance RowActions independen, satu per markup.
 *
 * `className` membungkus tombol-tombolnya sendiri (default `.admin-actions-row`, dipakai
 * di dalam <td> tabel yang bukan flex container). Kartu ponsel sudah dibungkus
 * `.bt-card-actions` (flex-wrap) oleh induknya, jadi di sana dipanggil dengan
 * `className=""` supaya tombol jadi anak langsung `.bt-card-actions` (tidak dibungkus
 * flex container ganda yang bisa merusak wrap-nya).
 */
function RowActions({
  booking: b,
  className = "admin-actions-row",
}: {
  booking: BookingView;
  className?: string;
}) {
  const [state, formAction, pending] = useActionState(bookingActionWithState, INITIAL_ACTION_STATE);

  const feedback =
    state.error || state.ok ? (
      <div
        className="muted"
        style={{
          fontSize: "0.75rem",
          marginTop: "0.35rem",
          color: state.error ? "var(--danger, #d33)" : "var(--ok, #2a8f4d)",
        }}
      >
        {state.error ?? state.ok}
      </div>
    ) : null;

  // RAMPING (anti-berantakan): dashboard hanya memuat SATU aksi utama kontekstual
  // per status + Detail (+ Cancel bila relevan). Aksi lengkap — alokasi unit,
  // handover, receipt, chat — hidup di halaman Detail booking, bukan ditumpuk
  // di sel tabel.
  const primary =
    b.status === "AWAITING_APPROVAL" && b.verificationSubmittedAt ? (
      <form action={formAction}>
        <input type="hidden" name="intent" value="approve" />
        <input type="hidden" name="bookingId" value={b.id} />
        <button type="submit" className="btn btn-sm btn-primary" disabled={pending}>
          Approve
        </button>
      </form>
    ) : b.status === "CONFIRMED" ? (
      <form action={formAction}>
        <input type="hidden" name="intent" value="ongoing" />
        <input type="hidden" name="bookingId" value={b.id} />
        <button type="submit" className="btn btn-sm btn-primary" disabled={pending}>
          Mark Ongoing
        </button>
      </form>
    ) : b.status === "ONGOING" ? (
      <form action={formAction}>
        <input type="hidden" name="intent" value="completed" />
        <input type="hidden" name="bookingId" value={b.id} />
        <button type="submit" className="btn btn-sm btn-primary" disabled={pending}>
          Mark Completed
        </button>
      </form>
    ) : null;

  const buttons = (
    <>
      {primary}
      <Link href={`/admin/bookings/${b.id}`} className="btn btn-sm btn-ghost">
        Detail
      </Link>
      {["REQUESTED", "CONFIRMED", "AWAITING_APPROVAL"].includes(b.status) ? (
        <form action={formAction}>
          <input type="hidden" name="intent" value="cancel" />
          <input type="hidden" name="bookingId" value={b.id} />
          <ConfirmButton className="btn btn-sm btn-ghost" disabled={pending}>
            Cancel
          </ConfirmButton>
        </form>
      ) : null}
      {b.status === "CONFIRMED" && !b.allocatedUnitId ? (
        <span className="muted" style={{ fontSize: "0.72rem", whiteSpace: "nowrap" }}>
          unit belum dialokasikan
        </span>
      ) : null}
    </>
  );

  return (
    <>
      {className ? <div className={className}>{buttons}</div> : buttons}
      {feedback}
    </>
  );
}

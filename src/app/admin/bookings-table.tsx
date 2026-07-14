"use client";

// Tabel booking dengan filter tab per status. Aksi baris tetap Server Actions.

import { useState } from "react";
import Link from "next/link";
import type { BookingView } from "@/lib/bookings";
import type { BookingStatus } from "@/domain/booking/booking";
import { formatWIB, MODE_LABEL, STATUS_LABEL, statusBadgeClass } from "@/ui/format";
import { approveBooking, cancelBooking, allocateUnit } from "./actions";

type TabKey = "ALL" | BookingStatus | "CANCELLED_EXPIRED";

const TABS: { key: TabKey; label: string; match: (s: BookingStatus) => boolean }[] = [
  { key: "ALL", label: "All", match: () => true },
  { key: "REQUESTED", label: "Requested", match: (s) => s === "REQUESTED" },
  { key: "AWAITING_APPROVAL", label: "Awaiting", match: (s) => s === "AWAITING_APPROVAL" },
  { key: "CONFIRMED", label: "Confirmed", match: (s) => s === "CONFIRMED" },
  { key: "ONGOING", label: "Ongoing", match: (s) => s === "ONGOING" },
  { key: "COMPLETED", label: "Completed", match: (s) => s === "COMPLETED" },
  {
    key: "CANCELLED_EXPIRED",
    label: "Cancelled",
    match: (s) => s === "CANCELLED" || s === "EXPIRED",
  },
];

export function BookingsTable({ bookings }: { bookings: BookingView[] }) {
  const [tab, setTab] = useState<TabKey>("ALL");
  const active = TABS.find((t) => t.key === tab) ?? TABS[0]!;
  const rows = bookings.filter((b) => active.match(b.status));

  return (
    <div>
      <div className="tabs">
        {TABS.map((t) => {
          const count = bookings.filter((b) => t.match(b.status)).length;
          return (
            <button
              key={t.key}
              type="button"
              className={t.key === tab ? "tab is-active" : "tab"}
              onClick={() => setTab(t.key)}
            >
              {t.label}
              <span className="tab-count">{count}</span>
            </button>
          );
        })}
      </div>

      <div style={{ overflowX: "auto" }}>
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
                          Allocate
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
                    {["CONFIRMED", "ONGOING", "COMPLETED"].includes(b.status) ? (
                      <Link href={`/admin/handover/${b.id}`} className="btn btn-sm btn-ghost">
                        Handover
                      </Link>
                    ) : null}
                    {b.dpAmount != null ? (
                      <Link href={`/receipt/${b.id}`} className="btn btn-sm btn-ghost">
                        Receipt
                      </Link>
                    ) : null}
                  </div>
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
  );
}

// Formatter & label bersama untuk UI. Bahasa domain mengikuti CONTEXT.md.

import type { BookingStatus, RentalMode } from "@/domain/booking/booking";

/** Format rupiah utuh, mis. 1500000 → "Rp 1.500.000". */
export function formatIDR(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Format date/time in WIB (Asia/Jakarta), e.g. "1 Aug 2026, 08:00". */
export function formatWIB(date: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Jakarta",
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function formatDateWIB(date: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Jakarta",
    dateStyle: "medium",
  }).format(date);
}

/** UI labels are English; domain glossary (CONTEXT.md) stays Indonesian. */
export const MODE_LABEL: Record<RentalMode, string> = {
  SELF_DRIVE: "Self-Drive",
  CHAUFFEUR: "Chauffeur",
};

export const STATUS_LABEL: Record<BookingStatus, string> = {
  REQUESTED: "Requested",
  AWAITING_APPROVAL: "Awaiting Approval",
  CONFIRMED: "Confirmed",
  EXPIRED: "Expired",
  ONGOING: "Ongoing",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

/** Kelas badge yang sesuai untuk sebuah status (lihat globals.css). */
export function statusBadgeClass(status: BookingStatus): string {
  if (status === "CONFIRMED" || status === "ONGOING" || status === "COMPLETED") {
    return "badge badge-ok";
  }
  if (status === "EXPIRED" || status === "CANCELLED") return "badge badge-danger";
  return "badge badge-accent";
}

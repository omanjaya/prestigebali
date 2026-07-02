// Booking application service — SEAM UTAMA (lihat PRD prestige-phase-1).
// Semua alur digerakkan lewat sini; logika domain hidup di balik seam ini.
//
// Metode masih STUB (melempar NotImplementedError) — diisi test-first lewat /tdd.
// State machine target (ADR-0001):
//
//   REQUESTED ──payDp──┬─ [CHAUFFEUR]  ─────────────► CONFIRMED
//                      └─ [SELF_DRIVE] ► AWAITING_APPROVAL ─approve─► CONFIRMED
//   REQUESTED ──hold timeout──► EXPIRED
//   {REQUESTED, AWAITING_APPROVAL, CONFIRMED} ──cancel/cancelByOperator──► CANCELLED
//   CONFIRMED ──markOngoing──► ONGOING ──markCompleted──► COMPLETED

import type { Booking, HandoverMethod, RentalMode, RentalPeriod } from "./booking";
import { NotImplementedError } from "./errors";
import type { BookingServiceDeps } from "./ports";

export interface CreateBookingCommand {
  carModelId: string;
  customerId: string;
  mode: RentalMode;
  period: RentalPeriod;
  handoverMethod?: HandoverMethod;
  pickupPoint?: string;
}

export interface BookingService {
  /** Buat Booking (REQUESTED) + Hold Stok bila tersedia. */
  createBooking(cmd: CreateBookingCommand): Promise<Booking>;
  /** DP diterima (dari webhook) → CONFIRMED (Pakai Sopir) / AWAITING_APPROVAL (Lepas Kunci). */
  payDp(input: { bookingId: string; gatewayRef: string }): Promise<Booking>;
  /** Admin menyetujui Verifikasi Pengemudi (Lepas Kunci) → CONFIRMED. */
  approve(input: { bookingId: string }): Promise<Booking>;
  /** Pelunasan diterima. */
  settle(input: { bookingId: string; gatewayRef: string }): Promise<Booking>;
  /** Pelanggan membatalkan → CANCELLED, refund per tier (ADR-0004). */
  cancel(input: { bookingId: string }): Promise<Booking>;
  /** Prestige membatalkan → CANCELLED, refund penuh 100% (ADR-0004). */
  cancelByOperator(input: { bookingId: string; reason?: string }): Promise<Booking>;
  /** Reschedule: pindah Periode Sewa, cek ulang Hold/Stok tanggal baru (ADR-0004). */
  reschedule(input: { bookingId: string; period: RentalPeriod }): Promise<Booking>;
  markOngoing(input: { bookingId: string }): Promise<Booking>;
  markCompleted(input: { bookingId: string }): Promise<Booking>;
  /** Apakah Mobil tersedia pada periode (Stok − aktif − Hold, termasuk Buffer). */
  checkAvailability(input: { carModelId: string; period: RentalPeriod }): Promise<boolean>;
}

export function createBookingService(deps: BookingServiceDeps): BookingService {
  // `deps` akan dipakai oleh implementasi nyata (diisi via /tdd).
  void deps;
  return {
    async createBooking() {
      throw new NotImplementedError("createBooking");
    },
    async payDp() {
      throw new NotImplementedError("payDp");
    },
    async approve() {
      throw new NotImplementedError("approve");
    },
    async settle() {
      throw new NotImplementedError("settle");
    },
    async cancel() {
      throw new NotImplementedError("cancel");
    },
    async cancelByOperator() {
      throw new NotImplementedError("cancelByOperator");
    },
    async reschedule() {
      throw new NotImplementedError("reschedule");
    },
    async markOngoing() {
      throw new NotImplementedError("markOngoing");
    },
    async markCompleted() {
      throw new NotImplementedError("markCompleted");
    },
    async checkAvailability() {
      throw new NotImplementedError("checkAvailability");
    },
  };
}

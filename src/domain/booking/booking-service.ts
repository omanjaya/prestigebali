// Booking application service — SEAM UTAMA (lihat PRD prestige-phase-1).
// Semua alur digerakkan lewat sini; logika domain hidup di balik seam ini.
//
// State machine (ADR-0001):
//
//   REQUESTED ──payDp──┬─ [CHAUFFEUR]  ─────────────► CONFIRMED
//                      └─ [SELF_DRIVE] ► AWAITING_APPROVAL ─approve─► CONFIRMED
//   REQUESTED ──hold timeout──► EXPIRED
//   {REQUESTED, AWAITING_APPROVAL, CONFIRMED} ──cancel/cancelByOperator──► CANCELLED
//   CONFIRMED ──markOngoing──► ONGOING ──markCompleted──► COMPLETED

import type { Booking, HandoverMethod, Money, RentalMode, RentalPeriod } from "./booking";
import { InvalidTransitionError, NoAvailabilityError } from "./errors";
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
  payDp(input: { bookingId: string; gatewayRef: string; amount: Money }): Promise<Booking>;
  /** Admin menyetujui Verifikasi Pengemudi (Lepas Kunci) → CONFIRMED. */
  approve(input: { bookingId: string }): Promise<Booking>;
  /** Pelunasan diterima (sisa harga sewa) sebelum serah-terima. */
  settle(input: { bookingId: string; gatewayRef: string; amount: Money }): Promise<Booking>;
  /** Pelanggan membatalkan → CANCELLED, refund per tier (ADR-0004). */
  cancel(input: { bookingId: string }): Promise<Booking>;
  /** Prestige membatalkan → CANCELLED, refund penuh 100% (ADR-0004). */
  cancelByOperator(input: { bookingId: string; reason?: string }): Promise<Booking>;
  /** Reschedule: pindah Periode Sewa, cek ulang Hold/Stok tanggal baru (ADR-0004). */
  reschedule(input: { bookingId: string; period: RentalPeriod }): Promise<Booking>;
  markOngoing(input: { bookingId: string }): Promise<Booking>;
  markCompleted(input: { bookingId: string }): Promise<Booking>;
  /** Job sweep: ubah Booking REQUESTED yang Hold-nya kedaluwarsa → EXPIRED, lepas Stok. */
  expireStaleHolds(): Promise<Booking[]>;
  /** Apakah Mobil tersedia pada periode (Stok − aktif − Hold, termasuk Buffer). */
  checkAvailability(input: { carModelId: string; period: RentalPeriod }): Promise<boolean>;
}

export function createBookingService(deps: BookingServiceDeps): BookingService {
  const { clock, repository, fleet, config, paymentGateway } = deps;
  return {
    async createBooking(cmd) {
      const now = clock.now();
      const stock = await fleet.getStock(cmd.carModelId);
      const active = await repository.countActiveForModel({
        carModelId: cmd.carModelId,
        period: cmd.period,
        now,
      });
      if (stock === null || active >= stock) {
        throw new NoAvailabilityError(`Stok habis untuk Mobil ${cmd.carModelId}`);
      }

      const holdExpiresAt = new Date(now.getTime() + config.holdTimeoutMinutes * 60_000);
      const booking: Booking = {
        id: crypto.randomUUID(),
        carModelId: cmd.carModelId,
        customerId: cmd.customerId,
        mode: cmd.mode,
        status: "REQUESTED",
        period: cmd.period,
        handoverMethod: cmd.handoverMethod,
        pickupPoint: cmd.pickupPoint,
        holdExpiresAt,
        createdAt: now,
      };
      await repository.save(booking);
      return booking;
    },
    async payDp({ bookingId, amount }) {
      const booking = await repository.findById(bookingId);
      if (!booking) throw new InvalidTransitionError(`Booking ${bookingId} tidak ditemukan`);
      // Konfirmasi bergantung Mode Sewa (ADR-0001): Pakai Sopir auto-CONFIRMED;
      // Lepas Kunci menunggu persetujuan Verifikasi Pengemudi.
      const nextStatus = booking.mode === "CHAUFFEUR" ? "CONFIRMED" : "AWAITING_APPROVAL";
      const updated: Booking = {
        ...booking,
        status: nextStatus,
        holdExpiresAt: undefined,
        dpAmount: amount,
      };
      await repository.save(updated);
      return updated;
    },
    async approve({ bookingId }) {
      const booking = await repository.findById(bookingId);
      if (!booking) throw new InvalidTransitionError(`Booking ${bookingId} tidak ditemukan`);
      if (booking.status !== "AWAITING_APPROVAL") {
        throw new InvalidTransitionError(
          `approve hanya sah dari AWAITING_APPROVAL, bukan ${booking.status}`,
        );
      }
      const updated: Booking = { ...booking, status: "CONFIRMED" };
      await repository.save(updated);
      return updated;
    },
    async settle({ bookingId, amount }) {
      const booking = await repository.findById(bookingId);
      if (!booking) throw new InvalidTransitionError(`Booking ${bookingId} tidak ditemukan`);
      if (booking.status !== "CONFIRMED") {
        throw new InvalidTransitionError(
          `settle hanya sah dari CONFIRMED, bukan ${booking.status}`,
        );
      }
      const updated: Booking = { ...booking, settlementAmount: amount };
      await repository.save(updated);
      return updated;
    },
    async cancel({ bookingId }) {
      const booking = await repository.findById(bookingId);
      if (!booking) throw new InvalidTransitionError(`Booking ${bookingId} tidak ditemukan`);
      const dp = booking.dpAmount ?? 0;
      // Tier refund berbasis jumlah hari ke tanggal mulai (ADR-0004):
      // ≥H-7 penuh (−biaya admin) · H-3..H-6 50% · ≤H-2 hangus.
      const days = Math.floor(
        (booking.period.startAt.getTime() - clock.now().getTime()) / 86_400_000,
      );
      let refundAmount: number;
      if (days >= 7) refundAmount = dp - config.refundAdminFee;
      else if (days >= 3) refundAmount = Math.floor(dp * 0.5);
      else refundAmount = 0;

      if (refundAmount > 0) {
        await paymentGateway.refund({ bookingId, amount: refundAmount });
      }
      const updated: Booking = { ...booking, status: "CANCELLED" };
      await repository.save(updated);
      return updated;
    },
    async cancelByOperator({ bookingId }) {
      const booking = await repository.findById(bookingId);
      if (!booking) throw new InvalidTransitionError(`Booking ${bookingId} tidak ditemukan`);
      // Pembatalan oleh Prestige → refund penuh 100%, tanpa memandang H-berapa (ADR-0004).
      const dp = booking.dpAmount ?? 0;
      if (dp > 0) {
        await paymentGateway.refund({ bookingId, amount: dp });
      }
      const updated: Booking = { ...booking, status: "CANCELLED" };
      await repository.save(updated);
      return updated;
    },
    async reschedule({ bookingId, period }) {
      const booking = await repository.findById(bookingId);
      if (!booking) throw new InvalidTransitionError(`Booking ${bookingId} tidak ditemukan`);
      // Cek ulang Stok pada tanggal baru (ADR-0004). Booking ini masih menempati periode
      // lamanya di repo; jika periode baru tak beririsan dengan lama, ia tak menghitung dirinya.
      const stock = await fleet.getStock(booking.carModelId);
      const active = await repository.countActiveForModel({
        carModelId: booking.carModelId,
        period,
        now: clock.now(),
      });
      if (stock === null || active >= stock) {
        throw new NoAvailabilityError(`Stok habis pada periode baru untuk ${booking.carModelId}`);
      }
      const updated: Booking = { ...booking, period }; // DP terbawa (tidak hangus)
      await repository.save(updated);
      return updated;
    },
    async markOngoing({ bookingId }) {
      const booking = await repository.findById(bookingId);
      if (!booking) throw new InvalidTransitionError(`Booking ${bookingId} tidak ditemukan`);
      if (booking.status !== "CONFIRMED") {
        throw new InvalidTransitionError(
          `markOngoing hanya sah dari CONFIRMED, bukan ${booking.status}`,
        );
      }
      const updated: Booking = { ...booking, status: "ONGOING" };
      await repository.save(updated);
      return updated;
    },
    async markCompleted({ bookingId }) {
      const booking = await repository.findById(bookingId);
      if (!booking) throw new InvalidTransitionError(`Booking ${bookingId} tidak ditemukan`);
      if (booking.status !== "ONGOING") {
        throw new InvalidTransitionError(
          `markCompleted hanya sah dari ONGOING, bukan ${booking.status}`,
        );
      }
      const updated: Booking = { ...booking, status: "COMPLETED" };
      await repository.save(updated);
      return updated;
    },
    async expireStaleHolds() {
      const stale = await repository.findExpiredHolds(clock.now());
      const expired: Booking[] = [];
      for (const booking of stale) {
        const updated: Booking = { ...booking, status: "EXPIRED", holdExpiresAt: undefined };
        await repository.save(updated);
        expired.push(updated);
      }
      return expired;
    },
    async checkAvailability({ carModelId, period }) {
      const now = clock.now();
      const stock = await fleet.getStock(carModelId);
      if (stock === null) return false;
      const active = await repository.countActiveForModel({ carModelId, period, now });
      return active < stock;
    },
  };
}

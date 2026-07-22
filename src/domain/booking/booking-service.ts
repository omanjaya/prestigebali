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
  /** Admin meng-Alokasi Unit fisik ke Booking (menjelang hari-H). Tidak memengaruhi Stok. */
  allocateUnit(input: { bookingId: string; unitId: string }): Promise<Booking>;
  /** Job sweep: ubah Booking REQUESTED yang Hold-nya kedaluwarsa → EXPIRED, lepas Stok. */
  expireStaleHolds(): Promise<Booking[]>;
  /** Apakah Mobil tersedia pada periode (Stok − aktif − Hold, termasuk Buffer). */
  checkAvailability(input: { carModelId: string; period: RentalPeriod }): Promise<boolean>;
}

/** Status "sebelum berjalan" — masih boleh dibatalkan atau di-reschedule. */
const BEFORE_RUNNING: ReadonlySet<Booking["status"]> = new Set([
  "REQUESTED",
  "AWAITING_APPROVAL",
  "CONFIRMED",
]);

/** Status yang boleh menerima Alokasi Unit — menjelang/berjalan hari-H (US 39). */
const ALLOCATABLE: ReadonlySet<Booking["status"]> = new Set(["CONFIRMED", "ONGOING"]);

/** Offset WIB (Asia/Jakarta, UTC+7) dalam milidetik. */
const WIB_OFFSET_MS = 7 * 60 * 60 * 1000;

/**
 * Indeks hari kalender WIB dari sebuah instant (jumlah hari sejak epoch, dihitung pada zona
 * Asia/Jakarta / UTC+7). Menggeser instant +7 jam lalu memotong ke tengah malam WIB.
 */
function wibDayIndex(instant: Date): number {
  return Math.floor((instant.getTime() + WIB_OFFSET_MS) / 86_400_000);
}

/**
 * Selisih HARI KALENDER WIB dari `now` ke `startAt` (ADR-0004): bandingkan tanggal kalender
 * WIB, bukan selisih milidetik mentah, agar titik potong tier konsisten pada tengah malam WIB.
 */
function wibCalendarDaysUntil(startAt: Date, now: Date): number {
  return wibDayIndex(startAt) - wibDayIndex(now);
}

export function createBookingService(deps: BookingServiceDeps): BookingService {
  const { clock, repository, fleet, config, paymentGateway, notifications } = deps;

  /**
   * Apakah Mobil punya slot pada periode: Stok ada dan (aktif + Hold) < Stok (ADR-0004).
   * `excludeBookingId` mengecualikan Booking tertentu (dipakai reschedule agar tak menghitung
   * dirinya). Satu-satunya sumber logika ketersediaan — dipakai create/check/reschedule.
   */
  async function isModelAvailable(
    carModelId: string,
    period: RentalPeriod,
    excludeBookingId?: string,
  ): Promise<boolean> {
    const stock = await fleet.getStock(carModelId);
    if (stock === null) return false;
    // Lebarkan periode dengan Buffer (CONTEXT.md) di kedua sisi: secara matematis setara
    // mewajibkan jeda `buffer` antar Booking, tanpa mengubah query overlap di repository.
    const bufferMs = (config.bufferDays ?? 0) * 86_400_000;
    const bufferedPeriod: RentalPeriod = {
      startAt: new Date(period.startAt.getTime() - bufferMs),
      endAt: new Date(period.endAt.getTime() + bufferMs),
    };
    const active = await repository.countActiveForModel({
      carModelId,
      period: bufferedPeriod,
      now: clock.now(),
      excludeBookingId,
    });
    return active < stock;
  }

  return {
    async createBooking(cmd) {
      const now = clock.now();
      if (!(await isModelAvailable(cmd.carModelId, cmd.period))) {
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
      // Notifikasi (ADR-0003): admin harus tahu ada Permintaan baru.
      await notifications.send({
        event: "BOOKING_REQUESTED",
        recipientRole: "ADMIN",
        bookingId: booking.id,
      });
      return booking;
    },
    async payDp({ bookingId, amount }) {
      const booking = await repository.findById(bookingId);
      if (!booking) throw new InvalidTransitionError(`Booking ${bookingId} tidak ditemukan`);
      // Hanya sah dari REQUESTED — cegah revive EXPIRED/CANCELLED & regres CONFIRMED
      // akibat webhook DP ganda (idempotensi minimal).
      if (booking.status !== "REQUESTED") {
        throw new InvalidTransitionError(
          `payDp hanya sah dari REQUESTED, bukan ${booking.status}`,
        );
      }
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
      // Notifikasi (ADR-0003): admin tahu DP masuk; lalu event lanjutan sesuai state hasil.
      await notifications.send({
        event: "PAYMENT_RECEIVED",
        recipientRole: "ADMIN",
        bookingId: updated.id,
      });
      if (updated.status === "AWAITING_APPROVAL") {
        await notifications.send({
          event: "AWAITING_APPROVAL",
          recipientRole: "ADMIN",
          bookingId: updated.id,
        });
      } else {
        await notifications.send({
          event: "BOOKING_CONFIRMED",
          recipientRole: "CUSTOMER",
          bookingId: updated.id,
        });
      }
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
      // Notifikasi (ADR-0003): pelanggan tahu Booking-nya dikonfirmasi.
      await notifications.send({
        event: "BOOKING_CONFIRMED",
        recipientRole: "CUSTOMER",
        bookingId: updated.id,
      });
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
      if (!BEFORE_RUNNING.has(booking.status)) {
        throw new InvalidTransitionError(
          `cancel hanya sah sebelum berjalan, bukan dari ${booking.status}`,
        );
      }
      const dp = booking.dpAmount ?? 0;
      // Tier refund berbasis jumlah HARI KALENDER WIB ke tanggal mulai (ADR-0004):
      // ≥H-7 penuh (−biaya admin) · H-3..H-6 50% · ≤H-2 hangus.
      const days = wibCalendarDaysUntil(booking.period.startAt, clock.now());
      let refundAmount: number;
      if (days >= 7) refundAmount = Math.max(0, dp - config.refundAdminFee);
      else if (days >= 3) refundAmount = Math.floor(dp * 0.5);
      else refundAmount = 0;

      if (refundAmount > 0) {
        await paymentGateway.refund({ bookingId, amount: refundAmount });
      }
      const updated: Booking = { ...booking, status: "CANCELLED" };
      await repository.save(updated);
      // Notifikasi (ADR-0003): sertakan refundAmount hasil tier agar pelanggan tahu nominalnya.
      await notifications.send({
        event: "BOOKING_CANCELLED",
        recipientRole: "CUSTOMER",
        bookingId: updated.id,
        payload: { refundAmount },
      });
      return updated;
    },
    async cancelByOperator({ bookingId }) {
      const booking = await repository.findById(bookingId);
      if (!booking) throw new InvalidTransitionError(`Booking ${bookingId} tidak ditemukan`);
      if (!BEFORE_RUNNING.has(booking.status)) {
        throw new InvalidTransitionError(
          `cancelByOperator hanya sah sebelum berjalan, bukan dari ${booking.status}`,
        );
      }
      // Pembatalan oleh Prestige → refund penuh 100%, tanpa memandang H-berapa (ADR-0004).
      const dp = booking.dpAmount ?? 0;
      if (dp > 0) {
        await paymentGateway.refund({ bookingId, amount: dp });
      }
      const updated: Booking = { ...booking, status: "CANCELLED" };
      await repository.save(updated);
      // Notifikasi (ADR-0003): pembatalan oleh Prestige → refund penuh DP.
      await notifications.send({
        event: "BOOKING_CANCELLED",
        recipientRole: "CUSTOMER",
        bookingId: updated.id,
        payload: { refundAmount: dp },
      });
      return updated;
    },
    async reschedule({ bookingId, period }) {
      const booking = await repository.findById(bookingId);
      if (!booking) throw new InvalidTransitionError(`Booking ${bookingId} tidak ditemukan`);
      if (!BEFORE_RUNNING.has(booking.status)) {
        throw new InvalidTransitionError(
          `reschedule hanya sah sebelum berjalan, bukan dari ${booking.status}`,
        );
      }
      // Cek ulang Stok pada tanggal baru (ADR-0004), kecualikan Booking ini sendiri agar
      // periode baru yang beririsan dengan periode lamanya tidak menghitung dirinya.
      if (!(await isModelAvailable(booking.carModelId, period, booking.id))) {
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
    async allocateUnit({ bookingId, unitId }) {
      const booking = await repository.findById(bookingId);
      if (!booking) throw new InvalidTransitionError(`Booking ${bookingId} tidak ditemukan`);
      // Alokasi hanya sah setelah konfirmasi, menjelang/berjalan hari-H (US 39). Boleh
      // re-alokasi (ganti Unit) berkali-kali selama status masih valid.
      if (!ALLOCATABLE.has(booking.status)) {
        throw new InvalidTransitionError(
          `allocateUnit hanya sah dari CONFIRMED/ONGOING, bukan ${booking.status}`,
        );
      }
      const updated: Booking = { ...booking, allocatedUnitId: unitId };
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
      return isModelAvailable(carModelId, period);
    },
  };
}

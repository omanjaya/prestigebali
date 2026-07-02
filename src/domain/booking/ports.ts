// Port (boundary) untuk Booking application service.
// Di-inject saat produksi (impl nyata), di-fake saat test (lihat testing/fakes.ts).
// Seluruh layanan eksternal & waktu masuk lewat sini — tidak bocor ke logika domain.

import type { Booking, Money, RentalPeriod } from "./booking";

/** Sumber waktu tunggal — di-fake agar test deterministik (timeout Hold, tier refund, Buffer). */
export interface Clock {
  now(): Date;
}

/** Payment Gateway (ADR-0002 / Midtrans). Refund untuk ADR-0004. */
export interface PaymentGateway {
  /** Buat tagihan DP; kembalikan referensi transaksi (untuk idempotensi webhook). */
  chargeDp(input: { bookingId: string; amount: Money }): Promise<{ gatewayRef: string }>;
  chargeSettlement(input: { bookingId: string; amount: Money }): Promise<{ gatewayRef: string }>;
  refund(input: { bookingId: string; amount: Money }): Promise<{ gatewayRef: string }>;
}

/** Kejadian yang memicu Notifikasi (ADR-0003). Fan-out ke kanal ada di impl. */
export type NotificationEvent =
  | "BOOKING_REQUESTED"
  | "PAYMENT_RECEIVED"
  | "AWAITING_APPROVAL"
  | "BOOKING_CONFIRMED"
  | "BOOKING_CANCELLED"
  | "MESSAGE_RECEIVED";

export interface NotificationSender {
  send(input: {
    event: NotificationEvent;
    recipientRole: "CUSTOMER" | "ADMIN";
    bookingId?: string;
    payload?: Record<string, unknown>;
  }): Promise<void>;
}

/** Persistensi Booking & perhitungan ketersediaan (Stok per model + Hold + Buffer). */
export interface BookingRepository {
  save(booking: Booking): Promise<void>;
  findById(id: string): Promise<Booking | null>;
  /**
   * Jumlah Stok terpakai untuk sebuah Mobil pada periode tertentu — menghitung Booking aktif
   * dan Hold yang belum kedaluwarsa, termasuk Buffer. Dipakai untuk cek dobel-booking.
   */
  countActiveForModel(input: {
    carModelId: string;
    period: RentalPeriod;
    now: Date;
  }): Promise<number>;
}

export interface BookingServiceDeps {
  clock: Clock;
  paymentGateway: PaymentGateway;
  notifications: NotificationSender;
  repository: BookingRepository;
}

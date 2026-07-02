// Tipe domain Booking. Murni (tanpa Prisma/Next) agar bisa diuji lewat seam + fake.
// Istilah mengikuti CONTEXT.md.

/** Uang dalam rupiah utuh (Int, tanpa desimal). */
export type Money = number;

/** Mode Sewa (CONTEXT.md). */
export type RentalMode = "SELF_DRIVE" | "CHAUFFEUR";

/** State siklus hidup Booking (ADR-0001). */
export type BookingStatus =
  | "REQUESTED"
  | "AWAITING_APPROVAL"
  | "CONFIRMED"
  | "EXPIRED"
  | "ONGOING"
  | "COMPLETED"
  | "CANCELLED";

/** Metode Serah-Terima untuk Lepas Kunci (CONTEXT.md). */
export type HandoverMethod = "PICKUP" | "DELIVERY";

/** Rentang waktu sebuah Booking (Periode Sewa). */
export interface RentalPeriod {
  startAt: Date;
  endAt: Date;
}

export interface Booking {
  id: string;
  carModelId: string;
  customerId: string;
  mode: RentalMode;
  status: BookingStatus;
  period: RentalPeriod;
  handoverMethod?: HandoverMethod;
  pickupPoint?: string;
  allocatedUnitId?: string;
  /** Kapan Hold Stok kedaluwarsa bila DP belum masuk (ADR-0001). */
  holdExpiresAt?: Date;
  /** Nominal DP yang diterima (dasar perhitungan refund, ADR-0004). */
  dpAmount?: Money;
  /** Nominal Pelunasan yang diterima sebelum serah-terima. */
  settlementAmount?: Money;
  createdAt: Date;
}

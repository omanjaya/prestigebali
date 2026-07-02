// Fake in-memory untuk keempat port — dipakai test lewat seam (PRD: Testing Decisions).
// Bukan mock berbasis implementasi; ini pengganti nyata sederhana yang bisa diamati.

import type { Booking, RentalPeriod } from "../booking";
import type {
  BookingRepository,
  CarModelReader,
  Clock,
  NotificationSender,
  PaymentGateway,
} from "../ports";

/** Clock yang bisa disetel — kendalikan waktu untuk timeout Hold, tier refund, Buffer. */
export class FakeClock implements Clock {
  private current: Date;
  constructor(start: Date) {
    this.current = start;
  }
  now(): Date {
    return this.current;
  }
  set(next: Date): void {
    this.current = next;
  }
  advanceDays(days: number): void {
    this.current = new Date(this.current.getTime() + days * 24 * 60 * 60 * 1000);
  }
  advanceMinutes(minutes: number): void {
    this.current = new Date(this.current.getTime() + minutes * 60 * 1000);
  }
}

export class FakePaymentGateway implements PaymentGateway {
  charges: Array<{ kind: string; bookingId: string; amount: number; ref: string }> = [];
  private seq = 0;
  private ref(prefix: string): string {
    this.seq += 1;
    return `${prefix}-${this.seq}`;
  }
  async chargeDp(input: { bookingId: string; amount: number }) {
    const gatewayRef = this.ref("dp");
    this.charges.push({ kind: "DP", ...input, ref: gatewayRef });
    return { gatewayRef };
  }
  async chargeSettlement(input: { bookingId: string; amount: number }) {
    const gatewayRef = this.ref("settle");
    this.charges.push({ kind: "SETTLEMENT", ...input, ref: gatewayRef });
    return { gatewayRef };
  }
  async refund(input: { bookingId: string; amount: number }) {
    const gatewayRef = this.ref("refund");
    this.charges.push({ kind: "REFUND", ...input, ref: gatewayRef });
    return { gatewayRef };
  }
}

export class FakeNotificationSender implements NotificationSender {
  sent: Array<Parameters<NotificationSender["send"]>[0]> = [];
  async send(input: Parameters<NotificationSender["send"]>[0]) {
    this.sent.push(input);
  }
}

export class FakeCarModelReader implements CarModelReader {
  private stockByModel = new Map<string, number>();
  setStock(carModelId: string, stock: number): void {
    this.stockByModel.set(carModelId, stock);
  }
  async getStock(carModelId: string): Promise<number | null> {
    return this.stockByModel.get(carModelId) ?? null;
  }
}

const ACTIVE: ReadonlySet<Booking["status"]> = new Set([
  "AWAITING_APPROVAL",
  "CONFIRMED",
  "ONGOING",
]);

function overlaps(a: RentalPeriod, b: RentalPeriod): boolean {
  return a.startAt < b.endAt && b.startAt < a.endAt;
}

export class InMemoryBookingRepository implements BookingRepository {
  private store = new Map<string, Booking>();

  async save(booking: Booking): Promise<void> {
    this.store.set(booking.id, { ...booking });
  }
  async findById(id: string): Promise<Booking | null> {
    const found = this.store.get(id);
    return found ? { ...found } : null;
  }
  /**
   * Hitung Stok terpakai untuk sebuah Mobil pada periode. Termasuk Hold yang belum
   * kedaluwarsa. Penanganan Buffer diserahkan ke implementasi/desain saat /tdd.
   */
  async countActiveForModel(input: {
    carModelId: string;
    period: RentalPeriod;
    now: Date;
    excludeBookingId?: string;
  }): Promise<number> {
    let count = 0;
    for (const b of this.store.values()) {
      if (b.carModelId !== input.carModelId) continue;
      if (input.excludeBookingId !== undefined && b.id === input.excludeBookingId) continue;
      if (!overlaps(b.period, input.period)) continue;
      const heldStillActive =
        b.status === "REQUESTED" && b.holdExpiresAt !== undefined && b.holdExpiresAt > input.now;
      if (ACTIVE.has(b.status) || heldStillActive) count += 1;
    }
    return count;
  }

  async findExpiredHolds(now: Date): Promise<Booking[]> {
    const result: Booking[] = [];
    for (const b of this.store.values()) {
      if (b.status === "REQUESTED" && b.holdExpiresAt !== undefined && b.holdExpiresAt <= now) {
        result.push({ ...b });
      }
    }
    return result;
  }
}

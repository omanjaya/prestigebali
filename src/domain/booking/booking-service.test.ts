// Test perilaku Booking application service — lewat seam + fake port.
// Ditulis vertical-slice (satu test → satu implementasi), bukan horizontal.

import { beforeEach, describe, expect, it } from "vitest";
import { createBookingService, type BookingService } from "./booking-service";
import { InvalidTransitionError, NoAvailabilityError } from "./errors";
import {
  FakeCarModelReader,
  FakeClock,
  FakeNotificationSender,
  FakePaymentGateway,
  InMemoryBookingRepository,
} from "./testing/fakes";

const NOW = new Date("2026-07-02T00:00:00.000Z");
const PERIOD = { startAt: new Date("2026-08-01T00:00:00.000Z"), endAt: new Date("2026-08-03T00:00:00.000Z") };

let clock: FakeClock;
let payments: FakePaymentGateway;
let notifications: FakeNotificationSender;
let repository: InMemoryBookingRepository;
let fleet: FakeCarModelReader;
let service: BookingService;

beforeEach(() => {
  clock = new FakeClock(NOW);
  payments = new FakePaymentGateway();
  notifications = new FakeNotificationSender();
  repository = new InMemoryBookingRepository();
  fleet = new FakeCarModelReader();
  service = createBookingService({
    clock,
    paymentGateway: payments,
    notifications,
    repository,
    fleet,
    config: { holdTimeoutMinutes: 60, refundAdminFee: 0 },
  });
});

const DP = 1_000_000;

describe("createBooking", () => {
  it("membuat Booking REQUESTED dengan Hold saat Stok tersedia", async () => {
    fleet.setStock("car-1", 1);

    const booking = await service.createBooking({
      carModelId: "car-1",
      customerId: "cust-1",
      mode: "CHAUFFEUR",
      period: PERIOD,
    });

    expect(booking.status).toBe("REQUESTED");
    // Hold kedaluwarsa 60 menit setelah waktu sekarang (config holdTimeoutMinutes: 60).
    expect(booking.holdExpiresAt?.toISOString()).toBe("2026-07-02T01:00:00.000Z");

    const stored = await repository.findById(booking.id);
    expect(stored?.status).toBe("REQUESTED");
  });

  it("menolak dengan NoAvailabilityError saat Stok habis (Hold aktif memakai slot)", async () => {
    fleet.setStock("car-1", 1);
    await service.createBooking({
      carModelId: "car-1",
      customerId: "cust-1",
      mode: "CHAUFFEUR",
      period: PERIOD,
    });

    await expect(
      service.createBooking({
        carModelId: "car-1",
        customerId: "cust-2",
        mode: "CHAUFFEUR",
        period: PERIOD,
      }),
    ).rejects.toThrow(NoAvailabilityError);
  });
});

describe("checkAvailability", () => {
  it("true saat masih ada Stok, false saat semua slot terpakai", async () => {
    fleet.setStock("car-1", 2);

    expect(await service.checkAvailability({ carModelId: "car-1", period: PERIOD })).toBe(true);

    await service.createBooking({ carModelId: "car-1", customerId: "a", mode: "CHAUFFEUR", period: PERIOD });
    expect(await service.checkAvailability({ carModelId: "car-1", period: PERIOD })).toBe(true);

    await service.createBooking({ carModelId: "car-1", customerId: "b", mode: "CHAUFFEUR", period: PERIOD });
    expect(await service.checkAvailability({ carModelId: "car-1", period: PERIOD })).toBe(false);
  });
});

async function createChauffeurBooking() {
  fleet.setStock("car-1", 1);
  return service.createBooking({ carModelId: "car-1", customerId: "cust-1", mode: "CHAUFFEUR", period: PERIOD });
}

describe("payDp", () => {
  it("Pakai Sopir langsung CONFIRMED saat DP diterima (ADR-0001)", async () => {
    const booking = await createChauffeurBooking();

    const paid = await service.payDp({ bookingId: booking.id, gatewayRef: "dp-abc", amount: DP });

    expect(paid.status).toBe("CONFIRMED");
    const stored = await repository.findById(booking.id);
    expect(stored?.status).toBe("CONFIRMED");
  });

  it("Lepas Kunci masuk AWAITING_APPROVAL saat DP diterima (butuh verifikasi admin)", async () => {
    fleet.setStock("car-1", 1);
    const booking = await service.createBooking({
      carModelId: "car-1",
      customerId: "cust-1",
      mode: "SELF_DRIVE",
      period: PERIOD,
    });

    const paid = await service.payDp({ bookingId: booking.id, gatewayRef: "dp-xyz", amount: DP });

    expect(paid.status).toBe("AWAITING_APPROVAL");
  });
});

describe("approve", () => {
  it("admin menyetujui Lepas Kunci: AWAITING_APPROVAL → CONFIRMED", async () => {
    fleet.setStock("car-1", 1);
    const booking = await service.createBooking({
      carModelId: "car-1",
      customerId: "cust-1",
      mode: "SELF_DRIVE",
      period: PERIOD,
    });
    await service.payDp({ bookingId: booking.id, gatewayRef: "dp-1", amount: DP });

    const approved = await service.approve({ bookingId: booking.id });

    expect(approved.status).toBe("CONFIRMED");
    const stored = await repository.findById(booking.id);
    expect(stored?.status).toBe("CONFIRMED");
  });

  it("menolak approve bila Booking belum AWAITING_APPROVAL", async () => {
    const booking = await createChauffeurBooking(); // REQUESTED
    await expect(service.approve({ bookingId: booking.id })).rejects.toThrow(InvalidTransitionError);
  });
});

describe("expireStaleHolds", () => {
  it("Hold yang lewat timeout menjadi EXPIRED dan Stok dilepas kembali", async () => {
    const booking = await createChauffeurBooking(); // Hold 60 menit
    clock.advanceMinutes(61);

    const expired = await service.expireStaleHolds();

    expect(expired.map((b) => b.id)).toContain(booking.id);
    const stored = await repository.findById(booking.id);
    expect(stored?.status).toBe("EXPIRED");
    // Stok kembali tersedia setelah Hold dilepas.
    expect(await service.checkAvailability({ carModelId: "car-1", period: PERIOD })).toBe(true);
  });

  it("tidak menyentuh Hold yang belum timeout", async () => {
    await createChauffeurBooking();
    clock.advanceMinutes(59);

    const expired = await service.expireStaleHolds();

    expect(expired).toHaveLength(0);
  });
});

async function confirmedChauffeur(amount = DP) {
  const booking = await createChauffeurBooking();
  return service.payDp({ bookingId: booking.id, gatewayRef: "dp", amount });
}

function refunds() {
  return payments.charges.filter((c) => c.kind === "REFUND");
}

describe("cancel — refund tier (ADR-0004)", () => {
  it("≥H-7: refund penuh dikurangi biaya admin, Booking CANCELLED", async () => {
    // NOW=2026-07-02, mulai=2026-08-01 → 30 hari sebelum → tier penuh.
    const booking = await confirmedChauffeur();

    const cancelled = await service.cancel({ bookingId: booking.id });

    expect(cancelled.status).toBe("CANCELLED");
    expect(refunds()).toHaveLength(1);
    expect(refunds()[0]?.amount).toBe(DP); // refundAdminFee = 0
  });

  it("H-3 s/d H-6: refund 50%", async () => {
    const booking = await confirmedChauffeur();
    clock.set(new Date("2026-07-27T00:00:00.000Z")); // 5 hari sebelum mulai

    await service.cancel({ bookingId: booking.id });

    expect(refunds()[0]?.amount).toBe(DP / 2);
  });

  it("≤H-2: DP hangus (tidak ada refund), tetap CANCELLED", async () => {
    const booking = await confirmedChauffeur();
    clock.set(new Date("2026-07-31T00:00:00.000Z")); // 1 hari sebelum mulai

    const cancelled = await service.cancel({ bookingId: booking.id });

    expect(cancelled.status).toBe("CANCELLED");
    expect(refunds()).toHaveLength(0);
  });
});

describe("cancelByOperator (ADR-0004)", () => {
  it("refund penuh 100% walau mepet (≤H-2), Booking CANCELLED", async () => {
    const booking = await confirmedChauffeur();
    clock.set(new Date("2026-07-31T00:00:00.000Z")); // H-1: cancel pelanggan = 0, tapi ini operator

    const cancelled = await service.cancelByOperator({ bookingId: booking.id, reason: "Unit rusak" });

    expect(cancelled.status).toBe("CANCELLED");
    expect(refunds()).toHaveLength(1);
    expect(refunds()[0]?.amount).toBe(DP); // 100%, tanpa potong biaya admin
  });
});

describe("reschedule (ADR-0004)", () => {
  const NEW_PERIOD = {
    startAt: new Date("2026-09-01T00:00:00.000Z"),
    endAt: new Date("2026-09-03T00:00:00.000Z"),
  };

  it("pindah ke periode tersedia: periode berubah, tetap CONFIRMED, DP terbawa", async () => {
    const booking = await confirmedChauffeur();

    const moved = await service.reschedule({ bookingId: booking.id, period: NEW_PERIOD });

    expect(moved.status).toBe("CONFIRMED");
    expect(moved.period.startAt.toISOString()).toBe("2026-09-01T00:00:00.000Z");
    expect(moved.dpAmount).toBe(DP); // DP tidak hangus
    const stored = await repository.findById(booking.id);
    expect(stored?.period.startAt.toISOString()).toBe("2026-09-01T00:00:00.000Z");
  });

  it("menolak bila periode baru penuh", async () => {
    const booking = await confirmedChauffeur(); // Stok car-1 = 1, dipakai Agustus
    // Booking lain (Mobil sama) menempati periode September → Stok habis di sana.
    await service.createBooking({ carModelId: "car-1", customerId: "x", mode: "CHAUFFEUR", period: NEW_PERIOD });

    await expect(
      service.reschedule({ bookingId: booking.id, period: NEW_PERIOD }),
    ).rejects.toThrow(NoAvailabilityError);
  });
});

describe("settle (Pelunasan)", () => {
  it("mencatat Pelunasan pada Booking CONFIRMED, status tetap CONFIRMED", async () => {
    const booking = await confirmedChauffeur();

    const settled = await service.settle({ bookingId: booking.id, gatewayRef: "s1", amount: 3_000_000 });

    expect(settled.status).toBe("CONFIRMED");
    expect(settled.settlementAmount).toBe(3_000_000);
  });

  it("menolak settle bila Booking belum CONFIRMED", async () => {
    const booking = await createChauffeurBooking(); // REQUESTED
    await expect(
      service.settle({ bookingId: booking.id, gatewayRef: "s", amount: 1 }),
    ).rejects.toThrow(InvalidTransitionError);
  });
});

describe("markOngoing / markCompleted", () => {
  it("CONFIRMED → ONGOING → COMPLETED", async () => {
    const booking = await confirmedChauffeur();

    const ongoing = await service.markOngoing({ bookingId: booking.id });
    expect(ongoing.status).toBe("ONGOING");

    const completed = await service.markCompleted({ bookingId: booking.id });
    expect(completed.status).toBe("COMPLETED");
  });

  it("markOngoing menolak bila belum CONFIRMED", async () => {
    const booking = await createChauffeurBooking(); // REQUESTED
    await expect(service.markOngoing({ bookingId: booking.id })).rejects.toThrow(
      InvalidTransitionError,
    );
  });

  it("markCompleted menolak bila belum ONGOING", async () => {
    const booking = await confirmedChauffeur(); // CONFIRMED
    await expect(service.markCompleted({ bookingId: booking.id })).rejects.toThrow(
      InvalidTransitionError,
    );
  });
});

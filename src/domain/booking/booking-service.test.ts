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

  it("menolak payDp bila Booking bukan REQUESTED (cegah revive/regress)", async () => {
    const booking = await confirmedChauffeur(); // sudah CONFIRMED
    await expect(
      service.payDp({ bookingId: booking.id, gatewayRef: "dup", amount: DP }),
    ).rejects.toThrow(InvalidTransitionError);
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

  it("≥H-7 pakai batas hari kalender WIB (bukan selisih milidetik) di titik potong", async () => {
    // startAt 2026-08-01 00:00 WIB (= 2026-07-31T17:00Z); cancel 2026-07-25 01:00 WIB (= 2026-07-24T18:00Z).
    // Selisih 7 hari kalender WIB → tier penuh. Selisih milidetik lama = 6h23j → floor 6 → keliru 50%.
    const period = {
      startAt: new Date("2026-07-31T17:00:00.000Z"),
      endAt: new Date("2026-08-02T17:00:00.000Z"),
    };
    fleet.setStock("car-1", 1);
    const booking = await service.createBooking({
      carModelId: "car-1",
      customerId: "cust-1",
      mode: "CHAUFFEUR",
      period,
    });
    await service.payDp({ bookingId: booking.id, gatewayRef: "dp", amount: DP });

    clock.set(new Date("2026-07-24T18:00:00.000Z"));
    await service.cancel({ bookingId: booking.id });

    expect(refunds()).toHaveLength(1);
    expect(refunds()[0]?.amount).toBe(DP); // refundAdminFee = 0 → refund penuh, bukan 50%
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

  it("menolak cancel dua kali — tidak ada refund ganda", async () => {
    const booking = await confirmedChauffeur(); // ≥H-7 → refund penuh sekali
    await service.cancel({ bookingId: booking.id });

    await expect(service.cancel({ bookingId: booking.id })).rejects.toThrow(InvalidTransitionError);
    expect(refunds()).toHaveLength(1); // tetap satu refund
  });

  it("tidak pernah refund negatif walau biaya admin > DP (≥H-7)", async () => {
    const svc = createBookingService({
      clock,
      paymentGateway: payments,
      notifications,
      repository,
      fleet,
      config: { holdTimeoutMinutes: 60, refundAdminFee: 5_000_000 }, // > DP (1jt)
    });
    fleet.setStock("car-1", 1);
    const booking = await svc.createBooking({
      carModelId: "car-1",
      customerId: "c",
      mode: "CHAUFFEUR",
      period: PERIOD,
    });
    await svc.payDp({ bookingId: booking.id, gatewayRef: "d", amount: DP });

    await svc.cancel({ bookingId: booking.id }); // dp − fee = negatif

    expect(refunds()).toHaveLength(0); // tidak ada refund negatif
  });

  it("menolak cancel Booking yang sudah COMPLETED", async () => {
    const booking = await confirmedChauffeur();
    await service.markOngoing({ bookingId: booking.id });
    await service.markCompleted({ bookingId: booking.id });

    await expect(service.cancel({ bookingId: booking.id })).rejects.toThrow(InvalidTransitionError);
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

  it("menolak cancelByOperator bila Booking sudah CANCELLED", async () => {
    const booking = await confirmedChauffeur();
    await service.cancel({ bookingId: booking.id });

    await expect(
      service.cancelByOperator({ bookingId: booking.id }),
    ).rejects.toThrow(InvalidTransitionError);
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

  it("boleh reschedule ke periode yang beririsan dengan periode lamanya sendiri", async () => {
    const booking = await confirmedChauffeur(); // Agustus 1–3, Stok car-1 = 1
    const overlap = {
      startAt: new Date("2026-08-02T00:00:00.000Z"),
      endAt: new Date("2026-08-04T00:00:00.000Z"),
    };

    const moved = await service.reschedule({ bookingId: booking.id, period: overlap });

    expect(moved.period.startAt.toISOString()).toBe("2026-08-02T00:00:00.000Z");
  });

  it("menolak reschedule Booking yang sudah CANCELLED", async () => {
    const booking = await confirmedChauffeur();
    await service.cancel({ bookingId: booking.id });

    await expect(
      service.reschedule({ bookingId: booking.id, period: NEW_PERIOD }),
    ).rejects.toThrow(InvalidTransitionError);
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

describe("Notifikasi (ADR-0003)", () => {
  it("createBooking mengirim BOOKING_REQUESTED ke ADMIN dengan bookingId", async () => {
    const booking = await createChauffeurBooking();

    expect(notifications.sent).toContainEqual(
      expect.objectContaining({
        event: "BOOKING_REQUESTED",
        recipientRole: "ADMIN",
        bookingId: booking.id,
      }),
    );
  });

  it("payDp Pakai Sopir: PAYMENT_RECEIVED ke ADMIN + BOOKING_CONFIRMED ke CUSTOMER", async () => {
    const booking = await createChauffeurBooking();
    notifications.sent.length = 0; // abaikan notifikasi createBooking

    await service.payDp({ bookingId: booking.id, gatewayRef: "dp-1", amount: DP });

    expect(notifications.sent).toContainEqual(
      expect.objectContaining({
        event: "PAYMENT_RECEIVED",
        recipientRole: "ADMIN",
        bookingId: booking.id,
      }),
    );
    expect(notifications.sent).toContainEqual(
      expect.objectContaining({
        event: "BOOKING_CONFIRMED",
        recipientRole: "CUSTOMER",
        bookingId: booking.id,
      }),
    );
    expect(notifications.sent).toHaveLength(2);
  });

  it("payDp Lepas Kunci: PAYMENT_RECEIVED + AWAITING_APPROVAL ke ADMIN (belum CONFIRMED)", async () => {
    fleet.setStock("car-1", 1);
    const booking = await service.createBooking({
      carModelId: "car-1",
      customerId: "cust-1",
      mode: "SELF_DRIVE",
      period: PERIOD,
    });
    notifications.sent.length = 0;

    await service.payDp({ bookingId: booking.id, gatewayRef: "dp-2", amount: DP });

    expect(notifications.sent).toContainEqual(
      expect.objectContaining({
        event: "PAYMENT_RECEIVED",
        recipientRole: "ADMIN",
        bookingId: booking.id,
      }),
    );
    expect(notifications.sent).toContainEqual(
      expect.objectContaining({
        event: "AWAITING_APPROVAL",
        recipientRole: "ADMIN",
        bookingId: booking.id,
      }),
    );
    // Belum ada BOOKING_CONFIRMED — Lepas Kunci menunggu approve.
    expect(
      notifications.sent.filter((n) => n.event === "BOOKING_CONFIRMED"),
    ).toHaveLength(0);
  });

  it("approve mengirim BOOKING_CONFIRMED ke CUSTOMER", async () => {
    fleet.setStock("car-1", 1);
    const booking = await service.createBooking({
      carModelId: "car-1",
      customerId: "cust-1",
      mode: "SELF_DRIVE",
      period: PERIOD,
    });
    await service.payDp({ bookingId: booking.id, gatewayRef: "dp-3", amount: DP });
    notifications.sent.length = 0;

    await service.approve({ bookingId: booking.id });

    expect(notifications.sent).toContainEqual(
      expect.objectContaining({
        event: "BOOKING_CONFIRMED",
        recipientRole: "CUSTOMER",
        bookingId: booking.id,
      }),
    );
  });

  it("cancel mengirim BOOKING_CANCELLED ke CUSTOMER dengan refundAmount di payload", async () => {
    const booking = await confirmedChauffeur(); // ≥H-7 → refund penuh (fee 0)
    notifications.sent.length = 0;

    await service.cancel({ bookingId: booking.id });

    expect(notifications.sent).toContainEqual(
      expect.objectContaining({
        event: "BOOKING_CANCELLED",
        recipientRole: "CUSTOMER",
        bookingId: booking.id,
        payload: expect.objectContaining({ refundAmount: DP }),
      }),
    );
  });
});

describe("allocateUnit (US 39 — Alokasi Unit)", () => {
  it("dari CONFIRMED: sukses set allocatedUnitId, status tidak berubah", async () => {
    const booking = await confirmedChauffeur();

    const allocated = await service.allocateUnit({ bookingId: booking.id, unitId: "unit-1" });

    expect(allocated.status).toBe("CONFIRMED");
    expect(allocated.allocatedUnitId).toBe("unit-1");
    const stored = await repository.findById(booking.id);
    expect(stored?.allocatedUnitId).toBe("unit-1");
  });

  it("dari ONGOING: sukses (re-alokasi juga sah)", async () => {
    const booking = await confirmedChauffeur();
    await service.allocateUnit({ bookingId: booking.id, unitId: "unit-1" });
    await service.markOngoing({ bookingId: booking.id });

    const reallocated = await service.allocateUnit({ bookingId: booking.id, unitId: "unit-2" });

    expect(reallocated.status).toBe("ONGOING");
    expect(reallocated.allocatedUnitId).toBe("unit-2");
  });

  it("menolak allocateUnit dari REQUESTED (belum konfirmasi)", async () => {
    const booking = await createChauffeurBooking(); // REQUESTED

    await expect(
      service.allocateUnit({ bookingId: booking.id, unitId: "unit-1" }),
    ).rejects.toThrow(InvalidTransitionError);
  });
});

describe("Buffer (US 47) — jeda wajib antar Booking pada perhitungan ketersediaan", () => {
  it("Booking back-to-back (mulai tepat setelah endAt Booking lain) DITOLAK dengan bufferDays: 1", async () => {
    const svc = createBookingService({
      clock,
      paymentGateway: payments,
      notifications,
      repository,
      fleet,
      config: { holdTimeoutMinutes: 60, refundAdminFee: 0, bufferDays: 1 },
    });
    fleet.setStock("car-1", 1);
    await svc.createBooking({ carModelId: "car-1", customerId: "a", mode: "CHAUFFEUR", period: PERIOD });

    // Mulai tepat pada endAt Booking pertama (back-to-back, tanpa jeda).
    const backToBack = { startAt: PERIOD.endAt, endAt: new Date(PERIOD.endAt.getTime() + 86_400_000) };

    await expect(
      svc.createBooking({ carModelId: "car-1", customerId: "b", mode: "CHAUFFEUR", period: backToBack }),
    ).rejects.toThrow(NoAvailabilityError);
  });

  it("Booking back-to-back yang SAMA diterima dengan bufferDays: 0 (config default test)", async () => {
    fleet.setStock("car-1", 1);
    await service.createBooking({ carModelId: "car-1", customerId: "a", mode: "CHAUFFEUR", period: PERIOD });

    const backToBack = { startAt: PERIOD.endAt, endAt: new Date(PERIOD.endAt.getTime() + 86_400_000) };

    const booking = await service.createBooking({
      carModelId: "car-1",
      customerId: "b",
      mode: "CHAUFFEUR",
      period: backToBack,
    });
    expect(booking.status).toBe("REQUESTED");
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

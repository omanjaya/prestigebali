// Test INTEGRASI melawan Postgres nyata (adapter Prisma + service, tanpa fake repo).
// Di-gate env DB_SMOKE agar `npm test` biasa tetap hijau tanpa DB:
//   DB_SMOKE=1 npx vitest run src/domain/booking/db-integration.test.ts
// Prasyarat: docker compose up -d, prisma migrate, prisma/seed.mjs (butuh Mobil ferrari-488).

import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { prisma } from "@/lib/prisma";
import { createBookingService, type BookingService } from "./booking-service";
import { NoAvailabilityError } from "./errors";
import { PrismaBookingRepository } from "@/infra/prisma/prisma-booking-repository";
import { PrismaCarModelReader } from "@/infra/prisma/prisma-car-model-reader";
import { FakeNotificationSender, FakePaymentGateway } from "./testing/fakes";

const PERIOD = {
  startAt: new Date("2026-10-01T00:00:00.000Z"),
  endAt: new Date("2026-10-03T00:00:00.000Z"),
};

describe.skipIf(!process.env.DB_SMOKE)("integrasi DB (Prisma + Postgres nyata)", () => {
  let service: BookingService;
  let customerId: string;

  beforeAll(async () => {
    const customer = await prisma.account.create({
      data: { role: "CUSTOMER", name: "Integrasi Test", phone: `08${Date.now()}` },
    });
    customerId = customer.id;
    service = createBookingService({
      clock: { now: () => new Date() },
      paymentGateway: new FakePaymentGateway(),
      notifications: new FakeNotificationSender(),
      repository: new PrismaBookingRepository(),
      fleet: new PrismaCarModelReader(),
      config: { holdTimeoutMinutes: 60, refundAdminFee: 0 },
    });
  });

  afterAll(async () => {
    await prisma.booking.deleteMany({ where: { customerId } });
    await prisma.account.delete({ where: { id: customerId } });
    await prisma.$disconnect();
  });

  it("createBooking menulis Booking REQUESTED + Hold ke Postgres", async () => {
    const booking = await service.createBooking({
      carModelId: "ferrari-488",
      customerId,
      mode: "CHAUFFEUR",
      period: PERIOD,
    });

    expect(booking.status).toBe("REQUESTED");
    const row = await prisma.booking.findUnique({ where: { id: booking.id } });
    expect(row?.status).toBe("REQUESTED");
    expect(row?.holdExpiresAt).not.toBeNull();
  });

  it("dobel-booking ditolak oleh query overlap SQL nyata (Stok ferrari = 1)", async () => {
    await expect(
      service.createBooking({
        carModelId: "ferrari-488",
        customerId,
        mode: "CHAUFFEUR",
        period: { startAt: new Date("2026-10-02T00:00:00.000Z"), endAt: new Date("2026-10-04T00:00:00.000Z") },
      }),
    ).rejects.toThrow(NoAvailabilityError);
  });

  it("guest auto-account: upsert idempoten per nomor HP", async () => {
    const { resolveCustomerAccountId } = await import("@/server/customer-account");
    const phone = `08999${Date.now()}`;

    const first = await resolveCustomerAccountId({ name: "Guest Baru", phone });
    const second = await resolveCustomerAccountId({ name: "Guest Baru", phone });

    expect(first).toBe(second); // tidak membuat akun ganda
    const row = await prisma.account.findUnique({ where: { phone } });
    expect(row?.role).toBe("CUSTOMER");
    await prisma.account.delete({ where: { phone } });
  });

  it("payDp CHAUFFEUR → CONFIRMED tersimpan di Postgres", async () => {
    const bookings = await prisma.booking.findMany({ where: { customerId, status: "REQUESTED" } });
    const target = bookings[0];
    expect(target).toBeDefined();

    const paid = await service.payDp({ bookingId: target!.id, gatewayRef: "int-dp", amount: 3_000_000 });

    expect(paid.status).toBe("CONFIRMED");
    const row = await prisma.booking.findUnique({ where: { id: target!.id } });
    expect(row?.status).toBe("CONFIRMED");
    expect(row?.dpAmount).toBe(3_000_000);
  });
});

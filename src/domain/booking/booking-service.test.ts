// Smoke test scaffold — membuktikan seam + fake + toolchain test jalan.
// /tdd akan MENGGANTI ini dengan test perilaku sesungguhnya (red-green-refactor):
// dobel-booking, timeout Hold → EXPIRED, Buffer, auto-CONFIRMED vs approve,
// tier refund, refund operator 100%, reschedule, idempotensi webhook.

import { describe, expect, it } from "vitest";
import { createBookingService } from "./booking-service";
import { NotImplementedError } from "./errors";
import {
  FakeClock,
  FakeNotificationSender,
  FakePaymentGateway,
  InMemoryBookingRepository,
} from "./testing/fakes";

function makeService() {
  return createBookingService({
    clock: new FakeClock(new Date("2026-07-02T00:00:00Z")),
    paymentGateway: new FakePaymentGateway(),
    notifications: new FakeNotificationSender(),
    repository: new InMemoryBookingRepository(),
  });
}

describe("Booking application service (seam)", () => {
  it("dapat dikonstruksi lewat factory + fake ports", () => {
    const service = makeService();
    expect(service).toBeDefined();
    expect(typeof service.createBooking).toBe("function");
  });

  it("metode masih stub (diisi via /tdd)", async () => {
    const service = makeService();
    await expect(
      service.createBooking({
        carModelId: "car-1",
        customerId: "cust-1",
        mode: "CHAUFFEUR",
        period: { startAt: new Date("2026-08-01"), endAt: new Date("2026-08-02") },
      }),
    ).rejects.toBeInstanceOf(NotImplementedError);
  });
});

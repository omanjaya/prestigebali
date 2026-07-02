// Composition root — merangkai Booking application service dengan adapter infrastruktur nyata.
// Ini satu-satunya tempat impl konkret bertemu port domain; sisa aplikasi cukup memanggil
// getBookingService(). Instance di-cache (singleton modul) agar tidak membangun ulang adapter
// pada tiap panggilan, mengikuti pola singleton di src/lib/prisma.ts.

import { createBookingService } from "@/domain/booking/booking-service";
import type { BookingService } from "@/domain/booking/booking-service";
import type { BookingServiceDeps } from "@/domain/booking/ports";
import { systemClock } from "@/infra/system-clock";
import { PrismaBookingRepository } from "@/infra/prisma/prisma-booking-repository";
import { PrismaCarModelReader } from "@/infra/prisma/prisma-car-model-reader";
import { createMidtransPaymentGateway } from "@/infra/midtrans/midtrans-payment-gateway";
import { createNotificationSenderFromEnv } from "@/infra/notifications/multi-channel-notification-sender";

let cachedService: BookingService | undefined;

export function getBookingService(): BookingService {
  if (cachedService) return cachedService;

  const deps: BookingServiceDeps = {
    clock: systemClock,
    repository: new PrismaBookingRepository(),
    fleet: new PrismaCarModelReader(),
    paymentGateway: createMidtransPaymentGateway(),
    notifications: createNotificationSenderFromEnv(),
    config: {
      holdTimeoutMinutes: Number(process.env.HOLD_TIMEOUT_MINUTES ?? 60),
      refundAdminFee: Number(process.env.REFUND_ADMIN_FEE ?? 0),
    },
  };

  cachedService = createBookingService(deps);
  return cachedService;
}

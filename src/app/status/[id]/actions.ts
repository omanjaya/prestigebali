"use server";

// Server Action pembayaran PROTOTIPE (tanpa Midtrans).
//
// Meniru pola idempotensi webhook Midtrans (`src/app/api/webhooks/payment/route.ts`):
// mensimulasikan dana "langsung diterima" begitu pelanggan menekan tombol Pay Deposit /
// Pay Balance di halaman status, tanpa menghubungi gateway sama sekali. `gatewayRef`
// dibuat dengan konvensi IDENTIK (`${bookingId}-DP` / `${bookingId}-SETTLEMENT` /
// `${bookingId}-DEPOSIT`) supaya, bila webhook Midtrans sungguhan menyusul kelak, ia
// tetap ter-dedup lewat unique constraint `Payment.gatewayRef` (P2002) — bukan
// double-charge.
//
// Nominal DIHITUNG DI SERVER via quoteBooking (tidak percaya angka dari client), dengan
// `securityDeposit`/`discountIdr` diambil dari SNAPSHOT Booking (promoCode/discountAmount/
// depositAmount) — bukan promo/tarif TERKINI — supaya konsisten dengan yang ditampilkan
// saat Booking dibuat (fitur #1/#2).

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { getBooking, saveDriverVerification } from "@/lib/bookings";
import { getCarModel } from "@/lib/catalog";
import { quoteBooking } from "@/lib/pricing";
import { getBookingService } from "@/server/booking-container";
import { InvalidTransitionError, NoAvailabilityError } from "@/domain/booking/errors";
import { appendMessageToBooking } from "@/lib/conversations";
import { getT } from "@/i18n/server";
import { bookingMessages } from "@/i18n/messages/booking";

type PayIntent = "DP" | "SETTLEMENT";

function isDuplicateKeyError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    (error as { code?: unknown }).code === "P2002"
  );
}

export async function payBookingAction(formData: FormData): Promise<void> {
  const bookingId = String(formData.get("bookingId") ?? "");
  const intent = String(formData.get("intent") ?? "") as PayIntent;
  if (!bookingId || (intent !== "DP" && intent !== "SETTLEMENT")) return;

  const booking = await getBooking(bookingId);
  if (!booking) return;

  const car = await getCarModel(booking.carModelId);
  const q = quoteBooking({
    mode: booking.mode,
    dailyRate: car?.dailyRate ?? null,
    chauffeurPackage: car?.chauffeurPackage ?? null,
    startAt: booking.startAt,
    endAt: booking.endAt,
    securityDeposit: booking.depositAmount ?? car?.securityDeposit ?? null,
    discountIdr: booking.discountAmount ?? null,
  });

  const bookingService = getBookingService();

  if (intent === "DP") {
    const dpRef = `${bookingId}-DP`;
    // Baris Payment "DP" — P2002 diabaikan (idempoten per gatewayRef).
    try {
      await prisma.payment.create({
        data: { bookingId, kind: "DP", amount: q.dp, status: "PAID", gatewayRef: dpRef },
      });
    } catch (error) {
      if (!isDuplicateKeyError(error)) throw error;
    }

    // Deposit jaminan (fitur #2) — baris Payment terpisah "DEPOSIT", hanya bila
    // berlaku (SELF_DRIVE + securityDeposit > 0). payDp TETAP dipanggil dengan
    // q.dp SAJA (dpAmount = murni DP sewa, tidak tercampur deposit).
    if (q.deposit > 0) {
      const depositRef = `${bookingId}-DEPOSIT`;
      try {
        await prisma.payment.create({
          data: {
            bookingId,
            kind: "DEPOSIT",
            amount: q.deposit,
            status: "PAID",
            gatewayRef: depositRef,
          },
        });
      } catch (error) {
        if (!isDuplicateKeyError(error)) throw error;
      }
    }

    try {
      await bookingService.payDp({ bookingId, gatewayRef: dpRef, amount: q.dp });
    } catch (error) {
      // Status Booking sudah maju duluan (mis. double-submit) → abaikan, bukan error fatal.
      if (!(error instanceof InvalidTransitionError)) throw error;
    }
  } else {
    const gatewayRef = `${bookingId}-SETTLEMENT`;
    try {
      await prisma.payment.create({
        data: { bookingId, kind: "SETTLEMENT", amount: q.balance, status: "PAID", gatewayRef },
      });
    } catch (error) {
      if (isDuplicateKeyError(error)) {
        revalidatePath(`/status/${bookingId}`);
        return;
      }
      throw error;
    }

    try {
      await bookingService.settle({ bookingId, gatewayRef, amount: q.balance });
    } catch (error) {
      if (!(error instanceof InvalidTransitionError)) throw error;
    }
  }

  revalidatePath(`/status/${bookingId}`);
}

// ---------------------------------------------------------------------------
// Verifikasi Pengemudi (US 19) — hanya relevan untuk SELF_DRIVE. Prototipe: cukup
// nomor SIM/KTP, tanpa unggah berkas. Menandai `verificationSubmittedAt` agar admin
// tahu data siap ditinjau.
// ---------------------------------------------------------------------------
export async function submitVerificationAction(formData: FormData): Promise<void> {
  const bookingId = String(formData.get("bookingId") ?? "");
  const licenseName = String(formData.get("licenseName") ?? "").trim();
  const licenseNumber = String(formData.get("licenseNumber") ?? "").trim();
  const ktpNumber = String(formData.get("ktpNumber") ?? "").trim();

  if (!bookingId || !licenseName || !licenseNumber || !ktpNumber) return;

  await saveDriverVerification({ bookingId, licenseName, licenseNumber, ktpNumber });
  revalidatePath(`/status/${bookingId}`);
}

// ---------------------------------------------------------------------------
// Batalkan Booking (US 24-26) — refund tier dihitung di dalam BookingService
// (ADR-0004); di sini kita hanya memicu transisi lewat seam service.
// ---------------------------------------------------------------------------
export async function cancelAction(formData: FormData): Promise<void> {
  const bookingId = String(formData.get("bookingId") ?? "");
  if (!bookingId) return;

  const bookingService = getBookingService();
  try {
    await bookingService.cancel({ bookingId });
  } catch (error) {
    // Sudah di status terminal / tidak sah lagi dibatalkan (mis. double-submit) → abaikan.
    if (!(error instanceof InvalidTransitionError)) throw error;
  }

  revalidatePath(`/status/${bookingId}`);
}

// ---------------------------------------------------------------------------
// Reschedule (US 27-28) — dipakai lewat useActionState di reschedule-form.tsx agar
// pesan error NoAvailabilityError bisa ditampilkan tanpa dialog confirm()/searchParams.
// ---------------------------------------------------------------------------
export type RescheduleState = { error?: string };

export async function rescheduleAction(
  _prevState: RescheduleState,
  formData: FormData,
): Promise<RescheduleState> {
  const { t } = await getT(bookingMessages);
  const bookingId = String(formData.get("bookingId") ?? "");
  const startAtRaw = String(formData.get("startAt") ?? "");
  const endAtRaw = String(formData.get("endAt") ?? "");

  if (!bookingId || !startAtRaw || !endAtRaw) {
    return { error: t("booking.status.reschedule.error.incomplete") };
  }

  const startAt = new Date(startAtRaw);
  const endAt = new Date(endAtRaw);
  if (Number.isNaN(startAt.getTime()) || Number.isNaN(endAt.getTime()) || endAt <= startAt) {
    return { error: t("booking.status.reschedule.error.invalidRange") };
  }

  try {
    await getBookingService().reschedule({ bookingId, period: { startAt, endAt } });
  } catch (error) {
    if (error instanceof NoAvailabilityError) {
      return { error: t("booking.status.reschedule.error.noAvailability") };
    }
    if (error instanceof InvalidTransitionError) {
      return { error: t("booking.status.reschedule.error.invalidTransition") };
    }
    throw error;
  }

  revalidatePath(`/status/${bookingId}`);
  return {};
}

// ---------------------------------------------------------------------------
// Chat widget pelanggan (US 30-33) — pesan pelanggan ditambahkan ke Percakapan yang
// terikat Booking; refresh halaman via revalidatePath (polling sederhana, bukan websocket).
// ---------------------------------------------------------------------------
export async function sendMessageAction(formData: FormData): Promise<void> {
  const bookingId = String(formData.get("bookingId") ?? "");
  const body = String(formData.get("body") ?? "").trim();
  if (!bookingId || !body) return;

  await appendMessageToBooking({ bookingId, senderRole: "CUSTOMER", body });
  revalidatePath(`/status/${bookingId}`);
}

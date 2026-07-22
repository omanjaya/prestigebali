"use server";

// Server Action to create a Booking. Maps FormData → CreateBookingCommand,
// calls BookingService, then redirects to the status page on success.
//
// Kode Promo (fitur #1): `applyPromoAction` memvalidasi kode untuk pratinjau di form
// (useActionState terpisah, lihat promo-field.tsx). `createBookingAction` TIDAK percaya
// kode/nilai dari client — validasi ULANG server-side (checkPromoCode) lalu snapshot
// kode + potongan + deposit jaminan ke Booking (pola snapshot: perubahan promo/tarif
// belakangan tidak mengubah booking lama).

import type { PromoKind } from "@prisma/client";
import { redirect } from "next/navigation";

import type { HandoverMethod, RentalMode } from "@/domain/booking/booking";
import type { CreateBookingCommand } from "@/domain/booking/booking-service";
import { getT } from "@/i18n/server";
import { bookingMessages } from "@/i18n/messages/booking";
import { getCarModel } from "@/lib/catalog";
import { prisma } from "@/lib/prisma";
import { quoteBooking } from "@/lib/pricing";
import { checkPromoCode, computeDiscount, normalizeCode, recordPromoUse } from "@/lib/promo";
import { getBookingService } from "@/server/booking-container";
import { resolveCustomerAccountId } from "@/server/customer-account";

export interface CreateBookingState {
  error?: string;
}

export async function createBookingAction(
  _prevState: CreateBookingState,
  formData: FormData,
): Promise<CreateBookingState> {
  const { t } = await getT(bookingMessages);

  const carModelId = String(formData.get("carModelId") ?? "");
  const mode = String(formData.get("mode") ?? "") as RentalMode;
  const startAt = String(formData.get("startAt") ?? "");
  const endAt = String(formData.get("endAt") ?? "");
  const handoverMethodRaw = String(formData.get("handoverMethod") ?? "");
  const deliveryAddress = String(formData.get("deliveryAddress") ?? "").trim();
  const chauffeurPickup = String(formData.get("chauffeurPickup") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const promoCodeRaw = String(formData.get("promoCode") ?? "").trim();

  // Light server-side validation (the form also uses `required`).
  if (!carModelId || !mode || !startAt || !endAt) {
    return { error: t("booking.error.incompletePeriod") };
  }
  if (!name || !phone) {
    return { error: t("booking.error.missingContact") };
  }

  const startDate = new Date(startAt);
  const endDate = new Date(endAt);
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return { error: t("booking.error.invalidDate") };
  }
  if (endDate <= startDate) {
    return { error: t("booking.error.endBeforeStart") };
  }

  // Handover applies only to Self-Drive; pickup point applies to Chauffeur.
  let handoverMethod: HandoverMethod | undefined;
  let pickupPoint: string | undefined;
  if (mode === "SELF_DRIVE") {
    handoverMethod = handoverMethodRaw === "DELIVERY" ? "DELIVERY" : "PICKUP";
    if (handoverMethod === "DELIVERY") {
      if (!deliveryAddress) {
        return { error: t("booking.error.deliveryAddressRequired") };
      }
      pickupPoint = deliveryAddress;
    }
  } else {
    // CHAUFFEUR: use the Pickup Point as pickupPoint when provided.
    pickupPoint = chauffeurPickup || undefined;
  }

  let bookingId: string;
  try {
    const car = await getCarModel(carModelId);

    // Kode Promo — validasi ULANG di server (jangan percaya kind/value dari client).
    let normalizedCode: string | undefined;
    let discountAmount = 0;
    if (promoCodeRaw) {
      const promoCheck = await checkPromoCode(promoCodeRaw);
      if (!promoCheck.ok) {
        return { error: t("booking.error.invalidPromo") };
      }
      normalizedCode = normalizeCode(promoCodeRaw);
      const baseTotal = quoteBooking({
        mode,
        dailyRate: car?.dailyRate ?? null,
        chauffeurPackage: car?.chauffeurPackage ?? null,
        startAt: startDate,
        endAt: endDate,
      }).total;
      discountAmount = computeDiscount(promoCheck.promo, baseTotal);
    }

    // Deposit jaminan (Lepas Kunci) — snapshot dari CarModel.securityDeposit saat ini.
    const depositAmount = quoteBooking({
      mode,
      dailyRate: car?.dailyRate ?? null,
      chauffeurPackage: car?.chauffeurPackage ?? null,
      startAt: startDate,
      endAt: endDate,
      securityDeposit: car?.securityDeposit ?? null,
      discountIdr: discountAmount,
    }).deposit;

    // Guest account is auto-created here: upsert Account(role CUSTOMER) from name/phone,
    // then its id is used as the Booking's customerId (replacing the old placeholder).
    const customerId = await resolveCustomerAccountId({ name, phone });

    const cmd: CreateBookingCommand = {
      carModelId,
      customerId,
      mode,
      period: { startAt: startDate, endAt: endDate },
      handoverMethod,
      pickupPoint,
    };

    const booking = await getBookingService().createBooking(cmd);
    bookingId = booking.id;

    // Snapshot promo + deposit ke Booking (perubahan promo belakangan tidak mengubah
    // booking lama) — dilakukan setelah createBooking sukses, sebelum redirect.
    await prisma.booking.update({
      where: { id: booking.id },
      data: {
        promoCode: normalizedCode ?? null,
        discountAmount: discountAmount || null,
        depositAmount: depositAmount || null,
      },
    });
    if (normalizedCode) {
      await recordPromoUse(normalizedCode);
    }
  } catch {
    // Common failure right now: the database/Docker isn't running, so the repository fails.
    return { error: t("booking.error.createFailed") };
  }

  // redirect() throws internally — it must stay outside the try/catch so it isn't caught.
  redirect(`/status/${bookingId}`);
}

// ---------------------------------------------------------------------------
// Kode Promo — pratinjau di form (fitur #1). useActionState terpisah dari form utama
// (lihat promo-field.tsx). Hasil di sini HANYA untuk estimasi client-side; nilai
// dipercaya ulang secara server-side saat createBookingAction dipanggil.
// ---------------------------------------------------------------------------
export interface ApplyPromoState {
  ok?: boolean;
  code?: string;
  kind?: PromoKind;
  value?: number;
  message?: string;
}

export async function applyPromoAction(
  _prevState: ApplyPromoState,
  formData: FormData,
): Promise<ApplyPromoState> {
  const { t } = await getT(bookingMessages);
  const raw = String(formData.get("promoCodeInput") ?? "");
  const result = await checkPromoCode(raw);

  if (!result.ok) {
    const key =
      result.reason === "NOT_FOUND"
        ? "booking.promo.error.notFound"
        : result.reason === "INACTIVE"
          ? "booking.promo.error.inactive"
          : result.reason === "EXPIRED"
            ? "booking.promo.error.expired"
            : "booking.promo.error.maxUses";
    return { ok: false, message: t(key) };
  }

  return {
    ok: true,
    code: result.promo.code,
    kind: result.promo.kind,
    value: result.promo.value,
  };
}

"use server";

// Server Action to create a Booking. Maps FormData → CreateBookingCommand,
// calls BookingService, then redirects to the status page on success.

import { redirect } from "next/navigation";

import type { HandoverMethod, RentalMode } from "@/domain/booking/booking";
import type { CreateBookingCommand } from "@/domain/booking/booking-service";
import { getBookingService } from "@/server/booking-container";
import { resolveCustomerAccountId } from "@/server/customer-account";

export interface CreateBookingState {
  error?: string;
}

export async function createBookingAction(
  _prevState: CreateBookingState,
  formData: FormData,
): Promise<CreateBookingState> {
  const carModelId = String(formData.get("carModelId") ?? "");
  const mode = String(formData.get("mode") ?? "") as RentalMode;
  const startAt = String(formData.get("startAt") ?? "");
  const endAt = String(formData.get("endAt") ?? "");
  const handoverMethodRaw = String(formData.get("handoverMethod") ?? "");
  const deliveryAddress = String(formData.get("deliveryAddress") ?? "").trim();
  const chauffeurPickup = String(formData.get("chauffeurPickup") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();

  // Light server-side validation (the form also uses `required`).
  if (!carModelId || !mode || !startAt || !endAt) {
    return { error: "Please complete the rental mode and rental period." };
  }
  if (!name || !phone) {
    return { error: "Please provide your name and phone number." };
  }

  const startDate = new Date(startAt);
  const endDate = new Date(endAt);
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return { error: "Invalid date format." };
  }
  if (endDate <= startDate) {
    return { error: "The end time must be after the start time." };
  }

  // Handover applies only to Self-Drive; pickup point applies to Chauffeur.
  let handoverMethod: HandoverMethod | undefined;
  let pickupPoint: string | undefined;
  if (mode === "SELF_DRIVE") {
    handoverMethod = handoverMethodRaw === "DELIVERY" ? "DELIVERY" : "PICKUP";
    if (handoverMethod === "DELIVERY") {
      if (!deliveryAddress) {
        return { error: "Please provide a delivery address for the Delivery method." };
      }
      pickupPoint = deliveryAddress;
    }
  } else {
    // CHAUFFEUR: use the Pickup Point as pickupPoint when provided.
    pickupPoint = chauffeurPickup || undefined;
  }

  let bookingId: string;
  try {
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
  } catch {
    // Common failure right now: the database/Docker isn't running, so the repository fails.
    return {
      error:
        "Could not create the booking — the car may be unavailable, or the database isn't running yet (Docker/DB not active). Please try again.",
    };
  }

  // redirect() throws internally — it must stay outside the try/catch so it isn't caught.
  redirect(`/status/${bookingId}`);
}

"use client";

// Form Reschedule (US 27-28) — komponen client kecil berbasis useActionState agar pesan
// error NoAvailabilityError dari BookingService bisa ditampilkan tanpa dialog confirm()
// atau plumbing searchParams.

import { useActionState } from "react";

import { useI18n } from "@/i18n/client";
import { Field } from "@/ui/primitives";
import { rescheduleAction, type RescheduleState } from "./actions";

const INITIAL_STATE: RescheduleState = {};

export function RescheduleForm({ bookingId, minDateTime }: { bookingId: string; minDateTime: string }) {
  const { t } = useI18n();
  const [state, formAction, isPending] = useActionState(rescheduleAction, INITIAL_STATE);

  return (
    <form action={formAction} className="stack" style={{ gap: "0.9rem" }}>
      <input type="hidden" name="bookingId" value={bookingId} />
      <div className="row" style={{ gap: "0.9rem", flexWrap: "wrap" }}>
        <Field label={t("booking.status.reschedule.start")} htmlFor="reschedule-startAt">
          <input
            id="reschedule-startAt"
            name="startAt"
            type="datetime-local"
            min={minDateTime}
            required
          />
        </Field>
        <Field label={t("booking.status.reschedule.end")} htmlFor="reschedule-endAt">
          <input
            id="reschedule-endAt"
            name="endAt"
            type="datetime-local"
            min={minDateTime}
            required
          />
        </Field>
      </div>
      {state.error ? (
        <p className="eyebrow" style={{ color: "var(--danger)", margin: 0 }}>
          {state.error}
        </p>
      ) : null}
      <button type="submit" className="btn btn-ghost" disabled={isPending} style={{ alignSelf: "flex-start" }}>
        {isPending ? t("booking.status.reschedule.submitting") : t("booking.status.reschedule.submit")}
      </button>
    </form>
  );
}

"use client";

// Booking Form — Client Component. Uses useActionState (React 19) bound to the
// server action. Shows conditional fields based on the selected Rental Mode.

import { useActionState, useState } from "react";

import type { HandoverMethod, RentalMode } from "@/domain/booking/booking";
import { MODE_LABEL } from "@/ui/format";
import { Icon } from "@/ui/icons";
import { Field } from "@/ui/primitives";

import { createBookingAction, type CreateBookingState } from "./actions";

const initialState: CreateBookingState = {};

/** Uppercase eyebrow label with a small line-icon marker for a form section. */
function SectionHead({
  icon,
  children,
}: {
  icon: Parameters<typeof Icon>[0]["name"];
  children: React.ReactNode;
}) {
  return (
    <div className="row" style={{ gap: "0.6rem", alignItems: "center", marginBottom: "0.35rem" }}>
      <Icon name={icon} size={15} style={{ color: "var(--accent)" }} />
      <span className="eyebrow">{children}</span>
    </div>
  );
}

export function BookingForm({ carModelId }: { carModelId: string }) {
  const [state, formAction, isPending] = useActionState(createBookingAction, initialState);

  // Local state only controls the display of conditional fields.
  const [mode, setMode] = useState<RentalMode>("SELF_DRIVE");
  const [handoverMethod, setHandoverMethod] = useState<HandoverMethod>("PICKUP");

  return (
    <form action={formAction}>
      <input type="hidden" name="carModelId" value={carModelId} />

      {/* Mode */}
      <section className="stack reveal" style={{ gap: "0.75rem" }}>
        <SectionHead icon="key">Rental Mode</SectionHead>
        <Field label="How would you like to ride?" htmlFor="mode">
          <select
            id="mode"
            name="mode"
            value={mode}
            onChange={(e) => setMode(e.target.value as RentalMode)}
            required
          >
            <option value="SELF_DRIVE">{MODE_LABEL.SELF_DRIVE}</option>
            <option value="CHAUFFEUR">{MODE_LABEL.CHAUFFEUR}</option>
          </select>
        </Field>
      </section>

      <hr className="divider" style={{ margin: "1.6rem 0" }} />

      {/* Period */}
      <section className="stack reveal" style={{ gap: "0.75rem" }}>
        <SectionHead icon="calendar">Rental Period</SectionHead>
        <div className="row" style={{ gap: "1rem", alignItems: "flex-start" }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <Field label="Start date & time" htmlFor="startAt">
              <input id="startAt" name="startAt" type="datetime-local" required />
            </Field>
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <Field label="End date & time" htmlFor="endAt">
              <input id="endAt" name="endAt" type="datetime-local" required />
            </Field>
          </div>
        </div>
      </section>

      <hr className="divider" style={{ margin: "1.6rem 0" }} />

      {/* Handover */}
      <section className="stack reveal" style={{ gap: "0.75rem" }}>
        <SectionHead icon="mapPin">Handover</SectionHead>
        {mode === "SELF_DRIVE" ? (
          <>
            <Field label="Handover Method" htmlFor="handoverMethod">
              <select
                id="handoverMethod"
                name="handoverMethod"
                value={handoverMethod}
                onChange={(e) => setHandoverMethod(e.target.value as HandoverMethod)}
                required
              >
                <option value="PICKUP">Self Pickup</option>
                <option value="DELIVERY">Delivery</option>
              </select>
            </Field>

            {handoverMethod === "DELIVERY" ? (
              <Field label="Delivery address" htmlFor="deliveryAddress">
                <input
                  id="deliveryAddress"
                  name="deliveryAddress"
                  type="text"
                  placeholder="Full delivery destination address"
                  required
                />
              </Field>
            ) : null}
          </>
        ) : (
          <Field label="Pickup Point" htmlFor="chauffeurPickup">
            <input
              id="chauffeurPickup"
              name="chauffeurPickup"
              type="text"
              placeholder="Pickup location (hotel, airport, address, etc.)"
              required
            />
          </Field>
        )}
      </section>

      <hr className="divider" style={{ margin: "1.6rem 0" }} />

      {/* Your details */}
      <section className="stack reveal" style={{ gap: "0.75rem" }}>
        <SectionHead icon="user">Your Details</SectionHead>
        <div className="row" style={{ gap: "1rem", alignItems: "flex-start" }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <Field label="Name" htmlFor="name">
              <input id="name" name="name" type="text" placeholder="Full name" required />
            </Field>
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <Field label="Phone" htmlFor="phone">
              <input id="phone" name="phone" type="tel" placeholder="08xxxxxxxxxx" required />
            </Field>
          </div>
        </div>
      </section>

      {state.error ? (
        <p
          className="muted"
          style={{ color: "var(--danger)", margin: "1.5rem 0 0" }}
          role="alert"
        >
          {state.error}
        </p>
      ) : null}

      <div style={{ marginTop: "1.9rem" }}>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isPending}
          style={{ width: "100%", padding: "0.9rem 1.35rem" }}
        >
          {isPending ? (
            "Processing…"
          ) : (
            <>
              Create Booking <Icon name="arrow" size={16} />
            </>
          )}
        </button>
      </div>
    </form>
  );
}

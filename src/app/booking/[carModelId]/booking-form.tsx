"use client";

// Form Booking — Client Component. Memakai useActionState (React 19) yang terikat
// ke server action. Menampilkan field kondisional berdasarkan Mode Sewa terpilih.

import { useActionState, useState } from "react";

import type { HandoverMethod, RentalMode } from "@/domain/booking/booking";
import { MODE_LABEL } from "@/ui/format";
import { Field } from "@/ui/primitives";

import { createBookingAction, type CreateBookingState } from "./actions";

const initialState: CreateBookingState = {};

export function BookingForm({ carModelId }: { carModelId: string }) {
  const [state, formAction, isPending] = useActionState(createBookingAction, initialState);

  // State lokal hanya untuk mengendalikan tampilan field kondisional.
  const [mode, setMode] = useState<RentalMode>("SELF_DRIVE");
  const [handoverMethod, setHandoverMethod] = useState<HandoverMethod>("PICKUP");

  return (
    <form action={formAction} className="stack">
      <input type="hidden" name="carModelId" value={carModelId} />

      <Field label="Mode Sewa" htmlFor="mode">
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

      <div className="row" style={{ gap: "1rem", alignItems: "flex-start" }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <Field label="Tanggal & jam mulai" htmlFor="startAt">
            <input id="startAt" name="startAt" type="datetime-local" required />
          </Field>
        </div>
        <div style={{ flex: 1, minWidth: 200 }}>
          <Field label="Tanggal & jam selesai" htmlFor="endAt">
            <input id="endAt" name="endAt" type="datetime-local" required />
          </Field>
        </div>
      </div>

      {mode === "SELF_DRIVE" ? (
        <>
          <Field label="Metode Serah-Terima" htmlFor="handoverMethod">
            <select
              id="handoverMethod"
              name="handoverMethod"
              value={handoverMethod}
              onChange={(e) => setHandoverMethod(e.target.value as HandoverMethod)}
              required
            >
              <option value="PICKUP">Ambil Sendiri</option>
              <option value="DELIVERY">Diantar</option>
            </select>
          </Field>

          {handoverMethod === "DELIVERY" ? (
            <Field label="Alamat pengantaran" htmlFor="deliveryAddress">
              <input
                id="deliveryAddress"
                name="deliveryAddress"
                type="text"
                placeholder="Alamat lengkap tujuan pengantaran"
                required
              />
            </Field>
          ) : null}
        </>
      ) : (
        <Field label="Titik Jemput" htmlFor="chauffeurPickup">
          <input
            id="chauffeurPickup"
            name="chauffeurPickup"
            type="text"
            placeholder="Lokasi penjemputan (hotel, bandara, alamat, dll.)"
            required
          />
        </Field>
      )}

      <div className="row" style={{ gap: "1rem", alignItems: "flex-start" }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <Field label="Nama" htmlFor="name">
            <input id="name" name="name" type="text" placeholder="Nama lengkap" required />
          </Field>
        </div>
        <div style={{ flex: 1, minWidth: 200 }}>
          <Field label="No. HP" htmlFor="phone">
            <input id="phone" name="phone" type="tel" placeholder="08xxxxxxxxxx" required />
          </Field>
        </div>
      </div>

      {state.error ? (
        <p className="muted" style={{ color: "var(--danger)", margin: 0 }} role="alert">
          {state.error}
        </p>
      ) : null}

      <div className="row">
        <button type="submit" className="btn btn-primary" disabled={isPending}>
          {isPending ? "Memproses…" : "Buat Booking"}
        </button>
      </div>
    </form>
  );
}

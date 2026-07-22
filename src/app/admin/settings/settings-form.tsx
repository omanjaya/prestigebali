"use client";

// Form Settings (Client Component) — useActionState memanggil saveSettingsAction.
// Dua section: Booking rules & Currency rates. Tiap input menampilkan hint kecil
// dengan nilai default/fallback di bawahnya (mis. "Default: 60").

import { useActionState } from "react";
import { Field, Card, CardBody } from "@/ui/primitives";
import type { SettingKey } from "@/lib/settings";
import { saveSettingsAction, type SettingsFormState } from "./actions";

const initialState: SettingsFormState = {};

/** Hint kecil di bawah input, menampilkan nilai default/fallback saat ini. */
function Hint({ children }: { children: React.ReactNode }) {
  return (
    <p className="muted" style={{ margin: "0.35rem 0 0", fontSize: "0.85rem" }}>
      {children}
    </p>
  );
}

export function SettingsForm({
  settings,
  fallbacks,
}: {
  settings: Record<SettingKey, number>;
  fallbacks: Record<SettingKey, number>;
}) {
  const [state, formAction, pending] = useActionState(saveSettingsAction, initialState);

  return (
    <form action={formAction} className="stack" style={{ gap: "1.5rem" }}>
      <Card>
        <CardBody>
          <div className="stack" style={{ gap: "1.25rem" }}>
            <div>
              <h3 style={{ margin: 0 }}>Booking rules</h3>
              <p className="muted" style={{ margin: "0.35rem 0 0" }}>
                Aturan yang memengaruhi perhitungan ketersediaan & alur booking.
              </p>
            </div>

            <div className="admin-form-grid">
              <div style={{ gridColumn: "1 / -1" }}>
                <Field label="Hold timeout (menit)" htmlFor="holdTimeoutMinutes">
                  <input
                    id="holdTimeoutMinutes"
                    name="holdTimeoutMinutes"
                    type="number"
                    min={5}
                    step={1}
                    defaultValue={settings.holdTimeoutMinutes}
                    required
                  />
                  <Hint>
                    Lama slot ditahan (hold) sebelum otomatis dilepas jika pembayaran belum
                    dikonfirmasi. Minimal 5 menit. Default: {fallbacks.holdTimeoutMinutes}.
                  </Hint>
                </Field>
              </div>

              <Field label="Buffer antar booking (hari)" htmlFor="bufferDays">
                <input
                  id="bufferDays"
                  name="bufferDays"
                  type="number"
                  min={0}
                  max={7}
                  step={1}
                  defaultValue={settings.bufferDays}
                  required
                />
                <Hint>
                  Jeda cuci/servis antar booking untuk unit yang sama (0–7 hari). Berlaku
                  langsung ke perhitungan ketersediaan unit. Default: {fallbacks.bufferDays}.
                </Hint>
              </Field>

              <Field label="Biaya admin refund (Rp)" htmlFor="refundAdminFee">
                <input
                  id="refundAdminFee"
                  name="refundAdminFee"
                  type="number"
                  min={0}
                  step={1}
                  defaultValue={settings.refundAdminFee}
                  required
                />
                <Hint>
                  Potongan tetap (Rp) yang dikenakan saat memproses refund pembatalan.
                  Default: {fallbacks.refundAdminFee}.
                </Hint>
              </Field>
            </div>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardBody>
          <div className="stack" style={{ gap: "1.25rem" }}>
            <div>
              <h3 style={{ margin: 0 }}>Currency rates (IDR per 1 unit)</h3>
              <p className="muted" style={{ margin: "0.35rem 0 0" }}>
                Kurs dipakai untuk KONVERSI TAMPILAN harga bagi pengunjung mancanegara;
                pembayaran tetap dicatat IDR.
              </p>
            </div>

            <div className="admin-form-grid">
              <Field label="Kurs IDR per 1 USD" htmlFor="rate.USD">
                <input
                  id="rate.USD"
                  name="rate.USD"
                  type="number"
                  min={0}
                  step="any"
                  defaultValue={settings["rate.USD"]}
                  required
                />
                <Hint>Default: {fallbacks["rate.USD"]}</Hint>
              </Field>

              <Field label="Kurs IDR per 1 RUB" htmlFor="rate.RUB">
                <input
                  id="rate.RUB"
                  name="rate.RUB"
                  type="number"
                  min={0}
                  step="any"
                  defaultValue={settings["rate.RUB"]}
                  required
                />
                <Hint>Default: {fallbacks["rate.RUB"]}</Hint>
              </Field>

              <Field label="Kurs IDR per 1 CNY" htmlFor="rate.CNY">
                <input
                  id="rate.CNY"
                  name="rate.CNY"
                  type="number"
                  min={0}
                  step="any"
                  defaultValue={settings["rate.CNY"]}
                  required
                />
                <Hint>Default: {fallbacks["rate.CNY"]}</Hint>
              </Field>

              <Field label="Kurs IDR per 1 AUD" htmlFor="rate.AUD">
                <input
                  id="rate.AUD"
                  name="rate.AUD"
                  type="number"
                  min={0}
                  step="any"
                  defaultValue={settings["rate.AUD"]}
                  required
                />
                <Hint>Default: {fallbacks["rate.AUD"]}</Hint>
              </Field>
            </div>
          </div>
        </CardBody>
      </Card>

      <div className="stack" style={{ gap: "0.75rem" }}>
        {state.error ? (
          <p className="muted" style={{ color: "var(--danger)" }} role="alert">
            {state.error}
          </p>
        ) : null}
        {state.ok ? (
          <p className="muted" style={{ color: "var(--ok)" }} role="status">
            {state.ok}
          </p>
        ) : null}

        <div className="admin-actions-row">
          <button type="submit" className="btn btn-primary" disabled={pending}>
            {pending ? "Saving…" : "Save settings"}
          </button>
        </div>
      </div>
    </form>
  );
}

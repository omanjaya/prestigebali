"use client";

// Form Kode Promo bersama (create & edit). Client Component memakai useActionState.
// Mode edit menyertakan hidden `id` + tombol Delete (form terpisah). Label field
// "Value" berubah sesuai Kind (% potongan vs Rp potongan) via state lokal.

import Link from "next/link";
import { useActionState, useState } from "react";
import { Field } from "@/ui/primitives";
import type { PromoView } from "@/lib/promo";
import type { PromoKind } from "@prisma/client";
import { savePromoAction, deletePromoAction, type PromoFormState } from "./actions";
import { ConfirmButton } from "../confirm-button";

const initialState: PromoFormState = {};

/** Date → "YYYY-MM-DD" untuk defaultValue input type="date". */
function toDateInputValue(date?: Date): string {
  if (!date) return "";
  return date.toISOString().slice(0, 10);
}

export function PromoForm({ promo }: { promo?: PromoView }) {
  const [state, formAction, pending] = useActionState(savePromoAction, initialState);
  // deletePromoAction(formData) mengikuti signature plain form-action; adaptasi ke
  // bentuk useActionState (prevState, payload) agar error bisa ditampilkan.
  const [deleteState, deleteAction, deleting] = useActionState<PromoFormState, FormData>(
    (_prev, formData) => deletePromoAction(formData),
    initialState,
  );

  const [kind, setKind] = useState<PromoKind>(promo?.kind ?? "PERCENT");
  const isEdit = Boolean(promo);
  const valueLabel = kind === "PERCENT" ? "Value — % potongan" : "Value — Rp potongan";

  return (
    <>
      <form action={formAction} className="stack" style={{ gap: "1.5rem" }}>
        {promo ? <input type="hidden" name="id" value={promo.id} /> : null}

        <div className="admin-form-grid">
          <div style={{ gridColumn: "1 / -1" }}>
            <Field label="Code" htmlFor="code">
              <input
                id="code"
                name="code"
                type="text"
                placeholder="mis. SUMMER10"
                defaultValue={promo?.code ?? ""}
                required
              />
              <p className="muted" style={{ margin: "0.35rem 0 0", fontSize: "0.85rem" }}>
                Otomatis diubah ke huruf besar (mis. &quot;summer10&quot; → &quot;SUMMER10&quot;).
              </p>
            </Field>
          </div>

          <Field label="Kind" htmlFor="kind">
            <select
              id="kind"
              name="kind"
              value={kind}
              onChange={(e) => setKind(e.target.value as PromoKind)}
            >
              <option value="PERCENT">Percent (%)</option>
              <option value="FIXED">Fixed (Rp)</option>
            </select>
          </Field>

          <Field label={valueLabel} htmlFor="value">
            <input
              id="value"
              name="value"
              type="number"
              min={1}
              max={kind === "PERCENT" ? 100 : undefined}
              defaultValue={promo?.value ?? ""}
              required
            />
          </Field>

          <div style={{ gridColumn: "1 / -1" }}>
            <Field label="Active" htmlFor="active">
              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <input
                  id="active"
                  name="active"
                  type="checkbox"
                  defaultChecked={promo?.active ?? true}
                />
                <span className="muted">Promo bisa dipakai pelanggan saat booking</span>
              </label>
            </Field>
          </div>

          <Field label="Expires at (optional)" htmlFor="expiresAt">
            <input
              id="expiresAt"
              name="expiresAt"
              type="date"
              defaultValue={toDateInputValue(promo?.expiresAt)}
            />
          </Field>

          <Field label="Max uses (optional)" htmlFor="maxUses">
            <input
              id="maxUses"
              name="maxUses"
              type="number"
              min={1}
              placeholder="Tanpa batas"
              defaultValue={promo?.maxUses ?? ""}
            />
          </Field>

          <div style={{ gridColumn: "1 / -1" }}>
            <Field label="Note (optional)" htmlFor="note">
              <input
                id="note"
                name="note"
                type="text"
                placeholder="Catatan internal, mis. promo musim panas IG"
                defaultValue={promo?.note ?? ""}
              />
            </Field>
          </div>
        </div>

        {state.error ? (
          <p className="muted" style={{ color: "var(--danger)" }} role="alert">
            {state.error}
          </p>
        ) : null}

        <div className="divider" style={{ margin: "0.5rem 0" }} />

        <div className="admin-actions-row">
          <button type="submit" className="btn btn-primary" disabled={pending}>
            {pending ? "Saving…" : isEdit ? "Save changes" : "Create promo"}
          </button>
          <Link href="/admin/promos" className="btn btn-ghost">
            Cancel
          </Link>
        </div>
      </form>

      {promo ? (
        <form action={deleteAction} style={{ marginTop: "2rem" }}>
          <input type="hidden" name="id" value={promo.id} />
          <div className="divider" style={{ margin: "1rem 0" }} />
          {deleteState.error ? (
            <p className="muted" style={{ color: "var(--danger)" }} role="alert">
              {deleteState.error}
            </p>
          ) : null}
          <div className="admin-actions-row">
            <ConfirmButton className="btn btn-ghost" disabled={deleting}>
              {deleting ? "Deleting…" : "Delete promo"}
            </ConfirmButton>
          </div>
        </form>
      ) : null}
    </>
  );
}

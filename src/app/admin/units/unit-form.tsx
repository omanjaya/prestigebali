"use client";

// Form Unit bersama (create & edit). Client Component memakai useActionState.
// Mode edit menyertakan hidden `id` + tombol Delete (form terpisah).

import Link from "next/link";
import { useActionState } from "react";
import { Field } from "@/ui/primitives";
import type { CarModelView } from "@/lib/catalog";
import type { UnitView } from "@/lib/units";
import { saveUnitAction, deleteUnitAction, type UnitFormState } from "./actions";
import { ConfirmButton } from "../confirm-button";

const initialState: UnitFormState = {};

export function UnitForm({ unit, cars }: { unit?: UnitView; cars: CarModelView[] }) {
  const [state, formAction, pending] = useActionState(saveUnitAction, initialState);
  // deleteUnitAction(formData) follows the plain form-action signature; adapt it to
  // useActionState's (prevState, payload) shape so we can surface errors.
  const [deleteState, deleteAction, deleting] = useActionState<UnitFormState, FormData>(
    (_prev, formData) => deleteUnitAction(formData),
    initialState,
  );

  const isEdit = Boolean(unit);

  return (
    <>
      <form action={formAction} className="stack" style={{ gap: "1.5rem" }}>
        {unit ? <input type="hidden" name="id" value={unit.id} /> : null}

        <div className="admin-form-grid">
          <div className="eyebrow" style={{ gridColumn: "1 / -1" }}>
            Identity
          </div>

          <div style={{ gridColumn: "1 / -1" }}>
            <Field label="Car" htmlFor="carModelId">
              <select
                id="carModelId"
                name="carModelId"
                defaultValue={unit?.carModelId ?? ""}
                required
                disabled={isEdit}
              >
                <option value="" disabled>
                  Select a car…
                </option>
                {cars.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.brand} {c.name}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="Plate" htmlFor="plate">
            <input
              id="plate"
              name="plate"
              type="text"
              placeholder="B 100 ALP"
              defaultValue={unit?.plate ?? ""}
              required
            />
          </Field>

          <Field label="Color" htmlFor="color">
            <input id="color" name="color" type="text" defaultValue={unit?.color ?? ""} required />
          </Field>

          <Field label="Odometer (km)" htmlFor="odometer">
            <input
              id="odometer"
              name="odometer"
              type="number"
              min={0}
              defaultValue={unit?.odometer ?? 0}
              required
            />
          </Field>

          <Field label="Condition (optional)" htmlFor="condition">
            <input
              id="condition"
              name="condition"
              type="text"
              placeholder="Notes on current condition"
              defaultValue={unit?.condition ?? ""}
            />
          </Field>
        </div>

        {state.error ? (
          <p className="muted" style={{ color: "var(--danger)" }} role="alert">
            {state.error}
          </p>
        ) : null}

        <div className="divider" style={{ margin: "0.5rem 0" }} />

        <div className="admin-actions-row">
          <button type="submit" className="btn btn-primary" disabled={pending}>
            {pending ? "Saving…" : isEdit ? "Save changes" : "Create unit"}
          </button>
          <Link href="/admin/units" className="btn btn-ghost">
            Cancel
          </Link>
        </div>
      </form>

      {unit ? (
        <form action={deleteAction} style={{ marginTop: "2rem" }}>
          <input type="hidden" name="id" value={unit.id} />
          <div className="divider" style={{ margin: "1rem 0" }} />
          {deleteState.error ? (
            <p className="muted" style={{ color: "var(--danger)" }} role="alert">
              {deleteState.error}
            </p>
          ) : null}
          <div className="admin-actions-row">
            <ConfirmButton className="btn btn-ghost" disabled={deleting}>
              {deleting ? "Deleting…" : "Delete unit"}
            </ConfirmButton>
          </div>
        </form>
      ) : null}
    </>
  );
}

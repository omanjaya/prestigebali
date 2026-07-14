"use client";

// Form Mobil bersama (create & edit). Client Component memakai useActionState.
// Mode edit menyertakan hidden `id` + tombol Delete (form terpisah). Foto diisi
// sebagai daftar URL (satu per baris) di textarea.

import Link from "next/link";
import { useActionState } from "react";
import { Field } from "@/ui/primitives";
import { CATEGORY_LABEL, type CarModelView } from "@/lib/catalog";
import { saveCar, deleteCar, type CarFormState } from "./actions";

const initialState: CarFormState = {};

const CATEGORY_ORDER: (keyof typeof CATEGORY_LABEL)[] = [
  "SPORT",
  "LUXURY_SEDAN",
  "LUXURY_SUV",
  "PREMIUM_MPV",
];

export function CarForm({ car }: { car?: CarModelView }) {
  const [state, formAction, pending] = useActionState(saveCar, initialState);
  // deleteCar(formData) follows the plain form-action signature; adapt it to
  // useActionState's (prevState, payload) shape so we can surface errors.
  const [deleteState, deleteAction, deleting] = useActionState<CarFormState, FormData>(
    (_prev, formData) => deleteCar(formData),
    initialState,
  );

  const isEdit = Boolean(car);

  return (
    <>
      <form action={formAction} className="stack">
        {car ? <input type="hidden" name="id" value={car.id} /> : null}

        <Field label="Name" htmlFor="name">
          <input id="name" name="name" type="text" defaultValue={car?.name ?? ""} required />
        </Field>

        <Field label="Brand" htmlFor="brand">
          <input id="brand" name="brand" type="text" defaultValue={car?.brand ?? ""} required />
        </Field>

        <div className="row" style={{ gap: "1rem", alignItems: "flex-start" }}>
          <div style={{ flex: 1, minWidth: 140 }}>
            <Field label="Year" htmlFor="year">
              <input
                id="year"
                name="year"
                type="number"
                min={1900}
                max={2100}
                defaultValue={car?.year ?? ""}
                required
              />
            </Field>
          </div>
          <div style={{ flex: 1, minWidth: 140 }}>
            <Field label="Seats" htmlFor="seats">
              <input
                id="seats"
                name="seats"
                type="number"
                min={1}
                defaultValue={car?.seats ?? ""}
                required
              />
            </Field>
          </div>
        </div>

        <Field label="Transmission" htmlFor="transmission">
          <input
            id="transmission"
            name="transmission"
            type="text"
            placeholder="Automatic / Manual"
            defaultValue={car?.transmission ?? ""}
            required
          />
        </Field>

        <Field label="Category" htmlFor="category">
          <select id="category" name="category" defaultValue={car?.category ?? ""} required>
            <option value="" disabled>
              Select a category…
            </option>
            {CATEGORY_ORDER.map((c) => (
              <option key={c} value={c}>
                {CATEGORY_LABEL[c]}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Stock" htmlFor="stock">
          <input
            id="stock"
            name="stock"
            type="number"
            min={0}
            defaultValue={car?.stock ?? 1}
            required
          />
        </Field>

        <div className="row" style={{ gap: "1rem", alignItems: "flex-start" }}>
          <div style={{ flex: 1, minWidth: 160 }}>
            <Field label="Daily Rate (IDR, Self-Drive)" htmlFor="dailyRate">
              <input
                id="dailyRate"
                name="dailyRate"
                type="number"
                min={0}
                placeholder="Leave blank if N/A"
                defaultValue={car?.dailyRate ?? ""}
              />
            </Field>
          </div>
          <div style={{ flex: 1, minWidth: 160 }}>
            <Field label="Chauffeur Package (IDR, 12h)" htmlFor="chauffeurPackage">
              <input
                id="chauffeurPackage"
                name="chauffeurPackage"
                type="number"
                min={0}
                placeholder="Leave blank if N/A"
                defaultValue={car?.chauffeurPackage ?? ""}
              />
            </Field>
          </div>
        </div>

        <Field label="Photo URLs (one per line)" htmlFor="photos">
          <textarea
            id="photos"
            name="photos"
            rows={4}
            placeholder="https://images.unsplash.com/…"
            defaultValue={car?.photos.join("\n") ?? ""}
          />
        </Field>

        {state.error ? (
          <p className="muted" style={{ color: "var(--danger)" }} role="alert">
            {state.error}
          </p>
        ) : null}

        <div className="row" style={{ gap: "0.75rem" }}>
          <button type="submit" className="btn btn-primary" disabled={pending}>
            {pending ? "Saving…" : isEdit ? "Save changes" : "Create car"}
          </button>
          <Link href="/admin/cars" className="btn btn-ghost">
            Cancel
          </Link>
        </div>
      </form>

      {car ? (
        <form action={deleteAction} style={{ marginTop: "2rem" }}>
          <input type="hidden" name="id" value={car.id} />
          <div className="divider" style={{ margin: "1rem 0" }} />
          {deleteState.error ? (
            <p className="muted" style={{ color: "var(--danger)" }} role="alert">
              {deleteState.error}
            </p>
          ) : null}
          <button type="submit" className="btn btn-ghost" disabled={deleting}>
            {deleting ? "Deleting…" : "Delete car"}
          </button>
        </form>
      ) : null}
    </>
  );
}

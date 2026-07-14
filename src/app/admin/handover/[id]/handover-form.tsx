// Form checklist satu fase (OUT/IN). Server Component: <form action={saveHandover}>.
// Nilai awal dari record yang sudah ada; untuk fase baru, kelengkapan default tercentang.

import {
  CONDITION_FIELDS,
  EQUIPMENT_FIELDS,
  fuelLabel,
  type HandoverPhase,
  type HandoverView,
} from "@/lib/handovers";
import { saveHandover } from "../actions";

const PHASE_TITLE: Record<HandoverPhase, string> = {
  OUT: "Pengambilan",
  IN: "Pengembalian",
};

const PHASE_SUB: Record<HandoverPhase, string> = {
  OUT: "Kondisi saat unit diserahkan ke penyewa.",
  IN: "Kondisi saat unit dikembalikan penyewa.",
};

function Check({
  name,
  label,
  checked,
}: {
  name: string;
  label: string;
  checked: boolean;
}) {
  return (
    <label className="ho-check">
      <input type="checkbox" name={name} defaultChecked={checked} />
      <span>{label}</span>
    </label>
  );
}

export function HandoverForm({
  bookingId,
  phase,
  existing,
}: {
  bookingId: string;
  phase: HandoverPhase;
  existing?: HandoverView;
}) {
  // Fase baru: kelengkapan & kondisi dianggap lengkap (tinggal uncheck yang kurang).
  const v = existing;
  const isNew = !v;

  return (
    <form action={saveHandover} className={`ho-card${isNew ? "" : " ho-card-done"}`}>
      <input type="hidden" name="bookingId" value={bookingId} />
      <input type="hidden" name="phase" value={phase} />

      <div className="ho-card-head">
        <div>
          <span className="kicker">{phase === "OUT" ? "Keluar" : "Masuk"}</span>
          <h3 style={{ margin: "0.3rem 0 0.15rem" }}>{PHASE_TITLE[phase]}</h3>
          <p className="muted" style={{ margin: 0, fontSize: "0.85rem" }}>
            {PHASE_SUB[phase]}
          </p>
        </div>
        {v ? <span className="badge badge-ok">Tersimpan</span> : null}
      </div>

      <div className="ho-grid2">
        <label className="ho-field">
          <span className="ho-label">Odometer (KM)</span>
          <input
            type="number"
            name="odometer"
            min={0}
            defaultValue={v?.odometer ?? ""}
            placeholder="mis. 45210"
            required
          />
        </label>
        <label className="ho-field">
          <span className="ho-label">Level BBM</span>
          <select name="fuelEighths" defaultValue={v?.fuelEighths ?? 8}>
            {Array.from({ length: 9 }, (_, i) => 8 - i).map((e) => (
              <option key={e} value={e}>
                {fuelLabel(e)}
              </option>
            ))}
          </select>
        </label>
      </div>

      <fieldset className="ho-fieldset">
        <legend>Kondisi</legend>
        <div className="ho-checks">
          {CONDITION_FIELDS.map((f) => (
            <Check
              key={f.key}
              name={f.key}
              label={f.label}
              checked={v ? v[f.key] : true}
            />
          ))}
        </div>
      </fieldset>

      <fieldset className="ho-fieldset">
        <legend>Kelengkapan</legend>
        <div className="ho-checks">
          {EQUIPMENT_FIELDS.map((f) => (
            <Check
              key={f.key}
              name={f.key}
              label={f.label}
              checked={v ? v[f.key] : f.key !== "firstAidKit"}
            />
          ))}
        </div>
      </fieldset>

      <label className="ho-field">
        <span className="ho-label">Aksesori tambahan</span>
        <input
          type="text"
          name="accessories"
          defaultValue={v?.accessories.join(", ") ?? ""}
          placeholder="Charger, Dashcam, kartu e-toll…"
        />
        <span className="ho-hint">Pisahkan dengan koma.</span>
      </label>

      <label className="ho-field">
        <span className="ho-label">Catatan baret / penyok</span>
        <textarea
          name="damageNotes"
          rows={2}
          defaultValue={v?.damageNotes ?? ""}
          placeholder="mis. Baret halus pintu belakang kanan, penyok kecil bumper depan."
        />
      </label>

      <label className="ho-field">
        <span className="ho-label">Catatan lain</span>
        <textarea name="notes" rows={2} defaultValue={v?.notes ?? ""} />
      </label>

      <div className="ho-grid2">
        <label className="ho-field">
          <span className="ho-label">Nama petugas</span>
          <input type="text" name="staffName" defaultValue={v?.staffName ?? ""} />
        </label>
        <div className="ho-field">
          <span className="ho-label">Konfirmasi tanda tangan</span>
          <div className="ho-checks">
            <Check name="signedByStaff" label="Petugas" checked={v?.signedByStaff ?? false} />
            <Check
              name="signedByCustomer"
              label="Penyewa"
              checked={v?.signedByCustomer ?? false}
            />
          </div>
        </div>
      </div>

      <button type="submit" className="btn btn-primary" style={{ marginTop: "0.5rem" }}>
        {v ? "Perbarui" : "Simpan"} {PHASE_TITLE[phase].toLowerCase()}
      </button>
    </form>
  );
}

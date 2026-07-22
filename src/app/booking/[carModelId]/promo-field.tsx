"use client";

// Kode Promo — komponen kecil dengan useActionState TERPISAH dari form utama.
// Menampilkan input + tombol "Terapkan"; setelah valid, kirim hasil ke parent
// (BookingForm) lewat callback `onApplied` agar Estimasi Biaya dihitung ulang
// client-side. Validasi ULANG dilakukan server-side saat submit booking
// (createBookingAction) — hasil di sini hanya untuk pratinjau/estimasi.

import { useActionState, useEffect } from "react";
import type { PromoKind } from "@prisma/client";

import { useI18n } from "@/i18n/client";
import { Icon } from "@/ui/icons";

import { applyPromoAction, type ApplyPromoState } from "./actions";

const initialState: ApplyPromoState = {};

export interface AppliedPromo {
  code: string;
  kind: PromoKind;
  value: number;
}

export function PromoField({
  applied,
  onApplied,
  onRemove,
}: {
  applied: AppliedPromo | null;
  onApplied: (promo: AppliedPromo) => void;
  onRemove: () => void;
}) {
  const { t } = useI18n();
  const [state, formAction, isPending] = useActionState(applyPromoAction, initialState);

  // Sinkronkan hasil action sukses ke parent (BookingForm) begitu tersedia.
  useEffect(() => {
    if (state.ok && state.code && state.kind && state.value != null) {
      onApplied({ code: state.code, kind: state.kind, value: state.value });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  if (applied) {
    return (
      <div className="row" style={{ gap: "0.65rem", alignItems: "center", flexWrap: "wrap" }}>
        <Icon name="check" size={15} style={{ color: "var(--ok)" }} />
        <span style={{ fontSize: "0.9rem" }}>
          {t("booking.promo.applied")} <strong>{applied.code}</strong>
        </span>
        <button
          type="button"
          className="btn btn-ghost"
          onClick={onRemove}
          style={{ padding: "0.3rem 0.75rem", fontSize: "0.72rem" }}
        >
          {t("booking.promo.remove")}
        </button>
      </div>
    );
  }

  return (
    <form action={formAction} className="row" style={{ gap: "0.6rem", alignItems: "flex-start", flexWrap: "wrap" }}>
      <input
        name="promoCodeInput"
        placeholder={t("booking.promo.placeholder")}
        style={{ flex: "1 1 200px", minWidth: 0 }}
      />
      <button type="submit" className="btn" disabled={isPending} style={{ flex: "0 0 auto" }}>
        {isPending ? "…" : t("booking.promo.apply")}
      </button>
      {state.ok === false ? (
        <p
          className="muted"
          role="alert"
          style={{ width: "100%", margin: 0, color: "var(--danger)", fontSize: "0.8rem" }}
        >
          {state.message}
        </p>
      ) : null}
    </form>
  );
}

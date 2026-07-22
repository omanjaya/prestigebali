"use client";

// Booking Form — Client Component. Uses useActionState (React 19) bound to the
// server action. Shows conditional fields based on the selected Rental Mode.
//
// Kode Promo (fitur #1): <PromoField> mengelola pratinjau (useActionState terpisah);
// hasil disimpan di state lokal `appliedPromo` lalu dipakai untuk menghitung
// `discountIdr` client-side (dikirim ulang & divalidasi server saat submit).
//
// Deposit jaminan (fitur #2): mode SELF_DRIVE + `securityDeposit` menampilkan baris
// Deposit jaminan + "Bayar sekarang (DP + Deposit)"; CHAUFFEUR tidak menampilkannya
// (quoteBooking sudah menolkan deposit untuk CHAUFFEUR).

import { useActionState, useEffect, useState, type ReactNode } from "react";

import type { HandoverMethod, RentalMode } from "@/domain/booking/booking";
import { useI18n, Money } from "@/i18n/client";
import { quoteBooking } from "@/lib/pricing";
import { Icon } from "@/ui/icons";
import { Field } from "@/ui/primitives";

import { createBookingAction, type CreateBookingState } from "./actions";
import { PromoField, type AppliedPromo } from "./promo-field";

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

/** Baris hairline untuk kartu Ringkasan Biaya — label kiri, nilai kanan. */
function CostRow({
  label,
  children,
  emphasis,
  last,
}: {
  label: ReactNode;
  children: ReactNode;
  emphasis?: boolean;
  last?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "baseline",
        justifyContent: "space-between",
        gap: "1rem",
        padding: "0.65rem 0",
        borderBottom: last ? "none" : "1px solid var(--border)",
      }}
    >
      <span className={emphasis ? "eyebrow" : "muted"} style={{ fontSize: emphasis ? undefined : "0.85rem" }}>
        {label}
      </span>
      <span className={emphasis ? "price" : undefined} style={{ textAlign: "right" }}>
        {children}
      </span>
    </div>
  );
}

/** "YYYY-MM-DDTHH:mm" waktu lokal, untuk value/min pada <input type="datetime-local">. */
function toLocalInput(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  const yyyy = date.getFullYear();
  const mm = pad(date.getMonth() + 1);
  const dd = pad(date.getDate());
  const hh = pad(date.getHours());
  const mi = pad(date.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}

export function BookingForm({
  carModelId,
  dailyRate,
  chauffeurPackage,
  securityDeposit,
}: {
  carModelId: string;
  dailyRate: number | null;
  chauffeurPackage: number | null;
  securityDeposit: number | null;
}) {
  const { t } = useI18n();
  const [state, formAction, isPending] = useActionState(createBookingAction, initialState);

  // Local state only controls the display of conditional fields.
  const [mode, setMode] = useState<RentalMode>("SELF_DRIVE");
  const [handoverMethod, setHandoverMethod] = useState<HandoverMethod>("PICKUP");
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<AppliedPromo | null>(null);

  // Indikator ketersediaan live (US 8/16/48): dicek via GET /api/availability
  // setiap kali periode berubah, dengan debounce + pembatalan request usang.
  type Availability = "checking" | "available" | "unavailable" | "unknown";
  const [availability, setAvailability] = useState<Availability>("unknown");

  // Prevent selecting past dates: start can't be before now, end can't be before start.
  const minStart = toLocalInput(new Date());
  const minEnd = startAt || minStart;

  const startDate = startAt ? new Date(startAt) : null;
  const endDate = endAt ? new Date(endAt) : null;
  const validPeriod =
    startDate != null &&
    endDate != null &&
    !Number.isNaN(startDate.getTime()) &&
    !Number.isNaN(endDate.getTime()) &&
    endDate.getTime() > startDate.getTime();

  // Total dasar (tanpa diskon) dipakai untuk menghitung potongan promo PERCENT.
  const baseQuote = validPeriod
    ? quoteBooking({ mode, dailyRate, chauffeurPackage, startAt: startDate!, endAt: endDate! })
    : null;
  const discountIdr =
    appliedPromo && baseQuote?.hasRate
      ? appliedPromo.kind === "PERCENT"
        ? Math.floor((baseQuote.total * appliedPromo.value) / 100)
        : appliedPromo.value
      : 0;
  const quote = validPeriod
    ? quoteBooking({
        mode,
        dailyRate,
        chauffeurPackage,
        startAt: startDate!,
        endAt: endDate!,
        securityDeposit,
        discountIdr,
      })
    : null;

  // Cek ketersediaan tiap kali periode (atau mobil) berubah. Debounce ~400ms
  // supaya tidak spam saat user masih mengetik/menggeser input datetime-local;
  // AbortController membatalkan request usang jika periode berubah lagi
  // sebelum respons sebelumnya kembali. Kegagalan jaringan → "unknown" (tidak
  // memblokir form; validasi final tetap dilakukan server saat submit).
  useEffect(() => {
    const s = startAt ? new Date(startAt) : null;
    const e = endAt ? new Date(endAt) : null;
    const periodValid =
      s != null && e != null && !Number.isNaN(s.getTime()) && !Number.isNaN(e.getTime()) && e.getTime() > s.getTime();

    if (!periodValid) {
      setAvailability("unknown");
      return;
    }

    setAvailability("checking");
    const controller = new AbortController();
    const timer = setTimeout(() => {
      const params = new URLSearchParams({
        carModelId,
        startAt: s.toISOString(),
        endAt: e.toISOString(),
      });
      fetch(`/api/availability?${params.toString()}`, { signal: controller.signal })
        .then((res) => (res.ok ? res.json() : Promise.reject(new Error("bad response"))))
        .then((data: { available?: boolean }) => {
          setAvailability(data.available === true ? "available" : data.available === false ? "unavailable" : "unknown");
        })
        .catch((err: unknown) => {
          if (err instanceof DOMException && err.name === "AbortError") return;
          setAvailability("unknown");
        });
    }, 400);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [startAt, endAt, carModelId]);

  return (
    <form action={formAction}>
      <input type="hidden" name="carModelId" value={carModelId} />
      <input type="hidden" name="promoCode" value={appliedPromo?.code ?? ""} />

      {/* Mode */}
      <section className="stack reveal" style={{ gap: "0.75rem" }}>
        <SectionHead icon="key">{t("booking.form.mode.title")}</SectionHead>
        <Field label={t("booking.form.mode.question")} htmlFor="mode">
          <select
            id="mode"
            name="mode"
            value={mode}
            onChange={(e) => setMode(e.target.value as RentalMode)}
            required
          >
            <option value="SELF_DRIVE">{t("common.mode.selfDrive")}</option>
            <option value="CHAUFFEUR">{t("common.mode.chauffeur")}</option>
          </select>
        </Field>
      </section>

      <hr className="divider" style={{ margin: "1.6rem 0" }} />

      {/* Period */}
      <section className="stack reveal" style={{ gap: "0.75rem" }}>
        <SectionHead icon="calendar">{t("booking.form.period.title")}</SectionHead>
        <div className="row" style={{ gap: "1rem", alignItems: "flex-start" }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <Field label={t("booking.form.period.start")} htmlFor="startAt">
              <input
                id="startAt"
                name="startAt"
                type="datetime-local"
                required
                value={startAt}
                min={minStart}
                onChange={(e) => setStartAt(e.target.value)}
              />
            </Field>
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <Field label={t("booking.form.period.end")} htmlFor="endAt">
              <input
                id="endAt"
                name="endAt"
                type="datetime-local"
                required
                value={endAt}
                min={minEnd}
                onChange={(e) => setEndAt(e.target.value)}
              />
            </Field>
          </div>
        </div>

        {availability !== "unknown" ? (
          <div className="row" style={{ gap: "0.5rem", alignItems: "center" }}>
            <Icon
              name={availability === "checking" ? "clock" : availability === "available" ? "check" : "shield"}
              size={14}
              style={{
                color:
                  availability === "available"
                    ? "var(--ok)"
                    : availability === "unavailable"
                      ? "var(--danger)"
                      : undefined,
              }}
            />
            <span
              className="muted"
              style={{
                fontSize: "0.8rem",
                color:
                  availability === "available"
                    ? "var(--ok)"
                    : availability === "unavailable"
                      ? "var(--danger)"
                      : undefined,
              }}
            >
              {t(
                availability === "checking"
                  ? "booking.form.avail.checking"
                  : availability === "available"
                    ? "booking.form.avail.ok"
                    : "booking.form.avail.full",
              )}
            </span>
          </div>
        ) : null}
      </section>

      <hr className="divider" style={{ margin: "1.6rem 0" }} />

      {/* Handover */}
      <section className="stack reveal" style={{ gap: "0.75rem" }}>
        <SectionHead icon="mapPin">{t("booking.form.handover.title")}</SectionHead>
        {mode === "SELF_DRIVE" ? (
          <>
            <Field label={t("booking.form.handover.method")} htmlFor="handoverMethod">
              <select
                id="handoverMethod"
                name="handoverMethod"
                value={handoverMethod}
                onChange={(e) => setHandoverMethod(e.target.value as HandoverMethod)}
                required
              >
                <option value="PICKUP">{t("booking.form.handover.pickup")}</option>
                <option value="DELIVERY">{t("booking.form.handover.delivery")}</option>
              </select>
            </Field>

            {handoverMethod === "DELIVERY" ? (
              <Field label={t("booking.form.handover.deliveryAddress")} htmlFor="deliveryAddress">
                <input
                  id="deliveryAddress"
                  name="deliveryAddress"
                  type="text"
                  placeholder={t("booking.form.handover.deliveryPlaceholder")}
                  required
                />
              </Field>
            ) : null}
          </>
        ) : (
          <Field label={t("booking.form.handover.pickupPoint")} htmlFor="chauffeurPickup">
            <input
              id="chauffeurPickup"
              name="chauffeurPickup"
              type="text"
              placeholder={t("booking.form.handover.pickupPlaceholder")}
              required
            />
          </Field>
        )}
      </section>

      <hr className="divider" style={{ margin: "1.6rem 0" }} />

      {/* Your details */}
      <section className="stack reveal" style={{ gap: "0.75rem" }}>
        <SectionHead icon="user">{t("booking.form.details.title")}</SectionHead>
        <div className="row" style={{ gap: "1rem", alignItems: "flex-start" }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <Field label={t("booking.form.details.name")} htmlFor="name">
              <input
                id="name"
                name="name"
                type="text"
                placeholder={t("booking.form.details.namePlaceholder")}
                required
              />
            </Field>
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <Field label={t("booking.form.details.phone")} htmlFor="phone">
              <input
                id="phone"
                name="phone"
                type="tel"
                placeholder={t("booking.form.details.phonePlaceholder")}
                required
              />
            </Field>
          </div>
        </div>
      </section>

      <hr className="divider" style={{ margin: "1.6rem 0" }} />

      {/* Kode Promo (fitur #1) */}
      <section className="stack reveal" style={{ gap: "0.75rem" }}>
        <SectionHead icon="check">{t("booking.promo.title")}</SectionHead>
        <PromoField
          applied={appliedPromo}
          onApplied={setAppliedPromo}
          onRemove={() => setAppliedPromo(null)}
        />
      </section>

      <hr className="divider" style={{ margin: "1.6rem 0" }} />

      {/* Cost summary — live estimate, recomputed by the server at payment time */}
      <section className="stack reveal" style={{ gap: "0.75rem" }}>
        <SectionHead icon="shield">{t("booking.form.estimate.title")}</SectionHead>

        {!quote ? (
          <p className="muted" style={{ margin: 0, fontSize: "0.85rem" }}>
            {t("booking.form.estimate.selectPeriod")}
          </p>
        ) : !quote.hasRate ? (
          <p className="muted" style={{ margin: 0, fontSize: "0.85rem" }}>
            {t("booking.form.estimate.noRate")}
          </p>
        ) : (
          <div>
            <CostRow
              label={
                <>
                  <Money idr={quote.ratePerDay} />{" "}
                  {mode === "CHAUFFEUR" ? t("common.per12h") : t("common.perDay")}
                </>
              }
            >
              &times; {quote.days} {t("booking.form.estimate.daysUnit")}
            </CostRow>
            <CostRow label={t("booking.form.estimate.total")} emphasis={quote.discount === 0}>
              <Money idr={quote.total} />
            </CostRow>
            {quote.discount > 0 ? (
              <CostRow
                label={`${t("booking.form.estimate.discountPrefix")} (${appliedPromo?.code ?? ""})`}
              >
                &minus;<Money idr={quote.discount} />
              </CostRow>
            ) : null}
            {quote.discount > 0 ? (
              <CostRow label={t("booking.form.estimate.netTotal")} emphasis>
                <Money idr={quote.netTotal} />
              </CostRow>
            ) : null}
            <CostRow label={t("booking.form.estimate.dp")}>
              <Money idr={quote.dp} />
            </CostRow>
            <CostRow label={t("booking.form.estimate.balance")} last={quote.deposit === 0}>
              <Money idr={quote.balance} />
            </CostRow>
            {quote.deposit > 0 ? (
              <CostRow label={t("booking.form.estimate.deposit")}>
                <Money idr={quote.deposit} />
              </CostRow>
            ) : null}
            {quote.deposit > 0 ? (
              <CostRow label={t("booking.form.estimate.payNow")} emphasis last>
                <Money idr={quote.payNow} />
              </CostRow>
            ) : null}
          </div>
        )}

        <p className="muted" style={{ margin: 0, fontSize: "0.75rem" }}>
          {t("booking.form.estimate.footnote")}
        </p>
        <p className="muted" style={{ margin: 0, fontSize: "0.72rem" }}>
          {t("common.priceNote")}
        </p>
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
          disabled={isPending || availability === "unavailable"}
          title={availability === "unavailable" ? t("booking.form.avail.full") : undefined}
          style={{ width: "100%", padding: "0.9rem 1.35rem" }}
        >
          {isPending ? (
            t("booking.form.submitting")
          ) : (
            <>
              {t("booking.form.submit")} <Icon name="arrow" size={16} />
            </>
          )}
        </button>
      </div>
    </form>
  );
}

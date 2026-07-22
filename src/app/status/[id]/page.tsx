// Halaman Status Booking (Server Component). Menampilkan proyeksi BookingView
// dari DB (Prisma) beserta timeline/stepper status.
//
// Deposit jaminan + Kode Promo (fitur #1/#2): quote di halaman ini dihitung dari
// SNAPSHOT Booking (promoCode/discountAmount/depositAmount) via quoteBooking — sumber
// nominal identik dengan yang dipakai payBookingAction saat tombol ditekan.

import { getBooking } from "@/lib/bookings";
import { getCarModel } from "@/lib/catalog";
import { quoteBooking } from "@/lib/pricing";
import { getConversationForBooking } from "@/lib/conversations";
import {
  formatWIB,
  STATUS_LABEL,
  statusBadgeClass,
} from "@/ui/format";
import { Container, Card, CardBody, ButtonLink, Field, Badge } from "@/ui/primitives";
import { Icon } from "@/ui/icons";
import { Money } from "@/i18n/client";
import { getT } from "@/i18n/server";
import { bookingMessages } from "@/i18n/messages/booking";
import { waLink } from "@/lib/site-config";
import type { BookingStatus, RentalMode } from "@/domain/booking/booking";
import type { ReactNode } from "react";
import { payBookingAction, submitVerificationAction, cancelAction } from "./actions";
import { HoldCountdown } from "./hold-countdown";
import { RescheduleForm } from "./reschedule-form";
import { ChatBox } from "./chat-box";

/** Terminal state yang menghentikan happy-path (ADR-0001). */
const TERMINAL: BookingStatus[] = ["EXPIRED", "CANCELLED"];

/** Status "sebelum berjalan" — masih boleh dibatalkan / dijadwalkan ulang (US 24-28). */
const CAN_MODIFY: BookingStatus[] = ["REQUESTED", "AWAITING_APPROVAL", "CONFIRMED"];

/** Offset WIB (Asia/Jakarta, UTC+7) dalam milidetik — samakan dengan tier refund di
 *  BookingService (ADR-0004); di sini HANYA untuk menampilkan estimasi, bukan sumber
 *  kebenaran (service tetap yang menghitung refund sesungguhnya). */
const WIB_OFFSET_MS = 7 * 60 * 60 * 1000;
function wibDayIndex(instant: Date): number {
  return Math.floor((instant.getTime() + WIB_OFFSET_MS) / 86_400_000);
}
function wibCalendarDaysUntil(startAt: Date, now: Date): number {
  return wibDayIndex(startAt) - wibDayIndex(now);
}

/** Estimasi tampilan kebijakan refund tier (ADR-0004) — nominal aktual tetap dihitung
 *  server oleh BookingService.cancel saat tombol ditekan. */
function refundEstimate(
  dpAmount: number | undefined,
  startAt: Date,
  now: Date,
  t: (key: string) => string,
): { days: number; label: string; amount: number | null } {
  const days = wibCalendarDaysUntil(startAt, now);
  if (days >= 7) {
    return { days, label: t("booking.status.modify.tier1"), amount: dpAmount ?? null };
  }
  if (days >= 3) {
    return {
      days,
      label: t("booking.status.modify.tier2"),
      amount: dpAmount != null ? Math.floor(dpAmount * 0.5) : null,
    };
  }
  return { days, label: t("booking.status.modify.tier3"), amount: dpAmount != null ? 0 : null };
}

/** Nilai default untuk `min` pada input datetime-local (format lokal "YYYY-MM-DDTHH:mm"). */
function toLocalInputValue(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

type Step = { status: BookingStatus; label: string };

/** Susun langkah happy-path sesuai mode. AWAITING_APPROVAL hanya untuk SELF_DRIVE. */
function steps(mode: RentalMode): Step[] {
  const order: BookingStatus[] = [
    "REQUESTED",
    "AWAITING_APPROVAL",
    "CONFIRMED",
    "ONGOING",
    "COMPLETED",
  ];
  return order
    .filter((s) => (s === "AWAITING_APPROVAL" ? mode === "SELF_DRIVE" : true))
    .map((s) => ({ status: s, label: STATUS_LABEL[s] }));
}

/** Baris detail hairline: micro-label + nilai, sejajar rapi. */
function DetailRow({
  icon,
  label,
  children,
  last,
}: {
  icon: Parameters<typeof Icon>[0]["name"];
  label: string;
  children: ReactNode;
  last?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "baseline",
        justifyContent: "space-between",
        gap: "1.5rem",
        padding: "0.9rem 0",
        borderBottom: last ? "none" : "1px solid var(--border)",
      }}
    >
      <span
        className="eyebrow"
        style={{ display: "inline-flex", alignItems: "center", gap: "0.55rem", flex: "0 0 auto" }}
      >
        <Icon name={icon} size={15} style={{ color: "var(--accent)", opacity: 0.85 }} />
        {label}
      </span>
      <span style={{ textAlign: "right", color: "var(--text)", fontSize: "0.95rem" }}>
        {children}
      </span>
    </div>
  );
}

export default async function StatusPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const b = await getBooking(id);
  const { t } = await getT(bookingMessages);

  if (!b) {
    return (
      <Container style={{ padding: "4rem 0" }}>
        <div className="reveal" style={{ maxWidth: 560, margin: "0 auto" }}>
          <div className="kicker" style={{ marginBottom: "0.9rem" }}>
            {t("booking.status.kicker")} · {id}
          </div>
          <h1 style={{ margin: 0 }}>{t("booking.status.notFound.title")}</h1>
          <div style={{ width: 56, height: 2, background: "var(--accent)", margin: "1.4rem 0" }} />
          <p className="muted" style={{ margin: "0 0 1.75rem" }}>
            {t("booking.status.notFound.bodyPrefix")} &ldquo;{id}&rdquo;.{" "}
            {t("booking.status.notFound.bodySuffix")}
          </p>
          <div className="row" style={{ gap: "0.9rem" }}>
            <ButtonLink href="/" variant="primary">
              {t("booking.status.notFound.backHome")}
            </ButtonLink>
            <a
              className="btn"
              href={waLink(`Hi Prestige, I can't find my booking ${id}.`)}
              target="_blank"
              rel="noopener noreferrer"
            >
              {t("booking.status.notFound.needHelp")}
            </a>
          </div>
        </div>
      </Container>
    );
  }

  const isTerminal = TERMINAL.includes(b.status);
  const flow = steps(b.mode);
  const currentIndex = flow.findIndex((s) => s.status === b.status);

  const now = new Date();
  const canModify = CAN_MODIFY.includes(b.status);
  const refund = refundEstimate(b.dpAmount, b.startAt, now, t);
  const minDateTime = toLocalInputValue(now);

  // Quote dari snapshot Booking (promoCode/discountAmount/depositAmount) — sumber
  // nominal identik dengan payBookingAction, dipakai untuk label tombol bayar.
  const car = await getCarModel(b.carModelId);
  const quote = quoteBooking({
    mode: b.mode,
    dailyRate: car?.dailyRate ?? null,
    chauffeurPackage: car?.chauffeurPackage ?? null,
    startAt: b.startAt,
    endAt: b.endAt,
    securityDeposit: b.depositAmount ?? car?.securityDeposit ?? null,
    discountIdr: b.discountAmount ?? null,
  });

  const hasPromo = b.discountAmount != null && b.discountAmount > 0;
  const hasDeposit = b.depositAmount != null && b.depositAmount > 0;

  const needsVerificationForm =
    b.mode === "SELF_DRIVE" &&
    !b.verificationSubmittedAt &&
    (b.status === "REQUESTED" || b.status === "AWAITING_APPROVAL");
  const verificationSubmitted = b.mode === "SELF_DRIVE" && !!b.verificationSubmittedAt;

  const conversation = await getConversationForBooking(b.id);

  return (
    <Container style={{ padding: "3.5rem 0 4.5rem" }}>
      <div className="stack" style={{ gap: "2rem", maxWidth: 760, margin: "0 auto" }}>
        {/* 1. Header — id kicker, serif car name, status badge */}
        <header className="reveal">
          <div className="kicker" style={{ marginBottom: "0.85rem" }}>
            {t("booking.status.kicker")} · {b.id}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: "1.25rem",
              flexWrap: "wrap",
            }}
          >
            <h1 style={{ margin: 0, fontSize: "clamp(2rem, 5vw, 3.2rem)" }}>{b.carName}</h1>
            <span className={statusBadgeClass(b.status)} style={{ marginTop: "0.4rem" }}>
              {STATUS_LABEL[b.status]}
            </span>
          </div>
          <div style={{ width: 56, height: 2, background: "var(--accent)", marginTop: "1.4rem" }} />
        </header>

        {/* 2. Timeline / stepper */}
        <div className="reveal">
        <Card style={{ borderColor: "var(--border)" }}>
          <CardBody>
            <div className="eyebrow" style={{ marginBottom: "1.5rem" }}>
              {t("booking.status.orderStatus")}
            </div>

            {isTerminal ? (
              <div
                style={{
                  display: "flex",
                  gap: "1rem",
                  padding: "0.5rem 0",
                  alignItems: "flex-start",
                }}
              >
                <span
                  aria-hidden
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "2.4rem",
                    height: "2.4rem",
                    borderRadius: "999px",
                    flex: "0 0 auto",
                    color: "var(--danger)",
                    border: "1px solid color-mix(in srgb, var(--danger) 45%, transparent)",
                    background: "color-mix(in srgb, var(--danger) 12%, transparent)",
                  }}
                >
                  <Icon name={b.status === "EXPIRED" ? "clock" : "shield"} size={18} />
                </span>
                <div>
                  <div
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "1.35rem",
                      color: "var(--text)",
                      lineHeight: 1.2,
                    }}
                  >
                    {STATUS_LABEL[b.status]}
                  </div>
                  <p className="muted" style={{ margin: "0.4rem 0 0", maxWidth: 460 }}>
                    {b.status === "EXPIRED"
                      ? t("booking.status.expiredBody")
                      : t("booking.status.cancelledBody")}
                  </p>
                </div>
              </div>
            ) : (
              <ol style={{ listStyle: "none", margin: 0, padding: 0 }}>
                {flow.map((step, i) => {
                  const done = currentIndex >= 0 && i < currentIndex;
                  const current = i === currentIndex;
                  const isLast = i === flow.length - 1;
                  const dotColor = current
                    ? "var(--accent)"
                    : done
                      ? "var(--ok)"
                      : "var(--border-strong)";
                  const lineColor = done ? "var(--ok)" : "var(--border)";
                  return (
                    <li
                      key={step.status}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1.5rem 1fr",
                        columnGap: "1rem",
                      }}
                    >
                      {/* Marker: dot + connector */}
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                        }}
                      >
                        <span
                          aria-hidden
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: "1.5rem",
                            height: "1.5rem",
                            borderRadius: "999px",
                            flex: "0 0 auto",
                            background: current
                              ? "var(--accent)"
                              : done
                                ? "var(--ok)"
                                : "transparent",
                            border: `1.5px solid ${dotColor}`,
                            boxShadow: current
                              ? "0 0 0 4px var(--accent-soft)"
                              : "none",
                          }}
                        >
                          {done ? (
                            <Icon name="check" size={13} style={{ color: "var(--bg)" }} />
                          ) : current ? (
                            <span
                              style={{
                                width: "0.42rem",
                                height: "0.42rem",
                                borderRadius: "999px",
                                background: "var(--bg)",
                              }}
                            />
                          ) : null}
                        </span>
                        {!isLast ? (
                          <span
                            style={{
                              width: 2,
                              flex: 1,
                              minHeight: "1.6rem",
                              background: lineColor,
                            }}
                          />
                        ) : null}
                      </div>

                      {/* Content */}
                      <div style={{ paddingBottom: isLast ? 0 : "1.6rem" }}>
                        <div
                          style={{
                            fontFamily: "var(--font-display)",
                            fontSize: "1.15rem",
                            lineHeight: 1.2,
                            color: current
                              ? "var(--accent)"
                              : done
                                ? "var(--text)"
                                : "var(--muted)",
                          }}
                        >
                          {step.label}
                        </div>
                        <div
                          className="eyebrow"
                          style={{
                            marginTop: "0.3rem",
                            color: current
                              ? "var(--accent)"
                              : done
                                ? "var(--ok)"
                                : "var(--muted-dim)",
                          }}
                        >
                          {current ? "In progress" : done ? "Completed" : "Upcoming"}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ol>
            )}
          </CardBody>
        </Card>
        </div>

        {/* 3. Detail booking — hairline rows */}
        <div className="reveal">
        <Card style={{ borderColor: "var(--border)" }}>
          <CardBody>
            <div className="eyebrow" style={{ marginBottom: "0.5rem" }}>
              {t("booking.status.details.title")}
            </div>
            <DetailRow icon="key" label={t("booking.status.details.car")}>
              {b.carName}
            </DetailRow>
            <DetailRow icon="steering" label={t("booking.status.details.mode")}>
              {b.mode === "SELF_DRIVE" ? t("common.mode.selfDrive") : t("common.mode.chauffeur")}
            </DetailRow>
            <DetailRow icon="calendar" label={t("booking.status.details.period")}>
              {formatWIB(b.startAt)} &ndash; {formatWIB(b.endAt)}
            </DetailRow>
            <DetailRow icon="user" label={t("booking.status.details.customer")}>
              {b.customerName}
              <span className="muted" style={{ display: "block", fontSize: "0.85rem" }}>
                {b.customerPhone}
              </span>
            </DetailRow>
            <DetailRow icon="mapPin" label={t("booking.status.details.unit")}>
              {b.allocatedUnit ?? (
                <span className="muted">{t("booking.status.details.unitPending")}</span>
              )}
            </DetailRow>
            <DetailRow icon="shield" label={t("booking.status.details.dpLabel")}>
              {b.dpAmount != null ? (
                <span className="price">
                  <Money idr={b.dpAmount} />
                </span>
              ) : (
                <span className="muted">&mdash;</span>
              )}
            </DetailRow>
            <DetailRow
              icon="check"
              label={t("booking.status.details.balance")}
              last={!hasPromo && !hasDeposit}
            >
              {b.settlementAmount != null ? (
                <span className="price">
                  <Money idr={b.settlementAmount} />
                </span>
              ) : (
                <span className="muted">&mdash;</span>
              )}
            </DetailRow>
            {hasPromo ? (
              <DetailRow
                icon="check"
                label={t("booking.status.details.promo")}
                last={!hasDeposit}
              >
                <span className="price">
                  &minus;<Money idr={b.discountAmount!} />
                </span>
                {b.promoCode ? (
                  <span className="muted" style={{ display: "block", fontSize: "0.8rem" }}>
                    {b.promoCode}
                  </span>
                ) : null}
              </DetailRow>
            ) : null}
            {hasDeposit ? (
              <DetailRow icon="shield" label={t("booking.status.details.deposit")} last>
                <span className="price">
                  <Money idr={b.depositAmount!} />
                </span>
                <span className="muted" style={{ display: "block", fontSize: "0.8rem" }}>
                  {t("booking.status.details.depositNote")}
                </span>
              </DetailRow>
            ) : null}
          </CardBody>
        </Card>
        </div>
        <p className="muted" style={{ margin: 0, fontSize: "0.72rem" }}>
          {t("common.priceNote")}
        </p>

        {/* 3b. Verifikasi Pengemudi (US 19) — hanya untuk Self-Drive */}
        {needsVerificationForm || verificationSubmitted ? (
          <div className="reveal">
            <Card style={{ borderColor: "var(--border)" }}>
              <CardBody>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "0.9rem",
                    flexWrap: "wrap",
                    gap: "0.6rem",
                  }}
                >
                  <div className="eyebrow">{t("booking.status.verification.title")}</div>
                  {verificationSubmitted ? (
                    <Badge variant="accent">{t("booking.status.verification.pendingBadge")}</Badge>
                  ) : null}
                </div>

                {verificationSubmitted ? (
                  <div>
                    <p className="muted" style={{ margin: "0 0 0.75rem" }}>
                      {t("booking.status.verification.submittedNote")}
                    </p>
                    <DetailRow icon="user" label={t("booking.status.verification.licenseName")}>
                      {b.licenseName ?? "—"}
                    </DetailRow>
                    <DetailRow icon="key" label={t("booking.status.verification.licenseNumber")}>
                      {b.licenseNumber ?? "—"}
                    </DetailRow>
                    <DetailRow icon="shield" label={t("booking.status.verification.ktpNumber")} last>
                      {b.ktpNumber ?? "—"}
                    </DetailRow>
                  </div>
                ) : (
                  <form action={submitVerificationAction} className="stack" style={{ gap: "0.9rem" }}>
                    <input type="hidden" name="bookingId" value={b.id} />
                    <p className="muted" style={{ margin: 0, fontSize: "0.85rem" }}>
                      {t("booking.status.verification.intro")}
                    </p>
                    <Field label={t("booking.status.verification.licenseName")} htmlFor="licenseName">
                      <input id="licenseName" name="licenseName" required />
                    </Field>
                    <Field label={t("booking.status.verification.licenseNumber")} htmlFor="licenseNumber">
                      <input id="licenseNumber" name="licenseNumber" required />
                    </Field>
                    <Field label={t("booking.status.verification.ktpNumber")} htmlFor="ktpNumber">
                      <input id="ktpNumber" name="ktpNumber" required />
                    </Field>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      style={{ alignSelf: "flex-start" }}
                    >
                      {t("booking.status.verification.submit")}
                    </button>
                  </form>
                )}
              </CardBody>
            </Card>
          </div>
        ) : null}

        {/* 3c. Batalkan & Reschedule (US 24-28) — hanya sebelum booking berjalan */}
        {canModify ? (
          <div className="reveal">
            <Card style={{ borderColor: "var(--border)" }}>
              <CardBody>
                <div className="eyebrow" style={{ marginBottom: "1rem" }}>
                  {t("booking.status.modify.title")}
                </div>

                <details>
                  <summary
                    style={{
                      cursor: "pointer",
                      color: "var(--text)",
                      fontFamily: "var(--font-display)",
                      fontSize: "1.05rem",
                    }}
                  >
                    {t("booking.status.modify.cancelSummary")}
                  </summary>
                  <div className="stack" style={{ gap: "0.9rem", marginTop: "1rem" }}>
                    <p className="muted" style={{ margin: 0, fontSize: "0.85rem" }}>
                      {t("booking.status.modify.cancelIntro")}
                    </p>
                    <ul
                      style={{
                        margin: 0,
                        paddingLeft: "1.2rem",
                        color: "var(--muted)",
                        fontSize: "0.85rem",
                      }}
                    >
                      <li>{t("booking.status.modify.tier1")}</li>
                      <li>{t("booking.status.modify.tier2")}</li>
                      <li>{t("booking.status.modify.tier3")}</li>
                    </ul>
                    {b.dpAmount != null ? (
                      <p style={{ margin: 0 }}>
                        {t("booking.status.modify.estimateLabel")} (H
                        {refund.days >= 0 ? `-${refund.days}` : `+${Math.abs(refund.days)}`}):{" "}
                        <span className="price">
                          {refund.amount != null ? <Money idr={refund.amount} /> : "—"}
                        </span>
                        <span className="muted" style={{ display: "block", fontSize: "0.8rem" }}>
                          {refund.label}
                        </span>
                      </p>
                    ) : null}
                    <form action={cancelAction} style={{ display: "contents" }}>
                      <input type="hidden" name="bookingId" value={b.id} />
                      <button
                        type="submit"
                        className="btn"
                        style={{
                          alignSelf: "flex-start",
                          borderColor: "var(--danger)",
                          color: "var(--danger)",
                        }}
                      >
                        {t("booking.status.modify.cancelButton")}
                      </button>
                    </form>
                  </div>
                </details>

                <div className="divider" style={{ margin: "1.25rem 0" }} />

                <details>
                  <summary
                    style={{
                      cursor: "pointer",
                      color: "var(--text)",
                      fontFamily: "var(--font-display)",
                      fontSize: "1.05rem",
                    }}
                  >
                    {t("booking.status.modify.rescheduleSummary")}
                  </summary>
                  <div style={{ marginTop: "1rem" }}>
                    <RescheduleForm bookingId={b.id} minDateTime={minDateTime} />
                  </div>
                </details>
              </CardBody>
            </Card>
          </div>
        ) : null}

        {/* 3d. Chat pelanggan (US 30-33) — section terakhir sebelum footer CTA */}
        <div className="reveal">
          <Card style={{ borderColor: "var(--border)" }}>
            <CardBody>
              <ChatBox
                bookingId={b.id}
                messages={conversation?.messages ?? []}
                waHref={waLink(
                  `Hi Prestige, saya ingin lanjut chat soal booking ${b.id} (${b.carName}).`,
                )}
              />
            </CardBody>
          </Card>
        </div>

        {/* 4. CTA — payment + WhatsApp help */}
        <div
          className="reveal"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.9rem",
            flexWrap: "wrap",
          }}
        >
          {b.status === "REQUESTED" && b.holdExpiresAt ? (
            <HoldCountdown expiresAt={b.holdExpiresAt.toISOString()} />
          ) : null}
          {b.status === "REQUESTED" ? (
            <form action={payBookingAction} style={{ display: "contents" }}>
              <input type="hidden" name="bookingId" value={b.id} />
              <input type="hidden" name="intent" value="DP" />
              <button type="submit" className="btn btn-primary">
                {t("booking.status.payDp")} &mdash; <Money idr={quote.payNow} />
              </button>
            </form>
          ) : b.status === "CONFIRMED" && b.settlementAmount == null ? (
            <form action={payBookingAction} style={{ display: "contents" }}>
              <input type="hidden" name="bookingId" value={b.id} />
              <input type="hidden" name="intent" value="SETTLEMENT" />
              <button type="submit" className="btn btn-primary">
                {t("booking.status.payBalance")} &mdash; <Money idr={quote.balance} />
              </button>
            </form>
          ) : null}
          {(b.status === "REQUESTED" ||
            (b.status === "CONFIRMED" && b.settlementAmount == null)) && (
            <span className="muted" style={{ fontSize: "0.72rem", width: "100%" }}>
              {t("booking.status.prototypeNote")}
            </span>
          )}
          {b.dpAmount != null ? (
            <a className="btn btn-ghost" href={`/receipt/${b.id}`}>
              {t("booking.status.viewReceipt")}
            </a>
          ) : null}
          <a
            className="btn btn-ghost"
            href={waLink(
              `Hi Prestige, I have a question about booking ${b.id} (${b.carName}).`,
            )}
            target="_blank"
            rel="noopener noreferrer"
          >
            {t("booking.status.needHelp")}
          </a>
        </div>
      </div>
    </Container>
  );
}

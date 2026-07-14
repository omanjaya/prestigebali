// Halaman Status Booking (Server Component). Menampilkan proyeksi BookingView
// dari DB (Prisma) beserta timeline/stepper status.

import { getBooking } from "@/lib/bookings";
import {
  formatIDR,
  formatWIB,
  MODE_LABEL,
  STATUS_LABEL,
  statusBadgeClass,
} from "@/ui/format";
import { Container, Card, CardBody, ButtonLink } from "@/ui/primitives";
import { Icon } from "@/ui/icons";
import { waLink } from "@/lib/site-config";
import type { BookingStatus, RentalMode } from "@/domain/booking/booking";
import type { ReactNode } from "react";

/** Terminal state yang menghentikan happy-path (ADR-0001). */
const TERMINAL: BookingStatus[] = ["EXPIRED", "CANCELLED"];

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

  if (!b) {
    return (
      <Container style={{ padding: "4rem 0" }}>
        <div className="reveal" style={{ maxWidth: 560, margin: "0 auto" }}>
          <div className="kicker" style={{ marginBottom: "0.9rem" }}>
            Booking · {id}
          </div>
          <h1 style={{ margin: 0 }}>Booking not found</h1>
          <div style={{ width: 56, height: 2, background: "var(--accent)", margin: "1.4rem 0" }} />
          <p className="muted" style={{ margin: "0 0 1.75rem" }}>
            We couldn&rsquo;t find a booking for code &ldquo;{id}&rdquo;. Please double-check the
            link, or reach us and we&rsquo;ll locate it for you.
          </p>
          <div className="row" style={{ gap: "0.9rem" }}>
            <ButtonLink href="/" variant="primary">
              Back to Home
            </ButtonLink>
            <a
              className="btn"
              href={waLink(`Hi Prestige, I can't find my booking ${id}.`)}
              target="_blank"
              rel="noopener noreferrer"
            >
              Need help?
            </a>
          </div>
        </div>
      </Container>
    );
  }

  const isTerminal = TERMINAL.includes(b.status);
  const flow = steps(b.mode);
  const currentIndex = flow.findIndex((s) => s.status === b.status);

  return (
    <Container style={{ padding: "3.5rem 0 4.5rem" }}>
      <div className="stack" style={{ gap: "2rem", maxWidth: 760, margin: "0 auto" }}>
        {/* 1. Header — id kicker, serif car name, status badge */}
        <header className="reveal">
          <div className="kicker" style={{ marginBottom: "0.85rem" }}>
            Booking · {b.id}
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
              Order Status
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
                      ? "The payment window has elapsed and the stock hold has been released."
                      : "This booking has been cancelled."}
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
              Booking Details
            </div>
            <DetailRow icon="key" label="Car">
              {b.carName}
            </DetailRow>
            <DetailRow icon="steering" label="Mode">
              {MODE_LABEL[b.mode]}
            </DetailRow>
            <DetailRow icon="calendar" label="Period">
              {formatWIB(b.startAt)} &ndash; {formatWIB(b.endAt)}
            </DetailRow>
            <DetailRow icon="user" label="Customer">
              {b.customerName}
              <span className="muted" style={{ display: "block", fontSize: "0.85rem" }}>
                {b.customerPhone}
              </span>
            </DetailRow>
            <DetailRow icon="mapPin" label="Allocated unit">
              {b.allocatedUnit ?? (
                <span className="muted">Not yet allocated</span>
              )}
            </DetailRow>
            <DetailRow icon="shield" label="Deposit">
              {b.dpAmount != null ? (
                <span className="price">{formatIDR(b.dpAmount)}</span>
              ) : (
                <span className="muted">&mdash;</span>
              )}
            </DetailRow>
            <DetailRow icon="check" label="Balance" last>
              {b.settlementAmount != null ? (
                <span className="price">{formatIDR(b.settlementAmount)}</span>
              ) : (
                <span className="muted">&mdash;</span>
              )}
            </DetailRow>
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
          {b.status === "REQUESTED" ? (
            /* TODO: wire ke pembayaran (Midtrans) */
            <button type="button" className="btn btn-primary">
              Pay Deposit
            </button>
          ) : b.status === "CONFIRMED" && b.settlementAmount == null ? (
            /* TODO: wire ke pembayaran (Midtrans) */
            <button type="button" className="btn btn-primary">
              Pay Balance
            </button>
          ) : null}
          <a
            className="btn btn-ghost"
            href={waLink(
              `Hi Prestige, I have a question about booking ${b.id} (${b.carName}).`,
            )}
            target="_blank"
            rel="noopener noreferrer"
          >
            Need help? Chat on WhatsApp
          </a>
        </div>
      </div>
    </Container>
  );
}

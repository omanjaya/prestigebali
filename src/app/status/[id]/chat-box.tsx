"use client";

// Chat widget pelanggan (US 30-33) — bubble kiri = ADMIN, kanan = CUSTOMER. Pesan awal
// dimuat server-side (getConversationForBooking) dan diteruskan sebagai prop; refresh
// sederhana lewat router.refresh() (tanpa polling/websocket). WhatsApp tetap tersedia
// sebagai tautan handoff opsional (PRD).

import { useRef } from "react";
import { useRouter } from "next/navigation";

import type { MessageView } from "@/lib/conversations";
import { useI18n } from "@/i18n/client";
import { sendMessageAction } from "./actions";

export function ChatBox({
  bookingId,
  messages,
  waHref,
}: {
  bookingId: string;
  messages: MessageView[];
  waHref: string;
}) {
  const { t } = useI18n();
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSend(formData: FormData) {
    await sendMessageAction(formData);
    formRef.current?.reset();
    router.refresh();
  }

  return (
    <div className="stack" style={{ gap: "1rem" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span className="eyebrow">{t("booking.status.chat.title")}</span>
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => router.refresh()}
          style={{ fontSize: "0.68rem", padding: "0.4rem 0.8rem" }}
        >
          {t("booking.status.chat.refresh")}
        </button>
      </div>

      <div
        className="stack"
        style={{
          gap: "0.6rem",
          maxHeight: 320,
          overflowY: "auto",
          padding: "0.15rem",
        }}
      >
        {messages.length === 0 ? (
          <p className="muted" style={{ margin: 0 }}>
            {t("booking.status.chat.empty")}
          </p>
        ) : (
          messages.map((m) => {
            const isCustomer = m.senderRole === "CUSTOMER";
            return (
              <div
                key={m.id}
                style={{ display: "flex", justifyContent: isCustomer ? "flex-end" : "flex-start" }}
              >
                <div
                  style={{
                    maxWidth: "78%",
                    padding: "0.6rem 0.85rem",
                    borderRadius: "var(--radius)",
                    border: "1px solid var(--border)",
                    background: isCustomer ? "var(--accent-soft)" : "var(--surface-2)",
                  }}
                >
                  <div
                    className="eyebrow"
                    style={{
                      marginBottom: "0.3rem",
                      color: isCustomer ? "var(--accent)" : "var(--muted)",
                    }}
                  >
                    {isCustomer ? t("booking.status.chat.you") : t("booking.status.chat.admin")}
                  </div>
                  <p style={{ margin: 0, fontSize: "0.9rem", whiteSpace: "pre-wrap" }}>{m.body}</p>
                </div>
              </div>
            );
          })
        )}
      </div>

      <form ref={formRef} action={handleSend} className="row" style={{ gap: "0.6rem" }}>
        <input type="hidden" name="bookingId" value={bookingId} />
        <input
          name="body"
          placeholder={t("booking.status.chat.placeholder")}
          required
          style={{ flex: "1 1 auto", minWidth: 0 }}
        />
        <button type="submit" className="btn btn-primary">
          {t("booking.status.chat.send")}
        </button>
      </form>

      <a className="btn btn-ghost" href={waHref} target="_blank" rel="noopener noreferrer" style={{ alignSelf: "flex-start" }}>
        {t("booking.status.chat.whatsapp")}
      </a>
    </div>
  );
}

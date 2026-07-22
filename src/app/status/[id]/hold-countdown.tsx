"use client";

// Countdown hold DP (US 16) — hitung mundur mm:ss sampai `holdExpiresAt`. Dirender HANYA
// oleh halaman induk saat status === "REQUESTED" dan holdExpiresAt tersedia.

import { useEffect, useState } from "react";

import { useI18n } from "@/i18n/client";

function formatRemaining(ms: number, t: (key: string) => string): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes >= 1) {
    return `${minutes} ${t("booking.status.countdown.min")} ${String(seconds).padStart(2, "0")} ${t("booking.status.countdown.sec")}`;
  }
  return `${seconds} ${t("booking.status.countdown.sec")}`;
}

export function HoldCountdown({ expiresAt }: { expiresAt: string }) {
  const { t } = useI18n();
  const target = new Date(expiresAt).getTime();
  const [remaining, setRemaining] = useState<number>(() => target - Date.now());

  useEffect(() => {
    const tick = () => setRemaining(target - Date.now());
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [target]);

  const expired = remaining <= 0;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.6rem",
        width: "100%",
        padding: "0.7rem 0.9rem",
        borderRadius: "var(--radius)",
        border: `1px solid ${expired ? "var(--danger)" : "var(--border-strong)"}`,
        background: expired
          ? "color-mix(in srgb, var(--danger) 10%, transparent)"
          : "var(--surface-2)",
      }}
    >
      <span
        className="eyebrow"
        style={{ color: expired ? "var(--danger)" : "var(--accent)" }}
      >
        {expired
          ? t("booking.status.countdown.expired")
          : `${t("booking.status.countdown.prefix")} ${formatRemaining(remaining, t)}`}
      </span>
    </div>
  );
}

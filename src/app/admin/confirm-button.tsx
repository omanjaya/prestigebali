"use client";

// Tombol konfirmasi dua-langkah untuk aksi destruktif (Cancel booking, Delete
// Cars/Units/Promos/Posts). `confirm()` bawaan browser dilarang (memblokir
// automation & pengalaman buruk), jadi tombol ini meniru pola yang sama tanpa
// dialog: klik pertama → "armed" (teks + gaya berubah mencolok selama
// `timeoutMs`), klik kedua saat armed → submit form pemiliknya lewat
// `form.requestSubmit()`. Dirender sebagai `type="button"` supaya klik pertama
// TIDAK pernah men-submit form secara tidak sengaja.
//
// Pemakaian: ganti `<button type="submit" className="..." disabled={pending}>Cancel</button>`
// dengan `<ConfirmButton className="..." disabled={pending}>Cancel</ConfirmButton>` di
// dalam form yang sama — form & hidden input tidak berubah.

import { useEffect, useRef, useState, type ButtonHTMLAttributes, type MouseEvent } from "react";

type ConfirmButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type"> & {
  /** Label yang tampil saat tombol dalam mode "armed" menunggu klik kedua. */
  confirmLabel?: string;
  /** Durasi (ms) sebelum mode "armed" otomatis batal jika tidak diklik lagi. */
  timeoutMs?: number;
};

export function ConfirmButton({
  children,
  confirmLabel = "Klik lagi untuk konfirmasi",
  className,
  style,
  timeoutMs = 3000,
  onClick,
  ...rest
}: ConfirmButtonProps) {
  const [armed, setArmed] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Bersihkan timeout kalau komponen unmount (mis. baris tabel hilang setelah
  // aksi lain) supaya tidak setState pada komponen yang sudah tak ada.
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    onClick?.(event);
    if (event.defaultPrevented) return;

    if (!armed) {
      setArmed(true);
      timeoutRef.current = setTimeout(() => {
        setArmed(false);
        timeoutRef.current = null;
      }, timeoutMs);
      return;
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setArmed(false);
    event.currentTarget.form?.requestSubmit();
  }

  return (
    <button
      type="button"
      className={className}
      style={
        armed
          ? {
              ...style,
              background: "var(--danger)",
              borderColor: "var(--danger)",
              color: "#fff",
            }
          : style
      }
      title={armed ? confirmLabel : "Klik untuk konfirmasi sebelum aksi ini dijalankan"}
      onClick={handleClick}
      {...rest}
    >
      <span aria-live="polite">{armed ? confirmLabel : children}</span>
    </button>
  );
}

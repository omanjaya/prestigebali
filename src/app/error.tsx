"use client";

// Error boundary global — editorial, bilingual (EN+ID) statis sederhana.
// Tidak menampilkan error.message mentah ke pengunjung (kesan premium); hanya
// dicatat via console.error untuk debugging.

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="status-page">
      <div className="container status-page-inner">
        <span className="kicker">Error</span>
        <h1 className="status-page-title">
          Terjadi kesalahan
          <br />
          Something went wrong
        </h1>
        <div className="status-page-rule" />
        <p className="muted status-page-sub">
          Mohon maaf, ada gangguan sementara di sisi kami. Tim kami akan segera menindaklanjuti —
          silakan coba lagi.
          <br />
          We&apos;re sorry, something briefly went wrong on our end. Please try again.
        </p>
        <div className="row status-page-actions">
          <button type="button" className="btn btn-primary" onClick={() => reset()}>
            Coba lagi / Try again
          </button>
          <Link href="/" className="btn btn-ghost">
            Back to Home
          </Link>
        </div>
      </div>
    </section>
  );
}

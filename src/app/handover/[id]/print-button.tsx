"use client";

// Trigger cetak / Save-PDF untuk Berita Acara. Client-only (window.print()).
// Wrapper .actions disembunyikan saat print (lihat handover.module.css).

export function PrintButton() {
  return (
    <button type="button" className="btn btn-primary" onClick={() => window.print()}>
      Print / Save PDF
    </button>
  );
}

export default PrintButton;

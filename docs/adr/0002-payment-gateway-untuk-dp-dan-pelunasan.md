# Payment gateway pihak ketiga untuk DP & Pelunasan

## Konteks

Booking dibayar dengan struktur DP + Pelunasan. Konfirmasi otomatis pada ADR-0001
mengandaikan sistem tahu kapan pembayaran diterima tanpa campur tangan admin.

## Keputusan

Gunakan payment gateway pihak ketiga (mis. Midtrans/Xendit) untuk memproses DP dan
Pelunasan (VA, e-wallet, kartu). Konfirmasi pembayaran datang otomatis via webhook —
bukan verifikasi manual bukti transfer.

## Alasan & trade-off

Gateway membuat "auto-Terkonfirmasi saat pembayaran diterima" (ADR-0001) benar-benar
otomatis dan mengurangi kerja manual admin, sejalan dengan target sistem yang lengkap +
notifikasi otomatis. Alternatif transfer manual + upload bukti ditolak karena memaksa
langkah verifikasi admin pada setiap pembayaran — termasuk Pakai Sopir yang seharusnya
auto — sehingga meniadakan manfaat ADR-0001.

## Konsekuensi

- Ada biaya per transaksi dan ketergantungan integrasi pada provider (lock-in).
- Perlu endpoint webhook yang aman & idempoten untuk memicu perubahan state Booking.
- Provider spesifik belum dipilih; keputusan ini hanya menetapkan *pakai gateway*, bukan
  vendornya.

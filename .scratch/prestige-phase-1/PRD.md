# PRD — Prestige: Sistem Booking Sewa Mobil Mewah (Fase 1)

Status: ready-for-agent

> Sintesis dari sesi `grill-with-docs`. Bahasa domain mengikuti `CONTEXT.md`; keputusan
> arsitektur menghormati `docs/adr/0001`–`0004`.

## Problem Statement

Pemilik usaha sewa **mobil mewah** mengelola booking secara manual (chat WhatsApp, catatan
terpisah, konfirmasi lisan). Akibatnya: pelanggan tidak bisa melihat koleksi & memesan
sendiri kapan saja; risiko **dobel-booking** karena ketersediaan tidak terlacak; pembayaran,
percakapan, dan pengingat tersebar di banyak tempat; dan pemilik tidak punya gambaran
pendapatan maupun utilisasi armada. Dari sisi **Pelanggan**, tidak ada cara terpercaya untuk
melihat mobil yang tersedia, memesan, membayar, dan berkomunikasi dalam satu alur.

## Solution

Sebuah sistem booking online end-to-end untuk Prestige:

- **Etalase** bergaya showroom (browse-first) tempat Pelanggan menelusuri **Mobil** per
  **Kategori** (tipe kendaraan) dan filter **Brand**.
- Alur **Booking** untuk dua **Mode Sewa** (**Lepas Kunci** & **Pakai Sopir**), dengan
  penahanan **Hold Stok** sementara, pembayaran **DP** lewat **Payment Gateway**, konfirmasi
  bergantung mode, lalu **Pelunasan**.
- **Akun** dibuat otomatis untuk Pelanggan (guest-friendly); **Admin** mengelola armada,
  **Alokasi Unit**, persetujuan **Verifikasi Pengemudi**, chat, dan reports.
- **Percakapan** in-app (dengan opsi handoff WhatsApp) dan **Notifikasi** multi-kanal
  (WhatsApp utama, Email, Web Push).
- **Reports** untuk pendapatan, booking per Mobil/Mode, **Utilisasi** armada, dan
  **Pembayaran Tertunda**.

## User Stories

### Etalase & penelusuran (Pelanggan)

1. As a Pelanggan, I want to melihat seluruh koleksi Mobil di Etalase bergaya showroom, so that saya merasakan kesan mewah sebelum memesan.
2. As a Pelanggan, I want to memfilter Mobil per Kategori (Sport/Supercar, Sedan Mewah, SUV Mewah, MPV Premium), so that saya cepat menemukan tipe yang saya butuhkan.
3. As a Pelanggan, I want to memfilter Mobil per Brand, so that saya bisa mencari merek favorit saya.
4. As a Pelanggan, I want to melihat detail sebuah Mobil (galeri foto, brand, model, tahun, transmisi, kapasitas penumpang, tarif per Mode Sewa), so that saya bisa menilai apakah cocok.
5. As a Pelanggan, I want to melihat tarif per Mode Sewa pada tiap Mobil, so that saya paham biaya sebelum memesan.

### Membuat Booking (Pelanggan)

6. As a Pelanggan, I want to memilih sebuah Mobil dan Mode Sewa (Lepas Kunci / Pakai Sopir), so that pemesanan sesuai kebutuhan saya.
7. As a Pelanggan, I want to menentukan Periode Sewa (waktu mulai–selesai), so that saya memesan untuk tanggal yang saya inginkan.
8. As a Pelanggan, I want to sistem mengecek ketersediaan (Stok) saat saya menekan Booking, so that saya tidak memesan Mobil yang penuh.
9. As a Pelanggan, I want to memesan tanpa harus mendaftar lebih dulu (guest, pakai HP/email), so that gesekan minimal.
10. As a Pelanggan, I want to Akun saya dibuat otomatis dari HP/email, so that saya bisa chat, menerima notifikasi, dan melihat riwayat tanpa repot.
11. As a Pelanggan memilih Lepas Kunci, I want to memilih Metode Serah-Terima (Ambil Sendiri atau Diantar), so that saya bisa memilih yang paling nyaman.
12. As a Pelanggan memilih Diantar, I want to sistem menghitung Biaya Antar berbasis zona, so that saya tahu ongkos pengantaran di muka.
13. As a Pelanggan memilih Pakai Sopir, I want to memasukkan Titik Jemput, so that Sopir tahu di mana menjemput saya.
14. As a Pelanggan, I want to melihat rincian biaya (tarif dasar per mode + biaya tambahan yang relevan) sebelum membayar, so that tidak ada kejutan.

### Hold, pembayaran & konfirmasi (Pelanggan)

15. As a Pelanggan, I want to Stok ditahan sementara (Hold) begitu saya membuat Booking, so that tidak direbut orang lain selama saya membayar.
16. As a Pelanggan, I want to tahu ada batas waktu (timeout) untuk membayar DP, so that saya menyelesaikan pembayaran tepat waktu.
17. As a Pelanggan, I want to membayar DP lewat Payment Gateway (VA/e-wallet/kartu), so that saya bisa membayar dengan metode yang saya punya.
18. As a Pelanggan memilih Pakai Sopir, I want to Booking langsung Terkonfirmasi setelah DP diterima, so that saya cepat mendapat kepastian.
19. As a Pelanggan memilih Lepas Kunci, I want to mengunggah/menyerahkan data Verifikasi Pengemudi (SIM/KTP), so that Admin bisa menyetujui Booking saya.
20. As a Pelanggan memilih Lepas Kunci, I want to Booking saya masuk Menunggu Persetujuan setelah bayar, so that saya paham masih ada langkah verifikasi.
21. As a Pelanggan, I want to Booking saya menjadi Kedaluwarsa dan Hold dilepas jika saya tidak membayar sebelum timeout, so that saya tidak terikat pada pesanan yang batal.
22. As a Pelanggan, I want to melakukan Pelunasan sebelum serah-terima, so that Booking siap dijalankan.
23. As a Pelanggan, I want to menerima Notifikasi di tiap tahap penting (Terkonfirmasi, pengingat Pelunasan, pengingat H-1), so that saya selalu tahu status pesanan.

### Pembatalan, refund & reschedule (Pelanggan)

24. As a Pelanggan, I want to membatalkan Booking, so that saya tidak terikat bila rencana berubah.
25. As a Pelanggan yang membatalkan ≥H-7, I want to menerima refund penuh (dikurangi biaya admin), so that pembatalan jauh hari adil.
26. As a Pelanggan yang membatalkan H-3 s/d H-6, I want to menerima refund 50%, so that saya paham konsekuensi pembatalan menengah.
27. As a Pelanggan yang membatalkan ≤H-2, I want to memahami DP saya hangus, so that ekspektasi jelas di muka.
28. As a Pelanggan, I want to meminta Reschedule (pindah tanggal) alih-alih membatalkan, so that DP saya tidak hangus. *(catatan: aturan 1× gratis ≥H-3 belum dikonfirmasi — lihat Further Notes)*
29. As a Pelanggan yang Booking-nya dibatalkan oleh Prestige, I want to menerima refund penuh 100% tanpa memandang H-berapa, so that saya tidak dirugikan atas hal di luar kendali saya.

### Chat (Pelanggan & Admin)

30. As a Pelanggan, I want to chat in-app dengan Admin, so that saya bisa bertanya sebelum/selama Booking.
31. As a Pelanggan, I want to Percakapan terikat ke Booking saya bila relevan, so that konteksnya jelas.
32. As a Pelanggan, I want to opsi melanjutkan chat ke WhatsApp, so that saya bisa memakai kanal yang saya sukai.
33. As an Admin, I want to menerima Notifikasi tiap ada pesan chat baru, so that saya bisa merespons cepat.

### Pengelolaan (Admin)

34. As an Admin, I want to mengelola daftar Mobil (tambah/ubah, galeri, spesifikasi, Kategori, Brand, tarif per mode), so that Etalase selalu akurat.
35. As an Admin, I want to mengelola Unit di bawah tiap Mobil (plat, warna, kilometer, kondisi) dan menetapkan Stok, so that ketersediaan mencerminkan armada nyata.
36. As an Admin, I want to melihat daftar Booking masuk beserta statusnya, so that saya bisa mengelola operasional.
37. As an Admin, I want to menerima Notifikasi saat ada Booking baru (Permintaan), so that saya segera menanganinya.
38. As an Admin, I want to meninjau & menyetujui Verifikasi Pengemudi pada Booking Lepas Kunci, so that aset berisiko hanya diserahkan setelah dicek.
39. As an Admin, I want to meng-Alokasi Unit fisik ke sebuah Booking menjelang hari-H, so that operasional siap.
40. As an Admin, I want to menandai Booking sebagai Berjalan lalu Selesai, so that siklus terlacak (inspeksi/deposit ditangani manual di luar sistem).
41. As an Admin, I want to membatalkan Booking atas nama Prestige (Unit rusak/Sopir berhalangan) dengan refund penuh otomatis, so that penanganan konsisten & adil.
42. As an Admin, I want to menetapkan konfigurasi (timeout Hold, hari Buffer, biaya admin refund, zona Biaya Antar, batas km, tarif Overtime), so that aturan sesuai kebijakan usaha.

### Reports (Admin)

43. As an Admin, I want to melihat report Pendapatan per periode (DP + Pelunasan masuk), so that saya memantau kesehatan bisnis.
44. As an Admin, I want to melihat Booking per Mobil & per Mode Sewa, so that saya tahu model & mode mana yang paling laku.
45. As an Admin, I want to melihat Utilisasi armada (hari tersewa vs idle per Mobil), so that saya bisa memutuskan beli/lepas Unit.
46. As an Admin, I want to melihat daftar Pembayaran Tertunda (ber-DP tapi belum Pelunasan), so that saya bisa menagih.

### Ketersediaan & Buffer (lintas)

47. As an Admin, I want to sistem memperhitungkan Buffer (default 1 hari) setelah tiap Booking, so that Mobil tidak disewakan sebelum siap (cuci/cek/BBM/logistik balik).
48. As a Pelanggan, I want to ketersediaan mencerminkan Stok dikurangi Booking aktif + Buffer, so that saya hanya bisa memesan slot yang benar-benar tersedia.

## Implementation Decisions

- **Seam utama tunggal — `Booking application service` (lapisan use-case).** Semua alur
  digerakkan lewat API service ini: `createBooking`, `payDP`, `settle`, `approve`, `cancel`,
  `cancelByOperator`, `reschedule`, `markOngoing`, `markCompleted`, dan query ketersediaan.
  Logika domain (state machine, availability, aturan per-mode, refund) hidup di balik seam ini.
- **Port yang di-inject (dipalsukan di test):** `Clock`, `PaymentGateway`, `NotificationSender`,
  `Repository`. Layanan eksternal & waktu tidak bocor ke logika domain.
- **State machine Booking** (per ADR-0001) — encoding ringkas keputusan:

  ```
  REQUESTED ──(payDP)──┬─ [Pakai Sopir]  ─────────────► CONFIRMED
                       └─ [Lepas Kunci]  ► AWAITING_APPROVAL ─(approve)─► CONFIRMED
  REQUESTED ──(hold timeout)──► EXPIRED
  {REQUESTED, AWAITING_APPROVAL, CONFIRMED} ──(cancel/cancelByOperator)──► CANCELLED
  CONFIRMED ──(markOngoing)──► ONGOING ──(markCompleted)──► COMPLETED
  ```

- **Ketersediaan (availability):** dihitung **per Mobil (model)**, bukan per Unit. Sebuah
  Booking mengurangi Stok untuk **Periode Sewa + Buffer**. `Hold Stok` adalah pengurangan
  sementara ber-timeout selama menunggu DP. **Alokasi Unit** adalah tindakan Admin terpisah
  yang tidak memengaruhi perhitungan Stok. Pelanggan tidak memilih warna/Unit.
- **Harga per Mode Sewa** (satu model waktu, aturan harga menempel ke mode): Lepas Kunci =
  Tarif Harian (per 24 jam) + potensi Denda (telat/kelebihan Batas Kilometer) + Biaya Antar;
  Pakai Sopir = Paket 12 Jam + Overtime/jam + potensi Biaya Luar Kota. Tarif **tetap** (tanpa
  variasi musiman di fase 1).
- **Pembayaran** (ADR-0002): DP + Pelunasan via `PaymentGateway`. Konfirmasi pembayaran datang
  dari **webhook** yang memanggil `payDP`/`settle` pada service; endpoint webhook harus aman &
  **idempoten**. Refund (penuh/sebagian) juga lewat port ini.
- **Konfirmasi** bergantung Mode Sewa: `payDP` pada Pakai Sopir → `CONFIRMED`; pada Lepas Kunci
  → `AWAITING_APPROVAL` hingga `approve` Admin (setelah Verifikasi Pengemudi).
- **Refund & pembatalan** (ADR-0004): perhitungan tier bergantung selisih hari antara waktu
  pembatalan (`Clock`) dan tanggal mulai — perlu titik potong zona waktu konsisten (mis. WIB).
  Tier: ≥H-7 penuh (−biaya admin), H-3..H-6 50%, ≤H-2 hangus. `cancelByOperator` → refund 100%.
  `reschedule` mengubah Periode Sewa → **cek ulang Hold/Stok** pada tanggal baru.
- **Notifikasi** (ADR-0003): satu lapisan `NotificationSender` yang meng-abstraksi kanal —
  satu kejadian domain (Booking baru, pembayaran diterima, pesan masuk, menunggu persetujuan,
  Terkonfirmasi, pengingat) fan-out ke **WhatsApp** (utama), **Email**, **Web Push**. Kanal &
  vendor bisa ditukar tanpa menyebar ke logika domain.
- **Akun & peran:** Pelanggan (guest + Akun otomatis), Admin (Akun penuh). **Sopir tidak
  login** di fase 1 (dikelola Admin sebagai data jadwal).
- **Percakapan:** entitas chat in-app terikat opsional ke Booking; handoff WhatsApp sebagai
  opsi tautan, bukan integrasi dua arah di fase 1.
- **Reports:** query baca atas data Booking/Pembayaran — Pendapatan per periode, Booking per
  Mobil/Mode, Utilisasi (hari tersewa/tersedia), Pembayaran Tertunda (ber-DP tanpa Pelunasan).

## Testing Decisions

- **Uji perilaku eksternal, bukan detail implementasi.** Test mengirim perintah ke
  `Booking application service` dan mengamati (a) state Booking yang dihasilkan, (b) hasil
  query ketersediaan, (c) efek pada port (Pembayaran yang diminta, Notifikasi yang direkam).
  Tidak menguji struktur data internal, nama fungsi privat, atau bentuk penyimpanan.
- **Modul yang diuji:** `Booking application service` (satu-satunya seam). Termasuk seluruh
  state machine, aturan availability (Stok + Hold + Buffer), percabangan per Mode Sewa, tier
  refund, dan reschedule.
- **Fake pada port:** `Clock` palsu untuk mengendalikan waktu (timeout Hold, tier H-n, Buffer)
  secara deterministik; `PaymentGateway` palsu untuk mensimulasikan DP/Pelunasan/refund;
  `NotificationSender` palsu untuk merekam & memeriksa notifikasi yang dikirim; `Repository`
  in-memory sebagai pengganti DB.
- **Skenario kunci yang wajib tercakup:** dobel-booking dihalangi oleh Hold; Hold timeout →
  EXPIRED & Stok dilepas; Buffer memblokir booking back-to-back; Pakai Sopir auto-CONFIRMED;
  Lepas Kunci butuh approve; tiap tier refund (≥H-7 / H-3–H-6 / ≤H-2); refund operator 100%;
  reschedule sukses vs gagal karena tanggal baru penuh; idempotensi webhook (payDP ganda).
- **Prior art:** belum ada — repo greenfield. PRD ini **menetapkan pola** test-lewat-seam +
  fake-port sebagai acuan untuk fitur berikutnya. Ikuti disiplin `/tdd` proyek.

## Out of Scope

- **Login Sopir** & portal jadwal Sopir (fase berikutnya).
- **Modul inspeksi lengkap** (checklist, foto per titik, tanda tangan) — serah-terima, cek
  km/BBM/kondisi, perhitungan Denda, dan refund Deposit ditangani **manual di luar sistem**.
- **Preferensi/pemilihan warna oleh Pelanggan** — sengaja dipangkas (stok & warna terbatas).
- **Tarif musiman/weekend/dynamic pricing** — tarif tetap di fase 1.
- **Pemilihan vendor spesifik** Payment Gateway & WhatsApp API (ADR hanya menetapkan strategi).
- **Konten & polish landing page** (copywriting, desain visual) — di luar cakupan domain PRD.
- **Aturan refund berbeda per Mode Sewa** — saat ini sama untuk keduanya.
- **Ketersediaan per Unit** — availability tetap per model (Stok).
- **Integrasi WhatsApp dua arah** untuk chat — hanya handoff tautan.

## Further Notes

- **Butuh konfirmasi pemilik** (ditandai di ADR-0004): aturan **Reschedule 1× gratis ≥H-3**
  diambil sebagai default saat grilling, belum dikonfirmasi eksplisit; dan apakah aturan refund
  perlu berbeda per Mode Sewa.
- **Angka konfigurasi belum ditetapkan:** timeout Hold, jumlah hari Buffer, besaran biaya admin
  (tier ≥H-7), zona & tarif Biaya Antar, Batas Kilometer, tarif Overtime.
- **Stack teknologi belum dipilih** (bahasa, framework, DB, provider gateway/WA). Seam & port
  di PRD ini dirumuskan agnostik-stack; keputusan stack layak jadi ADR tersendiri saat diambil.
- **Layout domain docs** saat ini satu `CONTEXT.md` di root; setup menyebut *multi-context* —
  promosikan ke `CONTEXT-MAP.md` bila muncul batas context nyata (mis. Pembayaran/Chat).
- Rujukan: `CONTEXT.md` (glossary 46 istilah), `docs/adr/0001`–`0004`.

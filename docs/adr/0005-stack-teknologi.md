# Stack teknologi fase 1

## Konteks

Sistem menutup permukaan lengkap (Etalase/showroom → panel Admin → API → webhook pembayaran)
untuk pasar Indonesia, dengan logika domain yang dirancang di balik satu `Booking application
service` + port yang bisa di-fake (lihat PRD `prestige-phase-1`). Perlu memilih stack yang
selaras dengan desain itu dan dengan tooling skill TypeScript yang sudah ada di repo.

## Keputusan

- **Bahasa & framework:** **Next.js + TypeScript** (full-stack) — showroom, admin, API routes,
  dan webhook dalam satu codebase.
- **Database & ORM:** **PostgreSQL + Prisma** — di balik port `Repository`.
- **Payment gateway:** **Midtrans (Snap)** — memenuhi bagian vendor ADR-0002; di balik port
  `PaymentGateway`.
- **WhatsApp API:** **ditunda** — Email + Web Push jalan dulu; vendor WhatsApp dicolok ke port
  `NotificationSender` belakangan (ADR-0003 tetap terbuka untuk vendor WA).
- **Autentikasi:** **Auth.js (NextAuth)** — email magic-link/OTP untuk Pelanggan (guest + Akun
  otomatis), credentials untuk Admin.
- **Lingkungan:** **Docker lokal dulu** (docker-compose: Postgres + app). **Hosting produksi
  ditunda**; pengembangan berbasis kontainer menjaga opsi VPS/kontainer tetap terbuka.

## Alasan & trade-off

TypeScript full-stack (Next.js) memetakan langsung ke arsitektur port/seam dan selaras dengan
skill TS di repo (`/tdd`, `migrate-to-shoehorn`). Postgres+Prisma memberi migrasi rapi, tipe
end-to-end, dan fitur relational yang pas untuk kueri tanggal/ketersediaan. Midtrans dipilih
karena checkout hosted (beban PCI rendah) dan paling dikenal pelanggan Indonesia. Auth.js
menghindari vendor auth berbayar. Vendor WhatsApp & hosting produksi sengaja ditunda karena
keduanya ada di balik abstraksi (port / kontainer) sehingga tidak memblokir pembangunan inti.

Alternatif yang ditolak: Laravel/PHP (kuat di Indonesia, tapi tooling skill repo berorientasi
TS); NestJS + frontend terpisah (lebih banyak bagian dikelola); Drizzle/MySQL (Prisma+Postgres
lebih produktif untuk fase 1); auth terkelola (Clerk/Supabase — biaya/ketergantungan tambahan).

## Konsekuensi

- **Hold timeout → Kedaluwarsa** butuh scheduler: gunakan **lazy-expiry saat baca** + **job
  sweep periodik** yang membalik state kedaluwarsa & melepas Stok. Di Docker lokal bisa berupa
  worker/cron terjadwal; mekanisme produksi ditetapkan saat hosting dipilih.
- **Webhook pembayaran wajib idempoten** (serverless-ready), sesuai catatan PRD.
- Beberapa keputusan menyisakan celah yang harus diisi saat implementasi: vendor WhatsApp
  (ADR-0003), hosting produksi, dan detail skema Prisma.
- Keputusan ini soal stack, bukan struktur folder/monorepo — tetapkan terpisah bila perlu.
- **Prisma dipatok ke v6** (bukan v7). Prisma 7 menghapus pola `url` di schema dan mewajibkan
  driver-adapter + `prisma.config.ts`; untuk skeleton yang stabil & banyak dokumentasi, v6
  dipilih. Migrasi ke v7 ditunda sebagai pekerjaan tersendiri. Versi lain (Next 16, React 19,
  TypeScript 6, Vitest 4) memakai rilis terbaru.

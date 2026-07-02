# prestige

> Sistem booking online untuk sewa mobil mewah — dari etalase (showroom) hingga
> booking, pembayaran, dan chat.

## Overview

Aplikasi **Next.js + TypeScript** (App Router) dengan **PostgreSQL + Prisma**. Arsitektur
berpusat pada satu **seam** — `Booking application service` — dengan seluruh layanan eksternal
(waktu, pembayaran, notifikasi, penyimpanan) di balik **port** yang di-inject, sehingga logika
domain bisa diuji lewat fake tanpa DB/HTTP/vendor nyata. Lihat `.scratch/prestige-phase-1/PRD.md`.

Stack & keputusan: `docs/adr/0005-stack-teknologi.md`. Bahasa domain: `CONTEXT.md`.

## Prasyarat

- Node.js 20+ (diuji pada Node 24)
- Docker Desktop (untuk Postgres lokal) — **belum terpasang di mesin ini**, install dulu untuk
  menjalankan database

## Getting started

```bash
# 1. Dependencies
npm install

# 2. Environment
cp .env.example .env          # lalu isi nilainya

# 3. Database lokal (butuh Docker)
docker compose up -d          # Postgres di localhost:5432
npm run db:generate           # generate Prisma Client
npm run db:migrate            # buat skema (migrasi pertama)

# 4. Jalankan
npm run dev                   # http://localhost:3000
```

## Skrip

| Skrip | Fungsi |
| --- | --- |
| `npm run dev` / `build` / `start` | Next.js dev / build / serve |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` / `test:watch` | Vitest (test lewat seam + fake port) |
| `npm run db:generate` / `db:migrate` / `db:push` / `db:studio` | Prisma |

## Struktur

```
src/
├── app/                        # Next.js App Router
│   ├── page.tsx                # Etalase (showroom) — placeholder
│   └── api/webhooks/payment/   # Webhook Midtrans (stub, wajib idempoten)
├── domain/booking/             # SEAM + logika domain (murni, tanpa Next/Prisma)
│   ├── booking.ts              # tipe domain (RentalMode, BookingStatus, ...)
│   ├── ports.ts                # Clock, PaymentGateway, NotificationSender, Repository
│   ├── booking-service.ts      # Booking application service (STUB → diisi via /tdd)
│   ├── errors.ts
│   ├── booking-service.test.ts # smoke test (diganti test perilaku via /tdd)
│   └── testing/fakes.ts        # fake in-memory keempat port
└── lib/prisma.ts               # Prisma Client singleton
prisma/schema.prisma            # skema (di balik port Repository)
docker-compose.yml              # Postgres lokal
```

## Status

Skeleton siap; **logika domain belum dibangun** — `booking-service.ts` masih stub. Langkah
berikutnya: `/tdd` untuk mengisi `Booking application service` test-first mengikuti seam.

Referensi: `CONTEXT.md` (glossary), `docs/adr/0001`–`0005`, `.scratch/prestige-phase-1/PRD.md`.

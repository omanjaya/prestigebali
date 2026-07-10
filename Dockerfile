# Image aplikasi Prestige (Next.js + Prisma) — untuk docker compose lokal.
# Satu stage sederhana (bukan multi-stage minimal) karena target saat ini adalah
# pengembangan lokal; ukuran image bukan prioritas. Saat deploy produksi, pertimbangkan
# multi-stage + `output: "standalone"` agar image ramping.

FROM node:22-slim

# Prisma engine butuh openssl di image slim.
RUN apt-get update -y && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install dependency dulu (layer ter-cache selama package*.json tidak berubah).
# --legacy-peer-deps: next-auth beta punya konflik peer optional (nodemailer v7 vs v9).
COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps

# Salin source lalu generate Prisma Client (engine linux) & build Next.js.
COPY . .
RUN npx prisma generate && npm run build

ENV NODE_ENV=production
EXPOSE 3000

# Terapkan migrasi yang sudah ada (idempoten) lalu jalankan server.
CMD ["sh", "-c", "npx prisma migrate deploy && npx next start"]

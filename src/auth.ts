// Konfigurasi Auth.js (NextAuth v5) — fase 1: login ADMIN via Credentials + sesi JWT.
// Tidak butuh tabel Auth.js/DB. Kredensial admin dari env (TODO: pindah ke hash/DB).
// Pelanggan TIDAK login di fase 1 (guest auto-account, lihat src/server/customer-account.ts).

import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

export const { handlers, auth, signIn, signOut } = NextAuth({
  // Self-host (ADR-0005: Docker/VPS, bukan Vercel) → percayai host dari proxy.
  trustHost: true,
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      name: "Admin",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize(credentials) {
        const email = typeof credentials?.email === "string" ? credentials.email : "";
        const password = typeof credentials?.password === "string" ? credentials.password : "";
        const adminEmail = process.env.ADMIN_EMAIL;
        const adminPassword = process.env.ADMIN_PASSWORD;
        if (!adminEmail || !adminPassword) return null;
        if (email === adminEmail && password === adminPassword) {
          return { id: "admin", email: adminEmail, name: "Admin", role: "ADMIN" };
        }
        return null;
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) token.role = user.role;
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.role = typeof token.role === "string" ? token.role : undefined;
      }
      return session;
    },
  },
});

// Konfigurasi Auth.js (NextAuth v5) — fase 1: login ADMIN via Credentials + sesi JWT.
// Tidak butuh tabel Auth.js/DB. Kredensial admin dari env (TODO: pindah ke hash/DB).
// Pelanggan TIDAK login di fase 1 (guest auto-account, lihat src/server/customer-account.ts).

import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

/**
 * Verifikasi password admin. Utamakan hash scrypt (ADMIN_PASSWORD_HASH = "salt:keyHex");
 * fallback ke ADMIN_PASSWORD plaintext untuk dev. Import node:crypto secara dinamis agar
 * tak masuk bundle edge (authorize hanya jalan di runtime Node saat sign-in).
 */
async function verifyAdminPassword(password: string): Promise<boolean> {
  const hash = process.env.ADMIN_PASSWORD_HASH;
  if (hash) {
    const [salt, keyHex] = hash.split(":");
    if (!salt || !keyHex) return false;
    const { scryptSync, timingSafeEqual } = await import("node:crypto");
    const derived = scryptSync(password, salt, 64);
    const stored = Buffer.from(keyHex, "hex");
    return derived.length === stored.length && timingSafeEqual(derived, stored);
  }
  const plain = process.env.ADMIN_PASSWORD;
  return plain != null && plain !== "" && password === plain;
}

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
      async authorize(credentials) {
        const email = typeof credentials?.email === "string" ? credentials.email : "";
        const password = typeof credentials?.password === "string" ? credentials.password : "";
        const adminEmail = process.env.ADMIN_EMAIL;
        if (!adminEmail || email !== adminEmail) return null;
        if (!(await verifyAdminPassword(password))) return null;
        return { id: "admin", email: adminEmail, name: "Admin", role: "ADMIN" };
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

// Middleware Auth.js v5 (edge-safe): melindungi area ADMIN.
// Membungkus `auth` dari @/auth sehingga callback menerima request yang di-augment
// dengan `.auth` (Session | null). Hanya user ber-role "ADMIN" yang boleh masuk;
// selain itu dialihkan ke /login. Matcher mencakup /admin dan seluruh sub-path-nya.

import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isAdmin = req.auth?.user?.role === "ADMIN";
  if (!isAdmin) {
    const url = new URL("/login", req.nextUrl.origin);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
});

export const config = { matcher: ["/admin", "/admin/:path*"] };

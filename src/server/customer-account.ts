// Guest auto-account (CONTEXT.md: Pelanggan booking sebagai guest; Akun dibuat otomatis).
// Meng-upsert Account(role CUSTOMER) dari HP/email, mengembalikan id untuk `customerId` Booking.
// Membutuhkan DB (Prisma) saat runtime.

import { prisma } from "@/lib/prisma";

export interface CustomerIdentity {
  name?: string;
  phone?: string;
  email?: string;
}

/**
 * Cari Akun Pelanggan berdasarkan HP atau email; buat bila belum ada. Mengembalikan id Akun.
 * Minimal salah satu dari phone/email wajib ada sebagai identitas.
 */
export async function resolveCustomerAccountId(identity: CustomerIdentity): Promise<string> {
  const { name, phone, email } = identity;
  if (!phone && !email) {
    throw new Error("Identitas pelanggan membutuhkan minimal nomor HP atau email.");
  }

  const or = [
    phone ? { phone } : null,
    email ? { email } : null,
  ].filter((c): c is { phone: string } | { email: string } => c !== null);

  const existing = await prisma.account.findFirst({ where: { OR: or } });
  if (existing) return existing.id;

  const created = await prisma.account.create({
    data: { role: "CUSTOMER", name: name ?? null, phone: phone ?? null, email: email ?? null },
  });
  return created.id;
}

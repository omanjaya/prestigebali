"use server";

// Server Action: simpan checklist serah-terima (OUT/IN). Upsert per (bookingId, phase).
// Admin-only. Data dari FormData — checkbox absen = false.

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import type { HandoverPhase } from "@prisma/client";

async function requireAdmin(): Promise<void> {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }
}

function bool(fd: FormData, key: string): boolean {
  const v = fd.get(key);
  return v === "on" || v === "true";
}

function int(fd: FormData, key: string, fallback: number): number {
  const n = Number(fd.get(key));
  return Number.isFinite(n) ? Math.trunc(n) : fallback;
}

function str(fd: FormData, key: string): string | null {
  const s = String(fd.get(key) ?? "").trim();
  return s.length > 0 ? s : null;
}

export async function saveHandover(formData: FormData): Promise<void> {
  await requireAdmin();

  const bookingId = String(formData.get("bookingId") ?? "");
  const phase = String(formData.get("phase") ?? "") as HandoverPhase;
  if (!bookingId || (phase !== "OUT" && phase !== "IN")) return;

  const accessories = String(formData.get("accessories") ?? "")
    .split(/[\n,]/)
    .map((s) => s.trim())
    .filter(Boolean);

  const data = {
    odometer: Math.max(0, int(formData, "odometer", 0)),
    fuelEighths: Math.min(8, Math.max(0, int(formData, "fuelEighths", 8))),
    exteriorClean: bool(formData, "exteriorClean"),
    interiorClean: bool(formData, "interiorClean"),
    tiresOk: bool(formData, "tiresOk"),
    docStnk: bool(formData, "docStnk"),
    spareTire: bool(formData, "spareTire"),
    jack: bool(formData, "jack"),
    toolkit: bool(formData, "toolkit"),
    firstAidKit: bool(formData, "firstAidKit"),
    accessories,
    damageNotes: str(formData, "damageNotes"),
    notes: str(formData, "notes"),
    staffName: str(formData, "staffName"),
    signedByStaff: bool(formData, "signedByStaff"),
    signedByCustomer: bool(formData, "signedByCustomer"),
  };

  await prisma.handover.upsert({
    where: { bookingId_phase: { bookingId, phase } },
    create: { bookingId, phase, ...data },
    update: data,
  });

  revalidatePath(`/admin/handover/${bookingId}`);
}

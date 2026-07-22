"use server";

// Server Action untuk Admin membalas percakapan (Inbox Chat, US 30-33).

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { appendMessageToBooking } from "@/lib/conversations";

/** Guard bersama: lempar bila bukan ADMIN. */
async function requireAdmin(): Promise<void> {
  const s = await auth();
  if (s?.user?.role !== "ADMIN") throw new Error("Unauthorized");
}

/** Kirim balasan Admin ke Percakapan sebuah Booking. */
export async function replyAction(formData: FormData): Promise<void> {
  await requireAdmin();

  const bookingId = String(formData.get("bookingId") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  if (!bookingId || !body) return;

  try {
    await appendMessageToBooking({ bookingId, senderRole: "ADMIN", body });
  } catch (error) {
    console.error("replyAction gagal", error);
  }

  revalidatePath(`/admin/chat/${bookingId}`);
  revalidatePath("/admin/chat");
}

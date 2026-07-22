// Percakapan (Conversation) & Pesan (Message) — chat in-app antara Pelanggan dan Admin,
// terikat opsional ke sebuah Booking (CONTEXT.md). Fase 1: penyimpanan + polling sederhana;
// handoff WhatsApp tetap sebagai tautan opsional (bukan integrasi dua arah).

import { prisma } from "@/lib/prisma";
import type { Role } from "@prisma/client";

export interface MessageView {
  id: string;
  senderRole: Role;
  body: string;
  createdAt: Date;
}

export interface ConversationView {
  id: string;
  bookingId?: string;
  messages: MessageView[];
}

/**
 * Ambil Percakapan yang terikat ke sebuah Booking, buat bila belum ada. Mengembalikan
 * conversationId. customerId diturunkan dari Booking (bukan dari input yang bisa dipalsukan).
 */
export async function getOrCreateConversationForBooking(bookingId: string): Promise<string | null> {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    select: { customerId: true },
  });
  if (!booking) return null;

  const existing = await prisma.conversation.findFirst({
    where: { bookingId },
    select: { id: true },
  });
  if (existing) return existing.id;

  const created = await prisma.conversation.create({
    data: { bookingId, customerId: booking.customerId },
    select: { id: true },
  });
  return created.id;
}

/** Percakapan sebuah Booking beserta seluruh pesan (urut kronologis). Null bila belum ada. */
export async function getConversationForBooking(
  bookingId: string,
): Promise<ConversationView | null> {
  const convo = await prisma.conversation.findFirst({
    where: { bookingId },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });
  if (!convo) return null;
  return {
    id: convo.id,
    bookingId: convo.bookingId ?? undefined,
    messages: convo.messages.map((m) => ({
      id: m.id,
      senderRole: m.senderRole,
      body: m.body,
      createdAt: m.createdAt,
    })),
  };
}

/**
 * Tambahkan sebuah pesan ke Percakapan sebuah Booking (buat Percakapan bila perlu).
 * `senderRole` ditentukan pemanggil (Server Action) sesuai konteks — Admin wajib sesi admin.
 */
export async function appendMessageToBooking(input: {
  bookingId: string;
  senderRole: Role;
  body: string;
}): Promise<void> {
  const body = input.body.trim();
  if (!body) return;
  const conversationId = await getOrCreateConversationForBooking(input.bookingId);
  if (!conversationId) return;
  await prisma.message.create({
    data: { conversationId, senderRole: input.senderRole, body },
  });
}

export interface AdminConversationRow {
  bookingId: string;
  customerName: string;
  carName: string;
  lastMessage?: string;
  lastAt?: Date;
  messageCount: number;
  /** Pesan Pelanggan yang belum dibaca admin (readAt null). */
  unreadCount: number;
}

/** Total pesan Pelanggan yang belum dibaca admin — untuk badge sidebar. */
export async function countUnreadForAdmin(): Promise<number> {
  return prisma.message.count({ where: { senderRole: "CUSTOMER", readAt: null } });
}

/** Tandai seluruh pesan Pelanggan pada thread sebuah Booking sebagai dibaca admin. */
export async function markReadByAdmin(bookingId: string): Promise<void> {
  const convo = await prisma.conversation.findFirst({ where: { bookingId }, select: { id: true } });
  if (!convo) return;
  await prisma.message.updateMany({
    where: { conversationId: convo.id, senderRole: "CUSTOMER", readAt: null },
    data: { readAt: new Date() },
  });
}

/** Daftar Percakapan (terikat Booking) untuk inbox Admin, terbaru di atas. */
export async function listAdminConversations(): Promise<AdminConversationRow[]> {
  const convos = await prisma.conversation.findMany({
    where: { bookingId: { not: null } },
    include: {
      customer: { select: { name: true } },
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
      _count: {
        select: {
          messages: true,
        },
      },
    },
  });
  // Hitung unread per percakapan (pesan CUSTOMER tanpa readAt) dalam satu query.
  const unreadGroups = await prisma.message.groupBy({
    by: ["conversationId"],
    where: { senderRole: "CUSTOMER", readAt: null },
    _count: { _all: true },
  });
  const unreadByConvo = new Map(unreadGroups.map((g) => [g.conversationId, g._count._all]));

  const bookingIds = convos.map((c) => c.bookingId).filter((b): b is string => b !== null);
  const bookings = await prisma.booking.findMany({
    where: { id: { in: bookingIds } },
    include: { carModel: { select: { brand: true, name: true } } },
  });
  const carByBooking = new Map(
    bookings.map((b) => [b.id, `${b.carModel.brand} ${b.carModel.name}`]),
  );

  const rows: AdminConversationRow[] = convos
    .filter((c): c is typeof c & { bookingId: string } => c.bookingId !== null)
    .map((c) => {
      const last = c.messages[0];
      return {
        bookingId: c.bookingId,
        customerName: c.customer.name ?? "—",
        carName: carByBooking.get(c.bookingId) ?? "—",
        lastMessage: last?.body,
        lastAt: last?.createdAt,
        messageCount: c._count.messages,
        unreadCount: unreadByConvo.get(c.id) ?? 0,
      };
    });

  rows.sort((a, b) => (b.lastAt?.getTime() ?? 0) - (a.lastAt?.getTime() ?? 0));
  return rows;
}

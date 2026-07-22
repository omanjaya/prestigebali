// Admin — Chat Thread (US 30-33). Server Component: seluruh pesan sebuah
// Percakapan (terikat Booking), bubble kiri (pelanggan) / kanan (admin), + form
// balas. Guard: hanya ADMIN, selain itu → /login. Next 16: params async.

import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { auth } from "@/auth";
import { getBooking } from "@/lib/bookings";
import { getConversationForBooking, markReadByAdmin } from "@/lib/conversations";
import { Container, Card, CardBody, PageHeader } from "@/ui/primitives";
import { formatWIB } from "@/ui/format";
import { replyAction } from "../actions";

// Refresh berkala (polling ringan) agar admin melihat pesan baru tanpa reload manual.
export const revalidate = 5;

export default async function AdminChatThreadPage({
  params,
}: {
  params: Promise<{ bookingId: string }>;
}) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/login");

  const { bookingId } = await params;
  const booking = await getBooking(bookingId);
  if (!booking) notFound();

  // Tandai pesan Pelanggan pada thread ini sebagai dibaca SEBELUM memuat pesan,
  // sehingga badge unread di sidebar/inbox berkurang otomatis pada render berikutnya.
  await markReadByAdmin(bookingId);

  const conversation = await getConversationForBooking(bookingId);
  const messages = conversation?.messages ?? [];

  return (
    <Container style={{ maxWidth: 720, paddingBottom: "3rem" }}>
      <style>{`
        .ct-bubble {
          max-width: 75%;
        }
        @media (max-width: 640px) {
          .ct-bubble {
            max-width: 85%;
          }
        }
        .ct-reply {
          display: flex;
          gap: 0.5rem;
          position: sticky;
          bottom: 0;
          background: var(--surface);
          padding: 0.75rem 0 0.25rem;
        }
        .ct-reply input[type="text"] {
          flex: 1;
          min-width: 0;
        }
      `}</style>

      <Link
        href="/admin/chat"
        className="btn btn-ghost"
        style={{ marginTop: "2rem" }}
      >
        ← Back to Inbox
      </Link>
      <Card style={{ marginTop: "1rem" }}>
        <CardBody>
          <PageHeader
            title={booking.customerName}
            subtitle={booking.carName}
            kicker="Admin · Chat"
          />

          <div
            className="stack"
            style={{
              gap: "0.75rem",
              maxHeight: 480,
              overflowY: "auto",
              padding: "0.5rem",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius)",
              background: "var(--surface-2)",
              marginBottom: "1.25rem",
            }}
          >
            {messages.length === 0 ? (
              <p className="muted" style={{ textAlign: "center", margin: "1rem 0" }}>
                No messages yet.
              </p>
            ) : (
              messages.map((m) => {
                const fromAdmin = m.senderRole === "ADMIN";
                return (
                  <div
                    key={m.id}
                    style={{
                      display: "flex",
                      justifyContent: fromAdmin ? "flex-end" : "flex-start",
                    }}
                  >
                    <div
                      className="ct-bubble"
                      style={{
                        padding: "0.6rem 0.85rem",
                        borderRadius: "var(--radius)",
                        background: fromAdmin ? "var(--accent)" : "var(--surface)",
                        color: fromAdmin ? "var(--on-accent, #fff)" : "inherit",
                        border: fromAdmin ? "none" : "1px solid var(--border)",
                      }}
                    >
                      <div style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                        {m.body}
                      </div>
                      <div
                        className={fromAdmin ? undefined : "muted"}
                        style={{
                          fontSize: "0.72rem",
                          marginTop: "0.3rem",
                          opacity: fromAdmin ? 0.85 : 1,
                          textAlign: fromAdmin ? "right" : "left",
                        }}
                      >
                        {formatWIB(m.createdAt)}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <form action={replyAction} className="ct-reply">
            <input type="hidden" name="bookingId" value={bookingId} />
            <input type="text" name="body" placeholder="Type a reply…" required />
            <button type="submit" className="btn btn-primary">
              Send
            </button>
          </form>
        </CardBody>
      </Card>
    </Container>
  );
}

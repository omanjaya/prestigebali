// Admin — Inbox Chat (US 30-33). Server Component: daftar seluruh Percakapan
// yang terikat ke Booking, terbaru di atas, dengan cuplikan pesan terakhir.
// Guard: hanya ADMIN, selain itu → /login. Auto-refresh sederhana via revalidate.
//
// Baris percakapan dirender sebagai satu markup (bukan <table>) yang berpindah
// dari layout grid ala-tabel (desktop) menjadi kartu bertumpuk (ponsel) lewat
// CSS grid-template-areas — bukan markup ganda — dan seluruh baris adalah
// tautan (<Link>) supaya area sentuh di ponsel besar.

import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { listAdminConversations } from "@/lib/conversations";
import { Container, Card, CardBody } from "@/ui/primitives";
import { formatWIB } from "@/ui/format";

// Refresh berkala (polling ringan) agar admin melihat pesan baru tanpa reload manual.
export const revalidate = 5;

const CI_STYLE = `
  .ci-list {
    display: flex;
    flex-direction: column;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    overflow: hidden;
  }
  .ci-row {
    display: grid;
    grid-template-areas: "name car snippet count time";
    grid-template-columns: 1fr 0.8fr 1.6fr auto auto;
    align-items: center;
    gap: 0.5rem 1.25rem;
    padding: 0.9rem 1.1rem;
    text-decoration: none;
    color: inherit;
    border-bottom: 1px solid var(--border);
    transition: background 0.15s ease;
    min-height: 40px;
  }
  .ci-row:last-child {
    border-bottom: none;
  }
  .ci-row:hover,
  .ci-row:focus-visible {
    background: color-mix(in srgb, var(--surface-2) 55%, transparent);
    outline: none;
  }
  .ci-name {
    grid-area: name;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    min-width: 0;
  }
  .ci-name-text {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .ci-unread {
    flex: 0 0 auto;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 20px;
    height: 20px;
    padding: 0 6px;
    border-radius: 999px;
    background: var(--accent);
    color: #fff;
    font-size: 0.7rem;
    font-weight: 700;
    line-height: 1;
  }
  .ci-car {
    grid-area: car;
    color: var(--muted);
    font-size: 0.85rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    min-width: 0;
  }
  .ci-snippet {
    grid-area: snippet;
    color: var(--muted);
    font-size: 0.9rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    min-width: 0;
  }
  .ci-count {
    grid-area: count;
    font-size: 0.8rem;
    color: var(--muted);
    text-align: right;
    white-space: nowrap;
  }
  .ci-time {
    grid-area: time;
    font-size: 0.8rem;
    color: var(--muted);
    text-align: right;
    white-space: nowrap;
  }
  .ci-empty {
    padding: 2rem;
    text-align: center;
  }
  @media (max-width: 640px) {
    .ci-row {
      grid-template-areas:
        "name time"
        "snippet snippet";
      grid-template-columns: 1fr auto;
      row-gap: 0.3rem;
      padding: 1rem 1.1rem;
      min-height: 64px;
    }
    .ci-car,
    .ci-count {
      display: none;
    }
  }
`;

export default async function AdminChatPage() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/login");

  const conversations = await listAdminConversations();

  return (
    <Container style={{ paddingBottom: "3rem" }}>
      <style>{CI_STYLE}</style>

      <div
        className="reveal"
        style={{
          padding: "3rem 0 2rem",
          borderBottom: "1px solid var(--border)",
          marginBottom: "2.5rem",
        }}
      >
        <div className="kicker" style={{ marginBottom: "0.75rem" }}>
          Admin · Support
        </div>
        <h1 style={{ margin: 0 }}>Chat Inbox</h1>
        <p className="muted" style={{ margin: "0.6rem 0 0", maxWidth: 560 }}>
          Conversations with customers, tied to their bookings.
        </p>
      </div>

      <div className="reveal">
        <Card>
          <CardBody>
            <div
              className="row"
              style={{ justifyContent: "space-between", alignItems: "baseline", marginBottom: "0.5rem" }}
            >
              <h2 style={{ margin: 0 }}>Conversations</h2>
              <span className="eyebrow">{conversations.length} total</span>
            </div>

            <div className="ci-list">
              {conversations.length === 0 ? (
                <p className="muted ci-empty">No conversations yet.</p>
              ) : (
                conversations.map((c) => (
                  <Link key={c.bookingId} href={`/admin/chat/${c.bookingId}`} className="ci-row">
                    <span className="ci-name" style={{ fontWeight: c.unreadCount > 0 ? 800 : 600 }}>
                      <span className="ci-name-text">{c.customerName}</span>
                      {c.unreadCount > 0 ? (
                        <span className="ci-unread" aria-label={`${c.unreadCount} unread`}>
                          {c.unreadCount}
                        </span>
                      ) : null}
                    </span>
                    <span className="ci-car">{c.carName}</span>
                    <span className="ci-snippet">{c.lastMessage ?? "—"}</span>
                    <span className="ci-count">{c.messageCount} msgs</span>
                    <span className="ci-time">{c.lastAt ? formatWIB(c.lastAt) : "—"}</span>
                  </Link>
                ))
              )}
            </div>
          </CardBody>
        </Card>
      </div>
    </Container>
  );
}

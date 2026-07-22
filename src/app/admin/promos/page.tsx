// Admin — Manage Promo Codes. Server Component: daftar seluruh PromoCode dari DB
// dengan aksi edit per baris + tombol tambah. Guard: hanya ADMIN, selain itu → /login.
// Kode promo dibuat admin & dibagikan secara PRIVAT (chat/WA) — tidak dipublikasikan.

import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { listPromoCodes, type PromoView } from "@/lib/promo";
import { Container, Card, CardBody, ButtonLink } from "@/ui/primitives";
import { formatIDR, formatDateWIB } from "@/ui/format";

// Selalu baca DB terbaru — jangan cache halaman admin.
export const dynamic = "force-dynamic";

function formatValue(p: Pick<PromoView, "kind" | "value">): string {
  return p.kind === "PERCENT" ? `${p.value}%` : formatIDR(p.value);
}

export default async function AdminPromosPage() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/login");

  const promos = await listPromoCodes();

  return (
    <Container style={{ paddingBottom: "3rem" }}>
      <div
        className="reveal row"
        style={{
          justifyContent: "space-between",
          alignItems: "flex-end",
          gap: "1.5rem",
          padding: "3rem 0 2rem",
          borderBottom: "1px solid var(--border)",
          marginBottom: "2.5rem",
        }}
      >
        <div>
          <div className="kicker" style={{ marginBottom: "0.75rem" }}>
            Marketing · Promos
          </div>
          <h1 style={{ margin: 0 }}>Promo Codes</h1>
          <p className="muted" style={{ margin: "0.6rem 0 0", maxWidth: 560 }}>
            Buat kode promo lalu bagikan secara privat ke pelanggan (chat/WA). Pelanggan
            memasukkan kodenya sendiri saat booking.
          </p>
        </div>
        <div className="row" style={{ gap: "0.75rem", alignItems: "center" }}>
          <ButtonLink href="/admin/promos/new" variant="primary">
            New promo
          </ButtonLink>
        </div>
      </div>

      <div className="reveal">
        <Card>
          <CardBody>
            <div
              className="row"
              style={{ justifyContent: "space-between", alignItems: "baseline", marginBottom: "0.5rem" }}
            >
              <h2 style={{ margin: 0 }}>All promo codes</h2>
              <span className="eyebrow">{promos.length} codes</span>
            </div>
            <div className="admin-table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Kind</th>
                    <th style={{ textAlign: "right" }}>Value</th>
                    <th>Status</th>
                    <th style={{ textAlign: "right" }}>Used</th>
                    <th>Expires</th>
                    <th>Note</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {promos.length === 0 ? (
                    <tr>
                      <td colSpan={8}>
                        <div
                          className="row"
                          style={{ justifyContent: "space-between", gap: "1rem" }}
                        >
                          <span className="muted">No promo codes yet. Create your first one.</span>
                          <ButtonLink href="/admin/promos/new" variant="primary">
                            New promo
                          </ButtonLink>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    promos.map((p) => (
                      <tr key={p.id}>
                        <td style={{ fontWeight: 600, whiteSpace: "nowrap" }}>{p.code}</td>
                        <td>{p.kind === "PERCENT" ? "Percent" : "Fixed"}</td>
                        <td style={{ textAlign: "right" }} className="price">
                          {formatValue(p)}
                        </td>
                        <td>
                          <span className={p.active ? "badge badge-ok" : "badge badge-danger"}>
                            {p.active ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td style={{ textAlign: "right" }}>
                          {p.usedCount} / {p.maxUses ?? "∞"}
                        </td>
                        <td className="muted" style={{ whiteSpace: "nowrap" }}>
                          {p.expiresAt ? formatDateWIB(p.expiresAt) : "—"}
                        </td>
                        <td className="muted">{p.note ?? "—"}</td>
                        <td>
                          <Link href={`/admin/promos/${p.id}`} className="btn btn-sm">
                            Edit
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>
      </div>
    </Container>
  );
}

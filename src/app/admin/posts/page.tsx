// Admin — Manage Blog Posts. Server Component: daftar seluruh Post dari DB dengan
// aksi edit per baris + tombol tambah. Guard: hanya ADMIN, selain itu → /login.
// Catatan: dibaca langsung lewat Prisma (bukan lib/posts.ts) agar tabel bisa
// menampilkan `updatedAt`, yang tidak ada di PostView publik.

import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Container, Card, CardBody, ButtonLink } from "@/ui/primitives";
import { formatDateWIB } from "@/ui/format";

// Selalu baca DB terbaru — jangan cache halaman admin.
export const dynamic = "force-dynamic";

export default async function AdminPostsPage() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/login");

  const posts = await prisma.post.findMany({ orderBy: { updatedAt: "desc" } });

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
            Content · Posts
          </div>
          <h1 style={{ margin: 0 }}>Blog Posts</h1>
          <p className="muted" style={{ margin: "0.6rem 0 0", maxWidth: 560 }}>
            Kelola artikel /blog. Draft tidak tampil publik sampai dipublish.
          </p>
        </div>
        <div className="row" style={{ gap: "0.75rem", alignItems: "center" }}>
          <ButtonLink href="/admin/posts/new" variant="primary">
            New post
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
              <h2 style={{ margin: 0 }}>All posts</h2>
              <span className="eyebrow">{posts.length} articles</span>
            </div>
            <div className="admin-table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Slug</th>
                    <th>Status</th>
                    <th>Published</th>
                    <th>Updated</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {posts.length === 0 ? (
                    <tr>
                      <td colSpan={6}>
                        <div
                          className="row"
                          style={{ justifyContent: "space-between", gap: "1rem" }}
                        >
                          <span className="muted">No posts yet. Write your first article.</span>
                          <ButtonLink href="/admin/posts/new" variant="primary">
                            New post
                          </ButtonLink>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    posts.map((p) => (
                      <tr key={p.id}>
                        <td style={{ fontWeight: 600 }}>{p.title}</td>
                        <td className="muted">{p.slug}</td>
                        <td>
                          <span className={p.published ? "badge badge-ok" : "badge badge-accent"}>
                            {p.published ? "Published" : "Draft"}
                          </span>
                        </td>
                        <td className="muted" style={{ whiteSpace: "nowrap" }}>
                          {p.publishedAt ? formatDateWIB(p.publishedAt) : "—"}
                        </td>
                        <td className="muted" style={{ whiteSpace: "nowrap" }}>
                          {formatDateWIB(p.updatedAt)}
                        </td>
                        <td>
                          <div className="admin-actions-row" style={{ flexWrap: "nowrap" }}>
                            <Link href={`/admin/posts/${p.id}`} className="btn btn-sm">
                              Edit
                            </Link>
                            <Link
                              href={`/blog/${p.slug}`}
                              target="_blank"
                              className="btn btn-sm btn-ghost"
                              title={
                                p.published
                                  ? undefined
                                  : "Draft — tidak tampil publik sampai dipublish"
                              }
                            >
                              Preview ↗
                            </Link>
                          </div>
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

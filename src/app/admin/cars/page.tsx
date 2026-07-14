// Admin — Manage Cars. Server Component: daftar seluruh CarModel dari DB dengan
// aksi edit per baris + tombol tambah. Guard: hanya ADMIN, selain itu → /login.

import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Container, Card, CardBody, ButtonLink } from "@/ui/primitives";
import { CATEGORY_LABEL } from "@/lib/catalog";
import { formatIDR } from "@/ui/format";

// Selalu baca DB terbaru — jangan cache halaman admin.
export const dynamic = "force-dynamic";

function rate(value: number | null): string {
  return value == null ? "—" : formatIDR(value);
}

export default async function AdminCarsPage() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/login");

  const cars = await prisma.carModel.findMany({
    orderBy: [{ brand: "asc" }, { name: "asc" }],
  });

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
            Admin · Fleet
          </div>
          <h1 style={{ margin: 0 }}>Manage Cars</h1>
          <p className="muted" style={{ margin: "0.6rem 0 0", maxWidth: 560 }}>
            Add, edit, and remove catalog vehicles.
          </p>
        </div>
        <div className="row" style={{ gap: "0.75rem", alignItems: "center" }}>
          <Link href="/admin" className="btn btn-sm btn-ghost">
            ← Back to Admin
          </Link>
          <ButtonLink href="/admin/cars/new" variant="primary">
            Add car
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
            <h2 style={{ margin: 0 }}>Catalog</h2>
            <span className="eyebrow">{cars.length} vehicles</span>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Photo</th>
                  <th>Name</th>
                  <th>Brand</th>
                  <th>Category</th>
                  <th>Stock</th>
                  <th>Daily Rate</th>
                  <th>Chauffeur</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {cars.length === 0 ? (
                  <tr>
                    <td colSpan={8}>
                      <span className="muted">No cars yet. Add your first vehicle.</span>
                    </td>
                  </tr>
                ) : (
                  cars.map((c) => (
                    <tr key={c.id}>
                      <td>
                        {c.photos[0] ? (
                          <Image
                            src={c.photos[0]}
                            alt={c.name}
                            width={64}
                            height={44}
                            unoptimized
                            style={{
                              display: "block",
                              objectFit: "cover",
                              borderRadius: "var(--radius)",
                              border: "1px solid var(--border)",
                            }}
                          />
                        ) : (
                          <span
                            aria-hidden="true"
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              width: 64,
                              height: 44,
                              borderRadius: "var(--radius)",
                              border: "1px solid var(--border)",
                              background: "var(--surface-2)",
                              color: "var(--muted-dim)",
                              fontSize: "0.9rem",
                            }}
                          >
                            —
                          </span>
                        )}
                      </td>
                      <td style={{ fontWeight: 600, whiteSpace: "nowrap" }}>{c.name}</td>
                      <td>{c.brand}</td>
                      <td>
                        <span className="badge badge-accent">{CATEGORY_LABEL[c.category]}</span>
                      </td>
                      <td>{c.stock}</td>
                      <td style={{ whiteSpace: "nowrap" }}>{rate(c.dailyRate)}</td>
                      <td style={{ whiteSpace: "nowrap" }}>{rate(c.chauffeurPackage)}</td>
                      <td>
                        <Link href={`/admin/cars/${c.id}`} className="btn btn-sm">
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

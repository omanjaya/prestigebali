// Admin — Manage Cars. Server Component: daftar seluruh CarModel dari DB dengan
// aksi edit per baris + tombol tambah. Guard: hanya ADMIN, selain itu → /login.

import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Container, Card, CardBody, PageHeader, ButtonLink } from "@/ui/primitives";
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
      <div className="row" style={{ justifyContent: "space-between", alignItems: "flex-start" }}>
        <PageHeader title="Manage Cars" subtitle="Add, edit, and remove catalog vehicles." />
        <div className="row" style={{ gap: "0.75rem", alignItems: "center" }}>
          <Link href="/admin" className="btn btn-ghost">
            ← Back to Admin
          </Link>
          <ButtonLink href="/admin/cars/new" variant="primary">
            Add car
          </ButtonLink>
        </div>
      </div>

      <Card>
        <CardBody>
          <h2 style={{ marginTop: 0 }}>Catalog ({cars.length})</h2>
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
                              objectFit: "cover",
                              borderRadius: "var(--radius)",
                              border: "1px solid var(--border)",
                            }}
                          />
                        ) : (
                          <span className="muted" style={{ fontSize: "0.8rem" }}>
                            —
                          </span>
                        )}
                      </td>
                      <td>{c.name}</td>
                      <td>{c.brand}</td>
                      <td>{CATEGORY_LABEL[c.category]}</td>
                      <td>{c.stock}</td>
                      <td>{rate(c.dailyRate)}</td>
                      <td>{rate(c.chauffeurPackage)}</td>
                      <td>
                        <Link href={`/admin/cars/${c.id}`} className="btn">
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
    </Container>
  );
}

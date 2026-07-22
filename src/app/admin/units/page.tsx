// Admin — Manage Units (US 35). Server Component: daftar seluruh Unit (CarUnit)
// dari DB, dikelompokkan per Mobil, dengan aksi edit per baris + tombol tambah.
// Guard: hanya ADMIN, selain itu → /login.

import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { listAllUnits } from "@/lib/units";
import { Container, Card, CardBody, ButtonLink } from "@/ui/primitives";

// Selalu baca DB terbaru — jangan cache halaman admin.
export const dynamic = "force-dynamic";

export default async function AdminUnitsPage() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/login");

  const units = await listAllUnits();

  const groups = new Map<string, { carName: string; units: typeof units }>();
  for (const u of units) {
    const g = groups.get(u.carModelId);
    if (g) {
      g.units.push(u);
    } else {
      groups.set(u.carModelId, { carName: u.carName, units: [u] });
    }
  }
  const sortedGroups = Array.from(groups.values()).sort((a, b) =>
    a.carName.localeCompare(b.carName),
  );

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
            Fleet · Units
          </div>
          <h1 style={{ margin: 0 }}>Manage Units</h1>
          <p className="muted" style={{ margin: "0.6rem 0 0", maxWidth: 560 }}>
            Physical vehicles (plate, color, odometer) available for allocation.
          </p>
        </div>
        <div className="row" style={{ gap: "0.75rem", alignItems: "center" }}>
          <ButtonLink href="/admin/units/new" variant="primary">
            Add unit
          </ButtonLink>
        </div>
      </div>

      {sortedGroups.length === 0 ? (
        <div className="reveal">
          <Card>
            <CardBody>
              <div className="row" style={{ justifyContent: "space-between", gap: "1rem" }}>
                <span className="muted">No units yet. Add your first unit.</span>
                <ButtonLink href="/admin/units/new" variant="primary">
                  New unit
                </ButtonLink>
              </div>
            </CardBody>
          </Card>
        </div>
      ) : (
        sortedGroups.map((g) => (
          <div className="reveal" key={g.carName} style={{ marginBottom: "2rem" }}>
            <Card>
              <CardBody>
                <div
                  className="row"
                  style={{
                    justifyContent: "space-between",
                    alignItems: "baseline",
                    marginBottom: "0.5rem",
                  }}
                >
                  <h2 style={{ margin: 0 }}>{g.carName}</h2>
                  <span className="eyebrow">{g.units.length} unit(s)</span>
                </div>
                <div className="admin-table-wrap">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Plate</th>
                        <th>Color</th>
                        <th>Odometer</th>
                        <th>Condition</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {g.units.map((u) => (
                        <tr key={u.id}>
                          <td style={{ fontWeight: 600, whiteSpace: "nowrap" }}>{u.plate}</td>
                          <td>{u.color}</td>
                          <td>{u.odometer.toLocaleString("id-ID")} km</td>
                          <td>{u.condition ?? "—"}</td>
                          <td>
                            <Link href={`/admin/units/${u.id}`} className="btn btn-sm">
                              Edit
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardBody>
            </Card>
          </div>
        ))
      )}
    </Container>
  );
}

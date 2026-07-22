// Admin — Edit an existing Promo Code. Server Component (guard ADMIN) yang memuat
// PromoCode lalu merender PromoForm dalam mode edit. Next 16: params async.

import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { getPromoCode, listBookingsForPromo } from "@/lib/promo";
import { Container, Card, CardBody, PageHeader } from "@/ui/primitives";
import { formatIDR, formatWIB, STATUS_LABEL } from "@/ui/format";
import type { BookingStatus } from "@/domain/booking/booking";
import { PromoForm } from "../promo-form";

export const dynamic = "force-dynamic";

export default async function EditPromoPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/login");

  const { id } = await params;
  const promo = await getPromoCode(id);
  if (!promo) notFound();

  const usage = await listBookingsForPromo(promo.code);

  return (
    <Container style={{ maxWidth: 640, paddingBottom: "3rem" }}>
      <Link href="/admin/promos" className="btn btn-ghost" style={{ marginTop: "2rem" }}>
        ← Back to Promo Codes
      </Link>
      <Card style={{ marginTop: "1rem" }}>
        <CardBody>
          <PageHeader title="Edit Promo" subtitle={promo.code} />
          <PromoForm promo={promo} />
        </CardBody>
      </Card>

      <Card style={{ marginTop: "1.5rem" }}>
        <CardBody>
          <div
            className="row"
            style={{ justifyContent: "space-between", alignItems: "baseline", marginBottom: "0.75rem" }}
          >
            <h2 style={{ margin: 0 }}>Recent usage</h2>
            <span className="eyebrow">{usage.length} bookings</span>
          </div>
          <div className="admin-table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>When</th>
                  <th>Booking</th>
                  <th>Customer</th>
                  <th>Car</th>
                  <th>Status</th>
                  <th style={{ textAlign: "right" }}>Discount</th>
                </tr>
              </thead>
              <tbody>
                {usage.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="muted" style={{ textAlign: "center", padding: "2rem" }}>
                      Belum ada booking memakai kode ini.
                    </td>
                  </tr>
                ) : (
                  usage.map((u) => (
                    <tr key={u.bookingId}>
                      <td style={{ whiteSpace: "nowrap" }} className="muted">
                        {formatWIB(u.createdAt)}
                      </td>
                      <td>
                        <Link href={`/admin/bookings/${u.bookingId}`}>{u.bookingId}</Link>
                      </td>
                      <td>{u.customerName}</td>
                      <td>{u.carName}</td>
                      <td>{STATUS_LABEL[u.status as BookingStatus] ?? u.status}</td>
                      <td style={{ textAlign: "right" }} className="price">
                        {formatIDR(u.discountAmount)}
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

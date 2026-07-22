// Admin — Add a new Promo Code. Server Component (guard ADMIN) yang merender
// PromoForm dalam mode create.

import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { Container, Card, CardBody, PageHeader } from "@/ui/primitives";
import { PromoForm } from "../promo-form";

export const dynamic = "force-dynamic";

export default async function NewPromoPage() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/login");

  return (
    <Container style={{ maxWidth: 640, paddingBottom: "3rem" }}>
      <Link href="/admin/promos" className="btn btn-ghost" style={{ marginTop: "2rem" }}>
        ← Back to Promo Codes
      </Link>
      <Card style={{ marginTop: "1rem" }}>
        <CardBody>
          <PageHeader title="Add Promo" subtitle="Create a new promo code." />
          <PromoForm />
        </CardBody>
      </Card>
    </Container>
  );
}

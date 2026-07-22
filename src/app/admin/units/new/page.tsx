// Admin — Add a new Unit. Server Component (guard ADMIN) yang merender UnitForm
// dalam mode create.

import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { listCarModels } from "@/lib/catalog";
import { Container, Card, CardBody, PageHeader } from "@/ui/primitives";
import { UnitForm } from "../unit-form";

export const dynamic = "force-dynamic";

export default async function NewUnitPage() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/login");

  const cars = await listCarModels();

  return (
    <Container style={{ maxWidth: 640, paddingBottom: "3rem" }}>
      <Link href="/admin/units" className="btn btn-ghost" style={{ marginTop: "2rem" }}>
        ← Back to Units
      </Link>
      <Card style={{ marginTop: "1rem" }}>
        <CardBody>
          <PageHeader title="Add Unit" subtitle="Register a new physical vehicle." />
          <UnitForm cars={cars} />
        </CardBody>
      </Card>
    </Container>
  );
}

// Admin — Edit an existing Unit. Server Component (guard ADMIN) yang memuat
// Unit lalu merender UnitForm dalam mode edit. Next 16: params async.

import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { getUnit } from "@/lib/units";
import { listCarModels } from "@/lib/catalog";
import { Container, Card, CardBody, PageHeader } from "@/ui/primitives";
import { UnitForm } from "../unit-form";

export const dynamic = "force-dynamic";

export default async function EditUnitPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/login");

  const { id } = await params;
  const unit = await getUnit(id);
  if (!unit) notFound();

  const cars = await listCarModels();

  return (
    <Container style={{ maxWidth: 640, paddingBottom: "3rem" }}>
      <Link href="/admin/units" className="btn btn-ghost" style={{ marginTop: "2rem" }}>
        ← Back to Units
      </Link>
      <Card style={{ marginTop: "1rem" }}>
        <CardBody>
          <PageHeader title="Edit Unit" subtitle={unit.plate} />
          <UnitForm unit={unit} cars={cars} />
        </CardBody>
      </Card>
    </Container>
  );
}

// Admin — Edit an existing Car. Server Component (guard ADMIN) yang memuat
// CarModel lalu merender CarForm dalam mode edit. Next 16: params async.

import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { getCarModel } from "@/lib/catalog";
import { Container, Card, CardBody, PageHeader } from "@/ui/primitives";
import { CarForm } from "../car-form";

export const dynamic = "force-dynamic";

export default async function EditCarPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/login");

  const { id } = await params;
  const car = await getCarModel(id);
  if (!car) notFound();

  return (
    <Container style={{ maxWidth: 640, paddingBottom: "3rem" }}>
      <Link href="/admin/cars" className="btn btn-ghost" style={{ marginTop: "2rem" }}>
        ← Back to Cars
      </Link>
      <Card style={{ marginTop: "1rem" }}>
        <CardBody>
          <PageHeader title="Edit Car" subtitle={`${car.brand} ${car.name}`} />
          <CarForm car={car} />
        </CardBody>
      </Card>
    </Container>
  );
}

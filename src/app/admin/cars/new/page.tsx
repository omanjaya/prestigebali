// Admin — Add a new Car. Server Component (guard ADMIN) yang merender CarForm
// dalam mode create.

import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { Container, Card, CardBody, PageHeader } from "@/ui/primitives";
import { CarForm } from "../car-form";

export const dynamic = "force-dynamic";

export default async function NewCarPage() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/login");

  return (
    <Container style={{ maxWidth: 640, paddingBottom: "3rem" }}>
      <Link href="/admin/cars" className="btn btn-ghost" style={{ marginTop: "2rem" }}>
        ← Back to Cars
      </Link>
      <Card style={{ marginTop: "1rem" }}>
        <CardBody>
          <PageHeader title="Add Car" subtitle="Create a new catalog vehicle." />
          <CarForm />
        </CardBody>
      </Card>
    </Container>
  );
}

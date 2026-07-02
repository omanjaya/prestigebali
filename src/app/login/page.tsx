// Halaman login admin (Server Component).

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Card, CardBody, Container, PageHeader } from "@/ui/primitives";
import { LoginForm } from "./login-form";

export default async function LoginPage() {
  const session = await auth();
  if (session?.user?.role === "ADMIN") {
    redirect("/admin");
  }

  return (
    <Container style={{ maxWidth: 420, padding: "3rem 1.25rem" }}>
      <Card>
        <CardBody>
          <PageHeader
            title="Masuk Admin"
            subtitle="Area khusus pengelola. Masuk dengan akun admin Anda."
          />
          <p className="muted" style={{ marginTop: 0 }}>
            Halaman ini hanya untuk administrator Prestige.
          </p>
          <LoginForm />
        </CardBody>
      </Card>
    </Container>
  );
}

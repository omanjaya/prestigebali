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
            title="Admin Sign-in"
            subtitle="Management-only area. Sign in with your admin account."
          />
          <p className="muted" style={{ marginTop: 0 }}>
            This page is for Prestige administrators only.
          </p>
          <LoginForm />
        </CardBody>
      </Card>
    </Container>
  );
}

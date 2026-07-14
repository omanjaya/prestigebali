// Halaman login admin (Server Component).

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Container } from "@/ui/primitives";
import { Icon } from "@/ui/icons";
import { LoginForm } from "./login-form";

export default async function LoginPage() {
  const session = await auth();
  if (session?.user?.role === "ADMIN") {
    redirect("/admin");
  }

  return (
    <Container style={{ maxWidth: 480, padding: "clamp(2.5rem, 9vh, 5.5rem) 1.25rem" }}>
      <div
        className="reveal"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "1.75rem",
        }}
      >
        {/* Brand seal */}
        <div style={{ textAlign: "center" }}>
          <span
            aria-hidden="true"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 58,
              height: 58,
              borderRadius: "50%",
              color: "var(--accent)",
              border: "1px solid color-mix(in srgb, var(--accent) 40%, var(--border))",
              background: "var(--accent-soft)",
              marginBottom: "1.1rem",
            }}
          >
            <Icon name="shield" size={24} />
          </span>
          <div className="kicker" style={{ marginBottom: "0.6rem" }}>
            Prestige Bali
          </div>
          <h1 style={{ margin: 0, fontSize: "clamp(2rem, 5vw, 2.6rem)" }}>Admin Sign-in</h1>
          <p className="muted" style={{ margin: "0.6rem auto 0", maxWidth: 340 }}>
            Management-only area. Sign in with your admin account to continue.
          </p>
        </div>

        {/* Kartu kredensial */}
        <div className="card" style={{ width: "100%" }}>
          <div className="card-body" style={{ padding: "clamp(1.75rem, 5vw, 2.4rem)" }}>
            <LoginForm />
          </div>
        </div>

        <p
          className="muted"
          style={{
            margin: 0,
            fontSize: "0.76rem",
            letterSpacing: "0.02em",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <Icon name="key" size={14} style={{ color: "var(--accent)" }} />
          Restricted access. Prestige administrators only.
        </p>
      </div>
    </Container>
  );
}

"use client";

// Form login admin (client component) memakai useActionState.

import { useActionState } from "react";
import { Field } from "@/ui/primitives";
import { Icon } from "@/ui/icons";
import { loginAction, type LoginState } from "./actions";

const initialState: LoginState = {};

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="stack" style={{ gap: "1.25rem" }}>
      <Field label="Email" htmlFor="email">
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          placeholder="you@prestige.bali"
          required
          autoFocus
        />
      </Field>

      <Field label="Password" htmlFor="password">
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          required
        />
      </Field>

      {state.error ? (
        <p
          role="alert"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.55rem",
            margin: 0,
            padding: "0.7rem 0.85rem",
            fontSize: "0.85rem",
            color: "var(--danger)",
            background: "color-mix(in srgb, var(--danger) 12%, transparent)",
            border: "1px solid color-mix(in srgb, var(--danger) 40%, transparent)",
            borderRadius: "var(--radius)",
          }}
        >
          <Icon name="shield" size={15} style={{ flexShrink: 0 }} />
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        className="btn btn-primary"
        disabled={pending}
        style={{ width: "100%", marginTop: "0.25rem" }}
      >
        {pending ? (
          "Signing in…"
        ) : (
          <>
            Sign in <Icon name="arrow" size={16} />
          </>
        )}
      </button>
    </form>
  );
}

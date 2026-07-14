"use server";

// Server Action untuk login ADMIN.
// Auth.js v5: signIn yang sukses melempar error redirect (NEXT_REDIRECT) yang
// HARUS diteruskan. Kita hanya menangkap kegagalan auth (AuthError).

import { AuthError } from "next-auth";
import { signIn } from "@/auth";

export type LoginState = { error?: string };

export async function loginAction(
  _prevState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  try {
    await signIn("credentials", { email, password, redirectTo: "/admin" });
    return {};
  } catch (error) {
    // Kegagalan kredensial → tampilkan pesan.
    if (error instanceof AuthError) {
      return { error: "Invalid email or password." };
    }
    // Selain itu (termasuk NEXT_REDIRECT dari login sukses) → teruskan.
    throw error;
  }
}

"use server";

// Server Actions untuk manajemen artikel Blog (Post) oleh ADMIN.
// savePostAction: create (tanpa id) atau update (dengan id). deletePostAction: hapus.
// Setiap aksi WAJIB memeriksa ulang otorisasi (defense-in-depth), tidak hanya
// mengandalkan guard di halaman. revalidatePath (/admin/posts DAN /blog publik) +
// redirect di jalur sukses.

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { createPost, updatePost, deletePost, type PostInput } from "@/lib/posts";

export interface PostFormState {
  error?: string;
}

/** Guard bersama: lempar bila bukan ADMIN. */
async function requireAdmin(): Promise<void> {
  const s = await auth();
  if (s?.user?.role !== "ADMIN") throw new Error("Unauthorized");
}

/**
 * Simpan artikel. Jika FormData punya `id` → update, jika tidak → create.
 * Redirect dilempar DI LUAR try/catch (redirect() memakai throw internal).
 */
export async function savePostAction(
  _prevState: PostFormState,
  formData: FormData,
): Promise<PostFormState> {
  await requireAdmin();

  const id = String(formData.get("id") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim();
  const excerpt = String(formData.get("excerpt") ?? "").trim();
  const coverImage = String(formData.get("coverImage") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const published = formData.get("published") === "on";

  if (!title) return { error: "Title is required." };
  if (!body) return { error: "Body is required." };

  const input: PostInput = {
    title,
    slug: slug || undefined,
    excerpt: excerpt || undefined,
    coverImage: coverImage || undefined,
    body,
    published,
  };

  try {
    if (id) {
      await updatePost(id, input);
    } else {
      await createPost(input);
    }
  } catch (error) {
    console.error("savePostAction gagal", error);
    return { error: "Could not save the post. The slug may already be in use." };
  }

  revalidatePath("/admin/posts");
  revalidatePath("/blog");
  redirect("/admin/posts");
}

/** Hapus artikel. */
export async function deletePostAction(formData: FormData): Promise<PostFormState> {
  await requireAdmin();

  const id = String(formData.get("id") ?? "").trim();
  if (!id) return { error: "Missing post id." };

  try {
    await deletePost(id);
  } catch (error) {
    console.error("deletePostAction gagal", error);
    return { error: "Could not delete this post. Please try again." };
  }

  revalidatePath("/admin/posts");
  revalidatePath("/blog");
  redirect("/admin/posts");
}

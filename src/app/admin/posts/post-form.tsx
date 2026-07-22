"use client";

// Form artikel Blog bersama (create & edit). Client Component memakai useActionState.
// Mode edit menyertakan hidden `id` + tombol Delete (form terpisah).

import Link from "next/link";
import { useActionState } from "react";
import { Field } from "@/ui/primitives";
import type { PostView } from "@/lib/posts";
import { savePostAction, deletePostAction, type PostFormState } from "./actions";
import { ConfirmButton } from "../confirm-button";

const initialState: PostFormState = {};

export function PostForm({ post }: { post?: PostView }) {
  const [state, formAction, pending] = useActionState(savePostAction, initialState);
  // deletePostAction(formData) mengikuti signature plain form-action; adaptasi ke
  // bentuk useActionState (prevState, payload) agar error bisa ditampilkan.
  const [deleteState, deleteAction, deleting] = useActionState<PostFormState, FormData>(
    (_prev, formData) => deletePostAction(formData),
    initialState,
  );

  const isEdit = Boolean(post);

  return (
    <>
      <form action={formAction} className="stack" style={{ gap: "1.5rem" }}>
        {post ? <input type="hidden" name="id" value={post.id} /> : null}

        <div className="admin-form-grid">
          <Field label="Title" htmlFor="title">
            <input id="title" name="title" type="text" defaultValue={post?.title ?? ""} required />
          </Field>

          <Field label="Slug (optional)" htmlFor="slug">
            <input
              id="slug"
              name="slug"
              type="text"
              placeholder="Kosongkan untuk otomatis dari judul"
              defaultValue={post?.slug ?? ""}
            />
          </Field>

          <div style={{ gridColumn: "1 / -1" }}>
            <Field label="Excerpt (optional)" htmlFor="excerpt">
              <textarea
                id="excerpt"
                name="excerpt"
                rows={2}
                placeholder="Ringkasan pendek untuk daftar artikel"
                defaultValue={post?.excerpt ?? ""}
              />
            </Field>
          </div>

          <div style={{ gridColumn: "1 / -1" }}>
            <Field label="Cover image URL (optional)" htmlFor="coverImage">
              <input
                id="coverImage"
                name="coverImage"
                type="text"
                placeholder="https://images.unsplash.com/…"
                defaultValue={post?.coverImage ?? ""}
              />
            </Field>
          </div>

          <div style={{ gridColumn: "1 / -1" }}>
            <Field label="Body" htmlFor="body">
              <textarea id="body" name="body" rows={12} defaultValue={post?.body ?? ""} required />
              <p className="muted" style={{ margin: "0.35rem 0 0", fontSize: "0.85rem" }}>
                Pisahkan paragraf dengan baris kosong.
              </p>
            </Field>
          </div>

          <div style={{ gridColumn: "1 / -1" }}>
            <Field label="Published" htmlFor="published">
              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <input
                  id="published"
                  name="published"
                  type="checkbox"
                  defaultChecked={post?.published ?? false}
                />
                <span className="muted">Tampilkan artikel ini di /blog</span>
              </label>
            </Field>
          </div>
        </div>

        {state.error ? (
          <p className="muted" style={{ color: "var(--danger)" }} role="alert">
            {state.error}
          </p>
        ) : null}

        <div className="divider" style={{ margin: "0.5rem 0" }} />

        <div className="admin-actions-row">
          <button type="submit" className="btn btn-primary" disabled={pending}>
            {pending ? "Saving…" : isEdit ? "Save changes" : "Create post"}
          </button>
          <Link href="/admin/posts" className="btn btn-ghost">
            Cancel
          </Link>
        </div>
      </form>

      {post ? (
        <form action={deleteAction} style={{ marginTop: "2rem" }}>
          <input type="hidden" name="id" value={post.id} />
          <div className="divider" style={{ margin: "1rem 0" }} />
          {deleteState.error ? (
            <p className="muted" style={{ color: "var(--danger)" }} role="alert">
              {deleteState.error}
            </p>
          ) : null}
          <div className="admin-actions-row">
            <ConfirmButton className="btn btn-ghost" disabled={deleting}>
              {deleting ? "Deleting…" : "Delete post"}
            </ConfirmButton>
          </div>
        </form>
      ) : null}
    </>
  );
}

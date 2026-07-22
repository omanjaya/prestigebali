// Blog — helper baca/tulis artikel (Post). Publik: hanya published; Admin: semua.
// Body disimpan sebagai teks paragraf sederhana (dipisah baris kosong); render
// publik memecahnya menjadi <p> tanpa perlu library markdown.

import { prisma } from "@/lib/prisma";

export interface PostView {
  id: string;
  slug: string;
  title: string;
  excerpt?: string;
  coverImage?: string;
  body: string;
  published: boolean;
  publishedAt?: Date;
  createdAt: Date;
}

type PostRow = {
  id: string; slug: string; title: string; excerpt: string | null;
  coverImage: string | null; body: string; published: boolean;
  publishedAt: Date | null; createdAt: Date;
};

function toView(row: PostRow): PostView {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt ?? undefined,
    coverImage: row.coverImage ?? undefined,
    body: row.body,
    published: row.published,
    publishedAt: row.publishedAt ?? undefined,
    createdAt: row.createdAt,
  };
}

/** Slug URL dari judul: huruf kecil, non-alfanumerik → "-", tanpa "-" ganda. */
export function slugify(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/** Artikel published untuk /blog publik, terbaru dulu. */
export async function listPublishedPosts(): Promise<PostView[]> {
  const rows = await prisma.post.findMany({
    where: { published: true },
    orderBy: { publishedAt: "desc" },
  });
  return rows.map(toView);
}

/** Satu artikel published berdasarkan slug (halaman detail publik). */
export async function getPublishedPost(slug: string): Promise<PostView | undefined> {
  const row = await prisma.post.findUnique({ where: { slug } });
  return row && row.published ? toView(row) : undefined;
}

// --- CRUD untuk panel admin ---

export async function listAllPosts(): Promise<PostView[]> {
  const rows = await prisma.post.findMany({ orderBy: { createdAt: "desc" } });
  return rows.map(toView);
}

export async function getPost(id: string): Promise<PostView | undefined> {
  const row = await prisma.post.findUnique({ where: { id } });
  return row ? toView(row) : undefined;
}

export interface PostInput {
  title: string;
  slug?: string;
  excerpt?: string;
  coverImage?: string;
  body: string;
  published: boolean;
}

export async function createPost(input: PostInput): Promise<void> {
  await prisma.post.create({
    data: {
      title: input.title,
      slug: input.slug?.trim() || slugify(input.title),
      excerpt: input.excerpt || null,
      coverImage: input.coverImage || null,
      body: input.body,
      published: input.published,
      publishedAt: input.published ? new Date() : null,
    },
  });
}

export async function updatePost(id: string, input: PostInput): Promise<void> {
  const existing = await prisma.post.findUnique({ where: { id }, select: { publishedAt: true } });
  await prisma.post.update({
    where: { id },
    data: {
      title: input.title,
      slug: input.slug?.trim() || slugify(input.title),
      excerpt: input.excerpt || null,
      coverImage: input.coverImage || null,
      body: input.body,
      published: input.published,
      // Set publishedAt saat pertama kali dipublish; jangan reset saat edit berikutnya.
      publishedAt: input.published ? (existing?.publishedAt ?? new Date()) : null,
    },
  });
}

export async function deletePost(id: string): Promise<void> {
  await prisma.post.delete({ where: { id } });
}

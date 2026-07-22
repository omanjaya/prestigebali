// Admin — Edit an existing Blog Post. Server Component (guard ADMIN) yang memuat
// Post lalu merender PostForm dalam mode edit. Next 16: params async.

import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { getPost } from "@/lib/posts";
import { Container, Card, CardBody, PageHeader } from "@/ui/primitives";
import { PostForm } from "../post-form";

export const dynamic = "force-dynamic";

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/login");

  const { id } = await params;
  const post = await getPost(id);
  if (!post) notFound();

  return (
    <Container style={{ maxWidth: 720, paddingBottom: "3rem" }}>
      <Link href="/admin/posts" className="btn btn-ghost" style={{ marginTop: "2rem" }}>
        ← Back to Posts
      </Link>
      <Card style={{ marginTop: "1rem" }}>
        <CardBody>
          <PageHeader title="Edit Post" subtitle={post.title} />
          <PostForm post={post} />
        </CardBody>
      </Card>
    </Container>
  );
}

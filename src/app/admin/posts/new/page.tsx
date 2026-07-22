// Admin — Write a new Blog Post. Server Component (guard ADMIN) yang merender
// PostForm dalam mode create.

import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { Container, Card, CardBody, PageHeader } from "@/ui/primitives";
import { PostForm } from "../post-form";

export const dynamic = "force-dynamic";

export default async function NewPostPage() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/login");

  return (
    <Container style={{ maxWidth: 720, paddingBottom: "3rem" }}>
      <Link href="/admin/posts" className="btn btn-ghost" style={{ marginTop: "2rem" }}>
        ← Back to Posts
      </Link>
      <Card style={{ marginTop: "1rem" }}>
        <CardBody>
          <PageHeader title="New Post" subtitle="Write a new article for /blog." />
          <PostForm />
        </CardBody>
      </Card>
    </Container>
  );
}

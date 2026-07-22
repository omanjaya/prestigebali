// Blog post detail — public. Server Component (async); notFound() bila slug
// tak ada atau belum dipublish. Body disimpan sebagai paragraf teks polos,
// dipecah oleh baris kosong menjadi <p> (lihat src/lib/posts.ts).

import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getT } from "@/i18n/server";
import { siteMessages } from "@/i18n/messages/site";
import { getPublishedPost } from "@/lib/posts";
import { formatDateWIB } from "@/ui/format";
import { Container, Card, CardMedia, ButtonLink } from "@/ui/primitives";
import { Icon } from "@/ui/icons";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedPost(slug);
  return {
    title: post ? `${post.title} — Prestige Bali` : "Prestige Bali",
    description: post?.excerpt,
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [post, { t }] = await Promise.all([getPublishedPost(slug), getT(siteMessages)]);
  if (!post) notFound();

  const paragraphs = post.body.split(/\n\s*\n/).filter((p) => p.trim().length > 0);

  return (
    <Container style={{ padding: "2.5rem 0 4rem" }}>
      <ButtonLink href="/blog" variant="ghost">
        <Icon name="chevron" size={15} style={{ transform: "rotate(180deg)" }} />{" "}
        {t("site.blog.backToBlog")}
      </ButtonLink>

      <div className="stack" style={{ maxWidth: 760, margin: "1.75rem auto 0", gap: "1.75rem" }}>
        <div>
          {post.publishedAt ? <span className="eyebrow">{formatDateWIB(post.publishedAt)}</span> : null}
          <h1 style={{ margin: "0.6rem 0 0" }}>{post.title}</h1>
        </div>

        {post.coverImage ? (
          <Card>
            <div style={{ aspectRatio: "16 / 9", position: "relative" }}>
              <CardMedia
                label={post.title}
                src={post.coverImage}
                priority
                sizes="(max-width: 800px) 100vw, 760px"
              />
            </div>
          </Card>
        ) : null}

        <div className="stack" style={{ gap: "1.1rem" }}>
          {paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>

        <div>
          <ButtonLink href="/blog" variant="ghost">
            <Icon name="chevron" size={15} style={{ transform: "rotate(180deg)" }} />{" "}
            {t("site.blog.backToBlog")}
          </ButtonLink>
        </div>
      </div>
    </Container>
  );
}

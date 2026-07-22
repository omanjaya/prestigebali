// Blog (Journal) — public listing of published posts. Server Component (async).
// Reuses global .card / .card-media / .card-body classes (globals.css/landing.css).

import type { Metadata } from "next";
import Link from "next/link";

import { getT } from "@/i18n/server";
import { siteMessages } from "@/i18n/messages/site";
import { listPublishedPosts } from "@/lib/posts";
import { formatDateWIB } from "@/ui/format";
import { Container, CardMedia } from "@/ui/primitives";
import { Icon } from "@/ui/icons";

export const metadata: Metadata = {
  title: "Journal — Prestige Bali",
  description: "Stories from the island — the fleet, the roads worth taking, and life around Prestige Bali.",
};

export default async function BlogPage() {
  const { t } = await getT(siteMessages);
  const posts = await listPublishedPosts();

  return (
    <>
      <Container style={{ padding: "4.5rem 0 1rem", textAlign: "center" }}>
        <div className="kicker">{t("site.blog.kicker")}</div>
        <h1 style={{ margin: "0.7rem auto 0" }}>{t("site.blog.title")}</h1>
        <p className="muted" style={{ maxWidth: 560, margin: "1rem auto 0" }}>
          {t("site.blog.sub")}
        </p>
      </Container>

      <Container style={{ padding: "1.5rem 0 4rem" }}>
        {posts.length === 0 ? (
          <p className="muted" style={{ textAlign: "center", padding: "3rem 0" }}>
            {t("site.blog.empty")}
          </p>
        ) : (
          <div className="grid">
            {posts.map((post) => (
              <Link key={post.slug} href={`/blog/${post.slug}`} className="card" style={{ display: "block" }}>
                <CardMedia label={post.title} src={post.coverImage} sizes="(max-width: 700px) 100vw, 33vw" />
                <div className="card-body">
                  {post.publishedAt ? (
                    <span className="eyebrow">{formatDateWIB(post.publishedAt)}</span>
                  ) : null}
                  <h3 style={{ margin: "0.5rem 0 0.5rem" }}>{post.title}</h3>
                  {post.excerpt ? (
                    <p className="muted" style={{ margin: 0 }}>
                      {post.excerpt}
                    </p>
                  ) : null}
                  <span className="car-cta" style={{ marginTop: "1.1rem" }}>
                    {t("site.blog.readMore")} <Icon name="arrow" size={15} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Container>
    </>
  );
}

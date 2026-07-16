import Link from "next/link";
import { notFound } from "next/navigation";
import { DEMO_POSTS } from "../demoPosts";

type Props = { params: Promise<{ slug: string }> };

export default async function NewsDetailPage({ params }: Props) {
  const { slug } = await params;
  const post = DEMO_POSTS.find((p) => p.slug === slug);
  if (!post) notFound();

  return (
    <article style={{ maxWidth: 720, display: "flex", flexDirection: "column", gap: "var(--spacing-md)" }}>
      <Link href="/news" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-muted)" }}>
        ← Tin tức
      </Link>
      <h1 style={{ fontFamily: "var(--font-display)", margin: 0 }}>{post.title}</h1>
      <p style={{ margin: 0, color: "var(--color-text-muted)" }}>
        {post.authorName}
        {post.publishedAt ? ` · ${new Date(post.publishedAt).toLocaleDateString("vi-VN")}` : ""}
      </p>
      <div
        style={{ fontFamily: "var(--font-body)", lineHeight: 1.6 }}
        dangerouslySetInnerHTML={{ __html: post.bodyHtml }}
      />
    </article>
  );
}

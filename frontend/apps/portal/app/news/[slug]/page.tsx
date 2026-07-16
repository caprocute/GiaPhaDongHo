import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@giapha/ui";
import { fetchPost } from "../../../src/lib/api";
import { DEMO_POSTS } from "../../../src/lib/demoContent";

type Props = { params: Promise<{ slug: string }> };

export default async function NewsDetailPage({ params }: Props) {
  const { slug } = await params;
  const api = await fetchPost(slug);
  const post = api ?? DEMO_POSTS.find((p) => p.slug === slug);
  if (!post) notFound();

  return (
    <article style={{ maxWidth: 720, display: "flex", flexDirection: "column", gap: "var(--spacing-md)" }}>
      <Link href="/news" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-muted)" }}>
        ← Tin tức
      </Link>
      <div style={{ display: "flex", alignItems: "baseline", gap: "var(--spacing-md)" }}>
        <h1 style={{ fontFamily: "var(--font-display)", margin: 0 }}>{post.title}</h1>
        {!api ? <Badge>Demo</Badge> : null}
      </div>
      <p style={{ margin: 0, color: "var(--color-text-muted)" }}>
        {post.authorName}
        {post.publishedAt ? ` · ${new Date(post.publishedAt).toLocaleDateString("vi-VN")}` : ""}
      </p>
      <div
        style={{ fontFamily: "var(--font-body)", lineHeight: 1.6 }}
        dangerouslySetInnerHTML={{ __html: post.bodyHtml ?? "" }}
      />
    </article>
  );
}

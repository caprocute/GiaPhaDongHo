"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Badge, EmptyState } from "@giapha/ui";
import { DEMO_POSTS, type DemoPost } from "./demoPosts";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ?? "";

async function loadPosts(): Promise<{ posts: DemoPost[]; source: "api" | "demo" }> {
  if (!API_BASE) {
    return { posts: DEMO_POSTS, source: "demo" };
  }
  try {
    const res = await fetch(`${API_BASE}/api/v1/posts?size=20&sort=publishedAt,desc`, {
      credentials: "omit",
    });
    if (!res.ok) throw new Error(String(res.status));
    const data = (await res.json()) as Array<{
      slug: string;
      title: string;
      summary?: string;
      bodyHtml?: string;
      publishedAt?: string;
      authorName?: string;
      category?: { slug?: string };
    }>;
    const posts: DemoPost[] = data.map((p) => ({
      slug: p.slug,
      title: p.title,
      summary: p.summary ?? "",
      bodyHtml: p.bodyHtml ?? "",
      categorySlug: p.category?.slug ?? "",
      publishedAt: p.publishedAt ?? "",
      authorName: p.authorName ?? "",
    }));
    return { posts, source: "api" };
  } catch {
    return { posts: DEMO_POSTS, source: "demo" };
  }
}

export function NewsListClient() {
  const [posts, setPosts] = useState<DemoPost[]>([]);
  const [source, setSource] = useState<"api" | "demo">("demo");

  useEffect(() => {
    let cancelled = false;
    void loadPosts().then((r) => {
      if (!cancelled) {
        setPosts(r.posts);
        setSource(r.source);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (posts.length === 0) {
    return <EmptyState title="Chưa có tin" description="Quay lại sau khi ban biên tập xuất bản bài." />;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-lg)", maxWidth: 720 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: "var(--spacing-md)", flexWrap: "wrap" }}>
        <h1 style={{ fontFamily: "var(--font-display)", margin: 0 }}>Tin tức</h1>
        {source === "demo" ? <Badge tone="default">Demo (chưa nối API)</Badge> : null}
      </div>
      <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "var(--spacing-md)" }}>
        {posts.map((p) => (
          <li key={p.slug}>
            <article
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "var(--spacing-xs)",
                paddingBottom: "var(--spacing-md)",
                borderBottom: "1px solid var(--color-border-subtle)",
              }}
            >
              <Link
                href={`/news/${p.slug}`}
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "var(--font-size-lg)",
                  color: "var(--color-text-primary)",
                  textDecoration: "none",
                }}
              >
                {p.title}
              </Link>
              <p style={{ margin: 0, color: "var(--color-text-muted)" }}>{p.summary}</p>
              <span style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)" }}>
                {p.categorySlug ? `${p.categorySlug} · ` : ""}
                {p.publishedAt ? new Date(p.publishedAt).toLocaleDateString("vi-VN") : ""}
              </span>
            </article>
          </li>
        ))}
      </ul>
    </div>
  );
}

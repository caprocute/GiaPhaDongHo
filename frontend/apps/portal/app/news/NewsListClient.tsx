"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Badge, EmptyState } from "@giapha/ui";
import { fetchPosts } from "../../src/lib/api";
import { DEMO_POSTS } from "../../src/lib/demoContent";
import type { ApiPost } from "../../src/lib/types";

export function NewsListClient() {
  const [posts, setPosts] = useState<ApiPost[]>([]);
  const [source, setSource] = useState<"api" | "demo">("demo");

  useEffect(() => {
    let cancelled = false;
    void fetchPosts(20).then((list) => {
      if (cancelled) return;
      if (list.length) {
        setPosts(list);
        setSource("api");
      } else {
        setPosts(DEMO_POSTS);
        setSource("demo");
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
        {source === "demo" ? <Badge>Demo</Badge> : null}
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
                {p.category?.slug ? `${p.category.slug} · ` : ""}
                {p.publishedAt ? new Date(p.publishedAt).toLocaleDateString("vi-VN") : ""}
              </span>
            </article>
          </li>
        ))}
      </ul>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { EmptyState } from "@giapha/ui";
import { PageShell } from "../../src/chrome/PageShell";
import { formatViDate } from "../../src/chrome/personUi";
import styles from "../../src/chrome/portal.module.css";
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

  const featured = posts[0];
  const rest = posts.slice(1);

  return (
    <PageShell
      label="Di sản sống"
      title="Tin tức dòng họ"
      lead="Hoạt động, thông báo và gương sáng của họ Hoàng – Huỳnh thôn Trung Bính."
      crumbs={[
        { label: "Trang chủ", href: "/" },
        { label: "Tin tức" },
      ]}
    >
      <p className={styles.note}>
        {source === "demo" ? "Đang hiển thị bài demo" : "Nguồn API"}
      </p>

      {posts.length === 0 ? (
        <EmptyState title="Chưa có tin" description="Quay lại sau khi ban biên tập xuất bản bài." />
      ) : (
        <div className={styles.newsGrid}>
          {featured ? (
            <Link href={`/news/${featured.slug}`} className={styles.feat}>
              <span className={styles.featPh} aria-hidden />
              <span className={styles.featOvl} aria-hidden />
              <div className={styles.featBody}>
                <div className={styles.featCat}>
                  {featured.category?.name ?? featured.category?.slug ?? "Tin tức"}
                </div>
                <h3>{featured.title}</h3>
                <div className={styles.featMeta}>
                  {featured.authorName ?? "Ban biên tập"}
                  {featured.publishedAt ? ` · ${formatViDate(featured.publishedAt)}` : ""}
                </div>
              </div>
            </Link>
          ) : null}

          <div className={styles.newsList}>
            {rest.map((p) => (
              <Link key={p.slug} href={`/news/${p.slug}`} className={styles.newsItem}>
                <span className={styles.thumb} aria-hidden />
                <div>
                  <h4>{p.title}</h4>
                  <div className={styles.newsMeta}>
                    {p.category?.name ?? p.category?.slug ?? "Tin"}
                    {p.publishedAt ? ` · ${formatViDate(p.publishedAt)}` : ""}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </PageShell>
  );
}

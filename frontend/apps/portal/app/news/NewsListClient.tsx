"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { EmptyState, Pagination } from "@giapha/ui";
import { PageShell } from "../../src/chrome/PageShell";
import { formatViDate } from "../../src/chrome/personUi";
import styles from "../../src/chrome/portal.module.css";
import { fetchCategories, fetchPostsPage } from "../../src/lib/api";
import type { PageResult } from "../../src/lib/api";
import { DEMO_POSTS } from "../../src/lib/demoContent";
import type { ApiCategory, ApiPost } from "../../src/lib/types";

const PAGE_SIZE = 20;

function demoResult(page: number): PageResult<ApiPost> {
  const start = (page - 1) * PAGE_SIZE;
  return {
    content: DEMO_POSTS.slice(start, start + PAGE_SIZE),
    totalElements: DEMO_POSTS.length,
    totalPages: Math.max(1, Math.ceil(DEMO_POSTS.length / PAGE_SIZE)),
    number: page - 1,
    size: PAGE_SIZE,
  };
}

export function NewsListClient() {
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<PageResult<ApiPost>>(demoResult(1));
  const [source, setSource] = useState<"api" | "demo">("demo");
  const [categories, setCategories] = useState<ApiCategory[]>([]);

  useEffect(() => {
    let cancelled = false;
    void fetchCategories().then((cats) => {
      if (!cancelled) setCategories(cats);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    void fetchPostsPage(page - 1, PAGE_SIZE).then((res) => {
      if (cancelled) return;
      if (res.totalElements > 0) {
        setResult(res);
        setSource("api");
      } else {
        setResult(demoResult(page));
        setSource("demo");
      }
    });
    return () => {
      cancelled = true;
    };
  }, [page]);

  const { content: posts, totalElements, totalPages } = result;
  const featured = posts[0];
  const rest = posts.slice(1);

  return (
    <PageShell
      label="Di sản sống"
      title="Tin tức dòng họ"
      lead="Hoạt động, thông báo và gương sáng — chọn chuyên mục do ban biên tập quản lý."
      crumbs={[
        { label: "Trang chủ", href: "/" },
        { label: "Tin tức" },
      ]}
    >
      {categories.length > 0 ? (
        <div className={styles.chips} aria-label="Chuyên mục" style={{ marginBottom: 20 }}>
          <span className={`${styles.chip} ${styles.chipGold}`}>Tất cả</span>
          {categories.map((c) => (
            <Link key={c.slug} href={`/tin/${encodeURIComponent(c.slug)}`} className={styles.chip}>
              {c.name}
            </Link>
          ))}
        </div>
      ) : null}

      {posts.length === 0 ? (
        <EmptyState title="Chưa có tin" description="Quay lại sau khi ban biên tập xuất bản bài." />
      ) : (
        <>
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

          <Pagination
            page={page}
            totalPages={totalPages}
            totalItems={source === "api" ? totalElements : undefined}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
          />
        </>
      )}
    </PageShell>
  );
}

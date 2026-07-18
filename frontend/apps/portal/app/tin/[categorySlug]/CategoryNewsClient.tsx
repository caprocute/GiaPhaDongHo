"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { EmptyState, Pagination } from "@giapha/ui";
import { PageShell } from "../../../src/chrome/PageShell";
import { formatViDate } from "../../../src/chrome/personUi";
import styles from "../../../src/chrome/portal.module.css";
import { fetchCategory, fetchPostsPage, type PageResult } from "../../../src/lib/api";
import type { ApiCategory, ApiPost } from "../../../src/lib/types";

const PAGE_SIZE = 20;

export function CategoryNewsClient({ categorySlug }: { categorySlug: string }) {
  const [category, setCategory] = useState<ApiCategory | null | undefined>(undefined);
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<PageResult<ApiPost>>({
    content: [],
    totalElements: 0,
    totalPages: 1,
    number: 0,
    size: PAGE_SIZE,
  });

  useEffect(() => {
    let cancelled = false;
    void fetchCategory(categorySlug).then((c) => {
      if (!cancelled) setCategory(c);
    });
    return () => {
      cancelled = true;
    };
  }, [categorySlug]);

  useEffect(() => {
    if (!category) return;
    let cancelled = false;
    void fetchPostsPage(page - 1, PAGE_SIZE, categorySlug).then((res) => {
      if (!cancelled) setResult(res);
    });
    return () => {
      cancelled = true;
    };
  }, [page, categorySlug, category]);

  if (category === undefined) {
    return (
      <PageShell
        label="Tin tức"
        title="Đang tải…"
        crumbs={[
          { label: "Trang chủ", href: "/" },
          { label: "Tin tức", href: "/news" },
        ]}
      >
        <p style={{ color: "var(--color-text-muted)" }}>Đang tải chuyên mục…</p>
      </PageShell>
    );
  }

  if (category === null) {
    return (
      <PageShell
        label="Tin tức"
        title="Không tìm thấy chuyên mục"
        crumbs={[
          { label: "Trang chủ", href: "/" },
          { label: "Tin tức", href: "/news" },
        ]}
      >
        <EmptyState
          title="Chuyên mục không tồn tại"
          description="Quay lại danh sách tin để chọn mục khác."
          action={
            <Link href="/news" className={styles.back}>
              ← Về tin tức
            </Link>
          }
        />
      </PageShell>
    );
  }

  const { content: posts, totalElements, totalPages } = result;

  return (
    <PageShell
      label="Tin tức"
      title={category.name}
      lead={category.description ?? undefined}
      crumbs={[
        { label: "Trang chủ", href: "/" },
        { label: "Tin tức", href: "/news" },
        { label: category.name },
      ]}
    >
      {posts.length === 0 ? (
        <EmptyState
          title="Chưa có bài trong mục này"
          description="Ban biên tập sẽ đăng bài khi có nội dung mới."
        />
      ) : (
        <>
          <div className={styles.newsList}>
            {posts.map((p) => (
              <Link key={p.slug} href={`/news/${p.slug}`} className={styles.newsItem}>
                <span className={styles.thumb} aria-hidden />
                <div>
                  <h4>{p.title}</h4>
                  <div className={styles.newsMeta}>
                    {p.authorName ?? "Ban biên tập"}
                    {p.publishedAt ? ` · ${formatViDate(p.publishedAt)}` : ""}
                  </div>
                  {p.summary ? (
                    <p style={{ margin: "6px 0 0", fontSize: 14, color: "var(--color-text-muted)", lineHeight: 1.45 }}>
                      {p.summary}
                    </p>
                  ) : null}
                </div>
              </Link>
            ))}
          </div>
          {totalPages > 1 ? (
            <Pagination
              page={page}
              totalPages={totalPages}
              totalItems={totalElements}
              pageSize={PAGE_SIZE}
              onPageChange={setPage}
            />
          ) : null}
        </>
      )}
    </PageShell>
  );
}

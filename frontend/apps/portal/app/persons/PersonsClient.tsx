"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { EmptyState, Pagination } from "@giapha/ui";
import { PageShell } from "../../src/chrome/PageShell";
import { personInitial } from "../../src/chrome/personUi";
import styles from "../../src/chrome/portal.module.css";
import { fetchPersonsPage } from "../../src/lib/api";
import type { PageResult } from "../../src/lib/api";
import { DEMO_PERSONS } from "../../src/lib/demoContent";
import type { ApiPerson } from "../../src/lib/types";

const PAGE_SIZE = 20;

function buildDemo(query: string): PageResult<ApiPerson> {
  const q = query.trim().toLowerCase();
  const filtered = DEMO_PERSONS.filter(
    (p) => !q || p.fullName.toLowerCase().includes(q) || p.code.toLowerCase().includes(q),
  );
  return {
    content: filtered.slice(0, PAGE_SIZE),
    totalElements: filtered.length,
    totalPages: Math.max(1, Math.ceil(filtered.length / PAGE_SIZE)),
    number: 0,
    size: PAGE_SIZE,
  };
}

export function PersonsClient() {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<PageResult<ApiPerson>>(buildDemo(""));
  const [source, setSource] = useState<"api" | "demo">("demo");

  useEffect(() => {
    setPage(1);
  }, [query]);

  useEffect(() => {
    let cancelled = false;
    void fetchPersonsPage(query || undefined, page - 1, PAGE_SIZE).then((res) => {
      if (cancelled) return;
      if (res.totalElements > 0) {
        setResult(res);
        setSource("api");
      } else {
        setResult(buildDemo(query));
        setSource("demo");
      }
    });
    return () => {
      cancelled = true;
    };
  }, [query, page]);

  const { content: rows, totalElements, totalPages } = result;

  return (
    <PageShell
      label="Gia phả"
      title="Thành viên dòng họ"
      lead="Danh sách hồ sơ theo mã hiệu — họ Hoàng thôn Trung Bính."
      crumbs={[
        { label: "Trang chủ", href: "/" },
        { label: "Gia phả" },
      ]}
      toolbarRight={
        <>
          <Link href="/tree" className={styles.tool}>Mở phả đồ</Link>
          <Link href="/search" className={styles.toolPrimary}>Tìm kiếm</Link>
        </>
      }
    >
      <div className={styles.filterBar}>
        <input
          className={styles.filterInput}
          placeholder="Lọc theo tên / mã hiệu…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Lọc thành viên"
        />
      </div>

      {rows.length === 0 ? (
        <EmptyState title="Không có hồ sơ" description="Thử từ khóa khác hoặc xem phả đồ." />
      ) : (
        <>
          <ul className={styles.list}>
            {rows.map((p) => (
              <li key={p.id}>
                <Link href={`/persons/${encodeURIComponent(p.code)}`} className={styles.row}>
                  <span className={p.gender === "F" ? styles.avatarF : styles.avatar}>
                    {personInitial(p.fullName)}
                  </span>
                  <div className={styles.rowMain}>
                    <div className={styles.rowName}>{p.fullName}</div>
                    <div className={styles.rowMeta}>
                      {p.generation != null ? `Đời ${p.generation}` : "—"}
                      {p.lifeStatus === "deceased" ? " · đã mất" : " · còn sống"}
                    </div>
                  </div>
                  <span className={styles.rowCode}>{p.code}</span>
                </Link>
              </li>
            ))}
          </ul>

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

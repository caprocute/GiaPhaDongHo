"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { EmptyState } from "@giapha/ui";
import { PageShell } from "../../src/chrome/PageShell";
import { personInitial } from "../../src/chrome/personUi";
import styles from "../../src/chrome/portal.module.css";
import { fetchPersons } from "../../src/lib/api";
import { DEMO_PERSONS } from "../../src/lib/demoContent";
import type { ApiPerson } from "../../src/lib/types";

export function PersonsClient() {
  const [query, setQuery] = useState("");
  const [rows, setRows] = useState<ApiPerson[]>([]);
  const [source, setSource] = useState<"api" | "demo">("demo");

  useEffect(() => {
    let cancelled = false;
    void fetchPersons(query || undefined, 80).then((list) => {
      if (cancelled) return;
      if (list.length) {
        setRows(list);
        setSource("api");
      } else {
        const q = query.trim().toLowerCase();
        setRows(
          DEMO_PERSONS.filter(
            (p) =>
              !q ||
              p.fullName.toLowerCase().includes(q) ||
              p.code.toLowerCase().includes(q),
          ),
        );
        setSource("demo");
      }
    });
    return () => {
      cancelled = true;
    };
  }, [query]);

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
          <Link href="/tree" className={styles.tool}>
            Mở phả đồ
          </Link>
          <Link href="/search" className={styles.toolPrimary}>
            Tìm kiếm
          </Link>
        </>
      }
    >
      <p className={styles.note}>
        {source === "demo" ? "Đang hiển thị dữ liệu demo · " : "Nguồn API · "}
        {rows.length} hồ sơ
      </p>

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
        <ul className={styles.list}>
          {rows.map((p) => (
            <li key={p.id}>
              <Link
                href={`/persons/${encodeURIComponent(p.code)}`}
                className={styles.row}
              >
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
      )}
    </PageShell>
  );
}

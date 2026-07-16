"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { EmptyState } from "@giapha/ui";
import { PageShell } from "../../src/chrome/PageShell";
import { personInitial } from "../../src/chrome/personUi";
import styles from "../../src/chrome/portal.module.css";
import { API_BASE, TREE_SLUG } from "../../src/lib/config";
import { DEMO_PERSONS } from "../../src/lib/demoContent";

type Hit = {
  id: number;
  code: string;
  fullName: string;
  treeSlug: string;
  generation?: number | null;
  lifeStatus?: string;
  gender?: string;
};

export function SearchClient() {
  const params = useSearchParams();
  const initial = params.get("q") ?? "";
  const [q, setQ] = useState(initial);
  const [hits, setHits] = useState<Hit[]>([]);
  const [backend, setBackend] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<"api" | "demo">("demo");

  useEffect(() => {
    setQ(initial);
  }, [initial]);

  useEffect(() => {
    if (!API_BASE) return;
    void fetch(`${API_BASE}/api/v1/search/status`)
      .then((r) => r.json())
      .then((d: { backend?: string }) => setBackend(d.backend ?? ""))
      .catch(() => setBackend(""));
  }, []);

  useEffect(() => {
    const term = q.trim();
    if (term.length < 1) {
      setHits([]);
      setError(null);
      return;
    }

    if (!API_BASE) {
      const ql = term.toLowerCase();
      setHits(
        DEMO_PERSONS.filter(
          (p) => p.fullName.toLowerCase().includes(ql) || p.code.toLowerCase().includes(ql),
        ).map((p) => ({
          id: p.id,
          code: p.code,
          fullName: p.fullName,
          treeSlug: TREE_SLUG,
          generation: p.generation,
          lifeStatus: p.lifeStatus,
          gender: p.gender,
        })),
      );
      setSource("demo");
      setError(null);
      return;
    }

    const t = setTimeout(() => {
      void fetch(
        `${API_BASE}/api/v1/search/persons/suggest?tree=${encodeURIComponent(TREE_SLUG)}&q=${encodeURIComponent(term)}&limit=15`,
      )
        .then(async (r) => {
          if (!r.ok) throw new Error(String(r.status));
          return r.json() as Promise<Hit[]>;
        })
        .then((list) => {
          if (list.length) {
            setHits(list);
            setSource("api");
            setError(null);
          } else {
            const ql = term.toLowerCase();
            setHits(
              DEMO_PERSONS.filter(
                (p) =>
                  p.fullName.toLowerCase().includes(ql) || p.code.toLowerCase().includes(ql),
              ).map((p) => ({
                id: p.id,
                code: p.code,
                fullName: p.fullName,
                treeSlug: TREE_SLUG,
                generation: p.generation,
                lifeStatus: p.lifeStatus,
                gender: p.gender,
              })),
            );
            setSource("demo");
            setError(null);
          }
        })
        .catch(() => {
          const ql = term.toLowerCase();
          setHits(
            DEMO_PERSONS.filter(
              (p) =>
                p.fullName.toLowerCase().includes(ql) || p.code.toLowerCase().includes(ql),
            ).map((p) => ({
              id: p.id,
              code: p.code,
              fullName: p.fullName,
              treeSlug: TREE_SLUG,
              generation: p.generation,
              lifeStatus: p.lifeStatus,
              gender: p.gender,
            })),
          );
          setSource("demo");
          setError(null);
        });
    }, 250);
    return () => clearTimeout(t);
  }, [q]);

  return (
    <PageShell
      label="Tra cứu"
      title="Tìm kiếm thành viên"
      lead="Gợi ý theo tên hoặc mã hiệu (không dấu cũng được)."
      crumbs={[
        { label: "Trang chủ", href: "/" },
        { label: "Tìm kiếm" },
      ]}
      toolbarRight={
        <Link href="/persons" className={styles.tool}>
          Danh sách đầy đủ
        </Link>
      }
    >
      <p className={styles.note}>
        Cây: {TREE_SLUG}
        {backend ? ` · backend ${backend}` : ""}
        {source === "demo" && q.trim() ? " · kết quả demo" : ""}
      </p>

      <div className={styles.filterBar}>
        <input
          className={styles.filterInput}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="VD: Hoàng Văn Thành hoặc A7"
          aria-label="Tìm người"
          autoFocus
        />
      </div>

      {error ? (
        <EmptyState title="Lỗi tìm kiếm" description={error} />
      ) : q.trim() && hits.length === 0 ? (
        <EmptyState title="Không có kết quả" description="Thử bỏ dấu hoặc mã hiệu khác." />
      ) : !q.trim() ? (
        <div className={styles.empty}>
          <strong>Nhập tên hoặc mã hiệu</strong>
          Gợi ý sẽ hiện khi bạn gõ ít nhất một ký tự.
        </div>
      ) : (
        <ul className={styles.list}>
          {hits.map((h) => (
            <li key={h.id}>
              <Link href={`/persons/${encodeURIComponent(h.code)}`} className={styles.row}>
                <span className={h.gender === "F" ? styles.avatarF : styles.avatar}>
                  {personInitial(h.fullName)}
                </span>
                <div className={styles.rowMain}>
                  <div className={styles.rowName}>{h.fullName}</div>
                  <div className={styles.rowMeta}>
                    {h.generation != null ? `Đời ${h.generation}` : "—"}
                    {h.lifeStatus === "deceased"
                      ? " · đã mất"
                      : h.lifeStatus === "alive"
                        ? " · còn sống"
                        : ""}
                  </div>
                </div>
                <span className={styles.rowCode}>{h.code}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </PageShell>
  );
}

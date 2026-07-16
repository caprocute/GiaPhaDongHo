"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Badge, EmptyState, FormField, Input } from "@giapha/ui";
import { API_BASE, TREE_SLUG } from "../../src/lib/config";

type Hit = {
  id: number;
  code: string;
  fullName: string;
  treeSlug: string;
  generation?: number | null;
  lifeStatus?: string;
};

export function SearchClient() {
  const params = useSearchParams();
  const initial = params.get("q") ?? "";
  const [q, setQ] = useState(initial);
  const [hits, setHits] = useState<Hit[]>([]);
  const [backend, setBackend] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

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
    if (!API_BASE || term.length < 1) {
      setHits([]);
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
        .then(setHits)
        .catch(() => {
          setHits([]);
          setError("Không gọi được API suggest — kiểm tra BE + NEXT_PUBLIC_API_BASE_URL.");
        });
    }, 250);
    return () => clearTimeout(t);
  }, [q]);

  return (
    <div style={{ maxWidth: 640, display: "flex", flexDirection: "column", gap: "var(--spacing-md)" }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: "var(--spacing-md)", flexWrap: "wrap" }}>
        <h1 style={{ fontFamily: "var(--font-display)", margin: 0 }}>Tìm kiếm</h1>
        {backend ? <Badge tone="default">{backend}</Badge> : null}
      </div>
      <p style={{ margin: 0, color: "var(--color-text-muted)" }}>
        Gợi ý theo tên / mã hiệu, không dấu. Cây: <code>{TREE_SLUG}</code>
      </p>
      <FormField label="Tra cứu">
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="VD: hoang van thanh hoặc A7"
          aria-label="Tìm người"
          autoFocus
        />
      </FormField>
      {!API_BASE ? (
        <EmptyState
          title="Chưa cấu hình API"
          description="Đặt NEXT_PUBLIC_API_BASE_URL=http://localhost:8080 trong .env.local"
        />
      ) : error ? (
        <EmptyState title="Lỗi tìm kiếm" description={error} />
      ) : q.trim() && hits.length === 0 ? (
        <EmptyState title="Không có kết quả" description="Thử bỏ dấu hoặc mã hiệu khác." />
      ) : (
        <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "var(--spacing-sm)" }}>
          {hits.map((h) => (
            <li
              key={h.id}
              style={{
                padding: "var(--spacing-sm) 0",
                borderBottom: "1px solid var(--color-border-subtle)",
                fontFamily: "var(--font-body)",
              }}
            >
              <Link href={`/persons/${encodeURIComponent(h.code)}`} style={{ color: "inherit", textDecoration: "none" }}>
                <strong>{h.fullName}</strong>{" "}
                <code style={{ color: "var(--color-text-muted)" }}>{h.code}</code>
                {h.generation != null ? (
                  <span style={{ color: "var(--color-text-muted)" }}> · đời {h.generation}</span>
                ) : null}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

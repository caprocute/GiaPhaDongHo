"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Badge, EmptyState, Input, PersonNameDisplay } from "@giapha/ui";
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
    <div style={{ maxWidth: 800, display: "flex", flexDirection: "column", gap: "var(--spacing-md)" }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: "var(--spacing-md)", flexWrap: "wrap" }}>
        <h1 style={{ fontFamily: "var(--font-display)", margin: 0 }}>Gia phả</h1>
        {source === "demo" ? <Badge>Demo</Badge> : null}
      </div>
      <Input
        placeholder="Lọc theo tên / mã…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        aria-label="Lọc thành viên"
      />
      {rows.length === 0 ? (
        <EmptyState title="Không có hồ sơ" description="Thử từ khóa khác hoặc xem phả đồ." />
      ) : (
        <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "var(--spacing-sm)" }}>
          {rows.map((p) => (
            <li key={p.id} style={{ borderBottom: "1px solid var(--color-border-subtle)", padding: "var(--spacing-sm) 0" }}>
              <Link href={`/persons/${encodeURIComponent(p.code)}`} style={{ textDecoration: "none", color: "inherit" }}>
                <PersonNameDisplay fullName={p.fullName} generation={p.generation} />
                <div style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)" }}>
                  <code>{p.code}</code>
                  {p.lifeStatus === "deceased" ? " · đã mất" : " · còn sống"}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

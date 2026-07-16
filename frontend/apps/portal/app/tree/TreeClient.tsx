"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { demoFamilyGraph, FamilyTreeCanvas } from "@giapha/tree-viz";
import { FormField, Select } from "@giapha/ui";
import { PageShell } from "../../src/chrome/PageShell";
import styles from "../../src/chrome/portal.module.css";
import { fetchPersons } from "../../src/lib/api";
import { personsToFamilyGraph } from "../../src/lib/toFamilyGraph";

export function TreeClient() {
  const [graph, setGraph] = useState(demoFamilyGraph());
  const [source, setSource] = useState<"api" | "demo">("demo");
  const [rootId, setRootId] = useState(graph.persons[0]?.id ?? "p1");
  const [maxDepth, setMaxDepth] = useState(3);

  useEffect(() => {
    let cancelled = false;
    void fetchPersons(undefined, 200).then((list) => {
      if (cancelled || !list.length) return;
      const g = personsToFamilyGraph(list);
      if (!g.persons.length) return;
      setGraph(g);
      setSource("api");
      setRootId(g.persons[0]?.id ?? "p1");
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const rootPerson = useMemo(
    () => graph.persons.find((p) => p.id === rootId) ?? graph.persons[0],
    [graph, rootId],
  );

  const rootOptions = useMemo(
    () =>
      graph.persons.map((p) => ({
        value: p.id,
        label: `${p.code} — ${p.fullName}`,
      })),
    [graph],
  );

  const depthOptions = [0, 1, 2, 3, 4, 5, 6].map((d) => ({
    value: String(d),
    label: d === 0 ? "Chỉ đời gốc" : `Độ sâu: ${d} đời`,
  }));

  return (
    <PageShell
      title="Phả đồ"
      flush
      crumbs={[
        { label: "Gia phả", href: "/persons" },
        { label: "Họ Hoàng Thôn Trung Bính" },
        { label: `Phả đồ · ${graph.persons.length} người` },
      ]}
      toolbarRight={
        <>
          <label className={styles.tool} style={{ cursor: "default", gap: 8 }}>
            <select
              value={rootId}
              onChange={(e) => setRootId(e.target.value)}
              aria-label="Gốc phả đồ"
              style={{
                border: 0,
                background: "transparent",
                font: "inherit",
                color: "inherit",
                maxWidth: 180,
              }}
            >
              {rootOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          <label className={styles.tool} style={{ cursor: "default" }}>
            <select
              value={String(maxDepth)}
              onChange={(e) => setMaxDepth(Number(e.target.value))}
              aria-label="Độ sâu"
              style={{
                border: 0,
                background: "transparent",
                font: "inherit",
                color: "inherit",
              }}
            >
              {depthOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          <Link href="/persons" className={styles.toolPrimary}>
            Danh sách thành viên
          </Link>
        </>
      }
    >
      <div className={styles.treeZone}>
        <div className={styles.treeCanvas}>
          <FamilyTreeCanvas graph={graph} rootId={rootId} maxDepth={maxDepth} height="100%" />
        </div>
        <aside className={styles.sidepanel}>
          <h3>{rootPerson?.fullName ?? "—"}</h3>
          <p>
            {rootPerson?.code ? `Mã ${rootPerson.code}` : ""}
            {rootPerson?.generation != null ? ` · Đời ${rootPerson.generation}` : ""}
            {source === "demo" ? " · Demo graph" : " · API"}
          </p>
          <div>
            <div className={styles.sideRow}>
              <span className={styles.sideKey}>Mã hiệu</span>
              <span className={styles.sideVal}>{rootPerson?.code ?? "—"}</span>
            </div>
            <div className={styles.sideRow}>
              <span className={styles.sideKey}>Đời</span>
              <span className={styles.sideVal}>
                {rootPerson?.generation != null ? `Thứ ${rootPerson.generation}` : "—"}
              </span>
            </div>
            <div className={styles.sideRow}>
              <span className={styles.sideKey}>Người trên đồ</span>
              <span className={styles.sideVal}>{graph.persons.length}</span>
            </div>
          </div>
          <div className={styles.spActions}>
            {rootPerson?.code ? (
              <Link
                href={`/persons/${encodeURIComponent(rootPerson.code)}`}
                className={styles.toolPrimary}
              >
                Xem hồ sơ
              </Link>
            ) : null}
            <FormField label="Đổi gốc (chi tiết)">
              <Select value={rootId} options={rootOptions} onChange={(e) => setRootId(e.target.value)} />
            </FormField>
          </div>
          <div className={styles.legend}>
            <span>
              <i style={{ background: "var(--color-action-primary-bg)" }} />
              Nam
            </span>
            <span>
              <i style={{ background: "var(--color-heritage-accent)" }} />
              Nữ
            </span>
            <span>
              <i
                style={{
                  background: "transparent",
                  border: "1.5px dashed var(--color-heritage-accent)",
                }}
              />
              Hôn phối
            </span>
          </div>
        </aside>
      </div>
    </PageShell>
  );
}

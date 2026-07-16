"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  demoFamilyGraph,
  FamilyTreeCanvas,
  type FamilyTreeCanvasHandle,
  type PersonNodeData,
} from "@giapha/tree-viz";
import { fetchPersons } from "../../src/lib/api";
import { personsToFamilyGraph } from "../../src/lib/toFamilyGraph";
import styles from "./tree.module.css";

function honorific(p: PersonNodeData): string {
  if (p.gender === "F") return `Bà ${p.fullName}`;
  if (p.gender === "M") return `Ông ${p.fullName}`;
  return p.fullName;
}

function glyphOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return (parts[parts.length - 1] ?? "?").slice(0, 1).toLocaleUpperCase("vi-VN");
}

export function TreeClient() {
  const demo = useMemo(() => demoFamilyGraph(), []);
  const [graph, setGraph] = useState(demo);
  const [source, setSource] = useState<"api" | "demo">("demo");
  const defaultRoot = demo.persons.find((p) => p.code === "A22")?.id ?? demo.persons[0]!.id;
  const [rootId, setRootId] = useState(defaultRoot);
  const [maxDepth, setMaxDepth] = useState(3);
  const [showFrame, setShowFrame] = useState(true);
  const [selected, setSelected] = useState<PersonNodeData | null>(
    () => demo.persons.find((p) => p.id === defaultRoot) ?? demo.persons[0] ?? null,
  );
  const canvasRef = useRef<FamilyTreeCanvasHandle>(null);

  useEffect(() => {
    let cancelled = false;
    void fetchPersons(undefined, 200).then((list) => {
      if (cancelled || !list.length) return;
      const g = personsToFamilyGraph(list);
      // API graph thường thiếu union vợ chồng — chỉ dùng khi đủ phong phú
      if (g.persons.length < 8 || g.unions.length < 2) return;
      setGraph(g);
      setSource("api");
      const root = g.persons[0];
      if (root) {
        setRootId(root.id);
        setSelected(root);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const focusPerson = selected ?? graph.persons.find((p) => p.id === rootId) ?? graph.persons[0] ?? null;
  const visibleCount = useMemo(() => {
    // số người trong nhánh đang layout — xấp xỉ bằng persons trong graph khi demo
    return graph.persons.length;
  }, [graph.persons.length]);

  const rootOptions = useMemo(
    () =>
      graph.persons.map((p) => ({
        value: p.id,
        label: `${p.code} — ${p.fullName}`,
      })),
    [graph],
  );

  const onSelectPerson = useCallback((p: PersonNodeData | null) => {
    if (p) setSelected(p);
  }, []);

  const goThuyTo = () => {
    const to = graph.persons.find((p) => p.code === "A7") ?? graph.persons[0];
    if (!to) return;
    setRootId(to.id);
    setSelected(to);
  };

  const reRootHere = () => {
    if (!focusPerson) return;
    setRootId(focusPerson.id);
  };

  return (
    <div className={styles.page}>
      <div className={styles.band} aria-hidden />
      <div className={styles.pdBar}>
        <div className={styles.wrap}>
          <span className={styles.crumb}>
            Gia phả / <b>Họ Hoàng Thôn Trung Bính</b> / Phả đồ ·{" "}
            <span className={styles.num}>{visibleCount}</span> người trong nhánh
            {source === "demo" ? " · demo" : ""}
          </span>
          <div className={styles.tools}>
            <label className={styles.tool}>
              Độ sâu:{" "}
              <select
                value={String(maxDepth)}
                onChange={(e) => setMaxDepth(Number(e.target.value))}
                aria-label="Độ sâu"
              >
                {[0, 1, 2, 3, 4, 5, 6].map((d) => (
                  <option key={d} value={d}>
                    {d === 0 ? "0 đời" : `${d} đời`}
                  </option>
                ))}
              </select>
            </label>
            <label className={styles.tool}>
              Gốc{" "}
              <select
                value={rootId}
                onChange={(e) => {
                  setRootId(e.target.value);
                  const p = graph.persons.find((x) => x.id === e.target.value);
                  if (p) setSelected(p);
                }}
                aria-label="Gốc phả đồ"
              >
                {rootOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
            <button type="button" className={styles.tool} onClick={goThuyTo}>
              ⌂ Thủy tổ
            </button>
            <button
              type="button"
              className={`${styles.tool}${!showFrame ? ` ${styles.toolActive}` : ""}`}
              onClick={() => setShowFrame((v) => !v)}
              aria-pressed={!showFrame}
            >
              {showFrame ? "Tắt khung" : "Bật khung"}
            </button>
            <button
              type="button"
              className={styles.tool}
              onClick={() => void canvasRef.current?.exportSvg()}
            >
              Tải SVG
            </button>
            <button
              type="button"
              className={styles.tool}
              onClick={() => void canvasRef.current?.exportPng()}
            >
              Tải PNG
            </button>
            <button
              type="button"
              className={styles.toolPrimary}
              onClick={() => void canvasRef.current?.exportPng()}
              title="Tạm xuất PNG — PDF ấn phẩm sẽ bổ sung sau"
            >
              Xuất PDF ấn phẩm
            </button>
          </div>
        </div>
      </div>

      <div className={styles.zone}>
        <div className={styles.canvas}>
          <FamilyTreeCanvas
            ref={canvasRef}
            graph={graph}
            rootId={rootId}
            maxDepth={maxDepth}
            height="100%"
            showExport={false}
            showFrame={showFrame}
            selectedId={focusPerson?.id ?? null}
            onSelectPerson={onSelectPerson}
          />
        </div>

        <aside className={styles.side}>
          {focusPerson ? (
            <>
              <div className={styles.portrait}>
                <div className={styles.portraitInner}>{glyphOf(focusPerson.fullName)}</div>
              </div>
              <h2>{honorific(focusPerson)}</h2>
              <div className={styles.vitals}>
                {focusPerson.subtitle ??
                  (focusPerson.lifeStatus === "deceased" ? "Đã mất" : "Còn sống")}
                {focusPerson.generation != null ? ` · Đời thứ ${focusPerson.generation}` : ""}
              </div>
              <div className={styles.rows}>
                <div className={styles.row}>
                  <span className={styles.k}>Mã hiệu</span>
                  <span className={styles.v}>{focusPerson.code}</span>
                </div>
                <div className={styles.row}>
                  <span className={styles.k}>Giới tính</span>
                  <span className={styles.v}>
                    {focusPerson.gender === "F" ? "Nữ" : focusPerson.gender === "M" ? "Nam" : "—"}
                  </span>
                </div>
                <div className={styles.row}>
                  <span className={styles.k}>Trạng thái</span>
                  <span className={styles.v}>
                    {focusPerson.lifeStatus === "deceased" ? "Đã mất" : "Còn sống"}
                  </span>
                </div>
                <div className={styles.row}>
                  <span className={styles.k}>Đời</span>
                  <span className={styles.v}>
                    {focusPerson.generation != null ? `Thứ ${focusPerson.generation}` : "—"}
                  </span>
                </div>
              </div>
              <div className={styles.actions}>
                <Link
                  href={`/persons/${encodeURIComponent(focusPerson.code)}`}
                  className={styles.toolPrimary}
                >
                  Xem hồ sơ
                </Link>
                <button type="button" className={styles.tool} onClick={reRootHere}>
                  Vẽ cây từ đây
                </button>
              </div>
            </>
          ) : (
            <p className={styles.vitals}>Chọn một người trên sơ đồ</p>
          )}

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
            <span>
              <i
                style={{
                  background: "transparent",
                  border: "2px solid var(--color-action-primary-bg)",
                }}
              />
              Gốc đang xem
            </span>
          </div>
        </aside>
      </div>
    </div>
  );
}

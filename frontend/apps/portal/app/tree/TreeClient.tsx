"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  demoFamilyGraph,
  FamilyTreeCanvas,
  type FamilyTreeCanvasHandle,
  type PersonNodeData,
} from "@giapha/tree-viz";
import { useSiteSettings } from "../../src/chrome/SiteSettingsProvider";
import { fetchPersons } from "../../src/lib/api";
import { personsToFamilyGraph } from "../../src/lib/toFamilyGraph";
import {
  IconBranch,
  IconFrame,
  IconFrameOff,
  IconHome,
  IconImage,
  IconLayers,
  IconPdf,
  IconProfile,
  IconSvg,
  IconUserTree,
} from "./TreeIcons";
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
  const settings = useSiteSettings();
  const brand = settings.displayName ?? "Họ Hoàng Trung Bính";
  const allowExport = settings.tree?.allowTreeExport === true;
  const publicTree = settings.tree?.publicTree !== false;
  const pageSize = Math.min(500, Math.max(20, settings.tree?.maxNodesDefault ?? 43));

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
  const [exportBusy, setExportBusy] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  useEffect(() => {
    if (!publicTree) {
      setGraph({ persons: [], unions: [] });
      setSource("api");
      setSelected(null);
      return;
    }
    let cancelled = false;
    void fetchPersons(undefined, pageSize).then((list) => {
      if (cancelled || !list.length) return;
      const g = personsToFamilyGraph(list);
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
  }, [pageSize, publicTree]);

  const focusPerson =
    selected ?? graph.persons.find((p) => p.id === rootId) ?? graph.persons[0] ?? null;
  const visibleCount = graph.persons.length;

  const rootOptions = useMemo(
    () =>
      graph.persons.map((p) => ({
        value: p.id,
        label: `${p.code} — ${p.fullName}`,
        short: p.code,
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

  const runExport = async (kind: "png" | "svg" | "pdf") => {
    if (!allowExport) {
      setExportError("Xuất phả đồ đang tắt trong cấu hình dòng họ.");
      return;
    }
    const api = canvasRef.current;
    if (!api || exportBusy) return;
    setExportError(null);
    setExportBusy(true);
    try {
      if (kind === "png") await api.exportPng();
      else if (kind === "svg") await api.exportSvg();
      else await api.exportPdf();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Xuất file thất bại.";
      setExportError(msg);
    } finally {
      setExportBusy(false);
    }
  };

  if (!publicTree) {
    return (
      <div className={styles.page}>
        <div className={styles.band} aria-hidden />
        <div className={styles.pdBar}>
          <div className={styles.wrap}>
            <span className={styles.crumb}>
              Gia phả / <b>{brand}</b> / Phả đồ
            </span>
          </div>
        </div>
        <div className={styles.zone} style={{ padding: "var(--spacing-xl)", textAlign: "center" }}>
          <p style={{ fontFamily: "var(--font-body)", color: "var(--color-text-secondary)" }}>
            Phả đồ hiện chỉ dành cho thành viên đã đăng nhập. Vui lòng đăng nhập hoặc liên hệ ban quản trị.
          </p>
          <p>
            <Link href="/login">Đăng nhập</Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.band} aria-hidden />
      <div className={styles.pdBar}>
        <div className={styles.wrap}>
          <span className={styles.crumb} title={`${brand} · ${visibleCount} người`}>
            <span className={styles.crumbLong}>
              Gia phả / <b>{brand}</b> / Phả đồ ·{" "}
              <span className={styles.num}>{visibleCount}</span>
              {source === "demo" ? " · demo" : ""}
            </span>
            <span className={styles.crumbShort}>
              Phả đồ · <span className={styles.num}>{visibleCount}</span>
              {source === "demo" ? " · demo" : ""}
            </span>
          </span>

          <div className={styles.tools} role="toolbar" aria-label="Công cụ phả đồ">
            <label className={styles.select} title="Độ sâu hậu duệ">
              <IconLayers />
              <span className={styles.srOnly}>Độ sâu</span>
              <select
                value={String(maxDepth)}
                onChange={(e) => setMaxDepth(Number(e.target.value))}
                aria-label="Độ sâu"
              >
                {[0, 1, 2, 3, 4, 5, 6].map((d) => (
                  <option key={d} value={d}>
                    {d === 0 ? "Gốc" : `${d} đời`}
                  </option>
                ))}
              </select>
            </label>

            <label className={`${styles.select} ${styles.selectRoot}`} title="Chọn gốc phả đồ">
              <IconUserTree />
              <span className={styles.srOnly}>Gốc phả đồ</span>
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

            <span className={styles.divider} aria-hidden />

            <button
              type="button"
              className={styles.iconBtn}
              onClick={goThuyTo}
              title="Về thủy tổ"
              aria-label="Về thủy tổ"
            >
              <IconHome />
            </button>
            <button
              type="button"
              className={`${styles.iconBtn}${!showFrame ? ` ${styles.iconBtnActive}` : ""}`}
              onClick={() => setShowFrame((v) => !v)}
              aria-pressed={!showFrame}
              title={showFrame ? "Tắt khung thẻ" : "Bật khung thẻ"}
              aria-label={showFrame ? "Tắt khung thẻ" : "Bật khung thẻ"}
            >
              {showFrame ? <IconFrame /> : <IconFrameOff />}
            </button>
            {allowExport ? (
              <>
                <button
                  type="button"
                  className={styles.iconBtn}
                  onClick={() => void runExport("svg")}
                  title="Tải SVG"
                  aria-label="Tải SVG"
                  disabled={exportBusy}
                >
                  <IconSvg />
                </button>
                <button
                  type="button"
                  className={styles.iconBtn}
                  onClick={() => void runExport("png")}
                  title="Tải PNG"
                  aria-label="Tải PNG"
                  disabled={exportBusy}
                >
                  <IconImage />
                </button>
                <button
                  type="button"
                  className={styles.iconBtnPrimary}
                  onClick={() => void runExport("pdf")}
                  title="Xuất PDF"
                  aria-label="Xuất PDF"
                  disabled={exportBusy}
                >
                  <IconPdf />
                </button>
              </>
            ) : null}
          </div>
        </div>
        {exportError ? (
          <p className={styles.exportError} role="alert">
            {exportError}
          </p>
        ) : null}
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
                  className={styles.actionBtnPrimary}
                >
                  <IconProfile />
                  Hồ sơ
                </Link>
                <button type="button" className={styles.actionBtn} onClick={reRootHere}>
                  <IconBranch />
                  Từ đây
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
              Gốc
            </span>
          </div>
        </aside>
      </div>
    </div>
  );
}

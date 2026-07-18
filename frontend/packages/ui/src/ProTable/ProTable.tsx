"use client";

import {
  type CSSProperties,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Pagination } from "../Pagination/Pagination";

// ─── CSS ────────────────────────────────────────────────────────────────────

let _cssInjected = false;

function ensureCss() {
  if (_cssInjected || typeof document === "undefined") return;
  _cssInjected = true;
  const el = document.createElement("style");
  el.setAttribute("data-pt", "1");
  el.textContent = `
.pt-root{width:100%;display:flex;flex-direction:column;gap:0;
  background:var(--color-surface-card);
  border:1px solid var(--color-border-default);
  border-radius:var(--radius-md);
  overflow:hidden}

/* toolbar */
.pt-toolbar{display:flex;align-items:center;gap:var(--spacing-sm);
  padding:var(--spacing-sm) var(--spacing-md);
  border-bottom:1px solid var(--color-border-subtle);
  flex-wrap:wrap;min-height:50px}
.pt-toolbar-title{font-family:var(--font-display);font-size:15px;
  color:var(--color-text-primary);font-weight:600;flex-shrink:0;margin-right:auto}
.pt-search{display:flex;align-items:center;gap:6px;
  background:var(--color-surface-sunken,var(--color-surface-page));
  border:1px solid var(--color-border-default);
  border-radius:var(--radius-sm);padding:5px 10px;min-width:200px}
.pt-search svg{color:var(--color-text-muted);flex-shrink:0}
.pt-search input{border:none;background:transparent;outline:none;
  font-family:var(--font-body);font-size:13px;
  color:var(--color-text-primary);flex:1;min-width:0}
.pt-search input::placeholder{color:var(--color-text-muted)}
.pt-icon-btn{display:inline-flex;align-items:center;justify-content:center;
  width:32px;height:32px;border-radius:var(--radius-sm);
  border:1px solid var(--color-border-default);
  background:var(--color-surface-card);
  color:var(--color-text-muted);cursor:pointer;flex-shrink:0;transition:all .12s}
.pt-icon-btn:hover{background:var(--color-surface-sunken,var(--color-surface-page));
  color:var(--color-text-primary)}
.pt-icon-btn.on{background:var(--color-action-primary-bg);
  color:var(--color-action-primary-fg);border-color:var(--color-action-primary-bg)}

/* bulk bar */
.pt-bulk-bar{display:flex;align-items:center;gap:var(--spacing-sm);
  padding:7px var(--spacing-md);
  background:var(--color-action-primary-bg);
  color:var(--color-action-primary-fg);font-size:13px;font-weight:600;
  border-bottom:1px solid var(--color-border-default)}
.pt-bulk-bar button{border:1px solid rgba(255,255,255,.4);
  background:transparent;color:inherit;padding:3px 10px;
  border-radius:var(--radius-sm);font-size:12px;font-weight:600;
  cursor:pointer;font-family:var(--font-body)}
.pt-bulk-bar button:hover{background:rgba(255,255,255,.15)}

/* table */
.pt-table-wrap{overflow-x:auto;flex:1}
.pt-table{width:100%;border-collapse:collapse;font-family:var(--font-body)}

/* column toggle panel */
.pt-col-panel{position:relative}
.pt-col-dropdown{position:absolute;top:calc(100% + 4px);right:0;z-index:120;
  background:var(--color-surface-card);
  border:1px solid var(--color-border-default);
  border-radius:var(--radius-md);padding:8px;
  box-shadow:0 4px 14px rgba(0,0,0,.12);min-width:180px}
.pt-col-dropdown label{display:flex;align-items:center;gap:8px;
  padding:5px 6px;font-size:12px;cursor:pointer;
  color:var(--color-text-primary);border-radius:var(--radius-sm)}
.pt-col-dropdown label:hover{background:var(--color-surface-sunken,var(--color-surface-page))}
.pt-col-dropdown input[type=checkbox]{accent-color:var(--color-action-primary-bg);cursor:pointer}

/* th */
.pt-th{text-align:left;padding:var(--spacing-xs) var(--spacing-md);
  background:var(--color-surface-page);
  color:var(--color-text-muted);
  font-family:var(--font-body);font-size:12px;font-weight:600;
  border-bottom:1px solid var(--color-border-subtle);
  white-space:nowrap;user-select:none}
.pt-th.sortable{cursor:pointer}
.pt-th.sortable:hover{color:var(--color-text-primary)}
.pt-th.center{text-align:center}
.pt-th.right{text-align:right}
.pt-th-inner{display:inline-flex;align-items:center;gap:4px}
.pt-sort-icon{font-size:10px;opacity:.4}
.pt-sort-icon.on{opacity:1;color:var(--color-action-primary-bg)}

/* td */
.pt-td{padding:var(--spacing-sm) var(--spacing-md);
  color:var(--color-text-primary);
  font-family:var(--font-body);font-size:14px;
  border-bottom:1px solid var(--color-border-subtle)}
.pt-td.center{text-align:center}
.pt-td.right{text-align:right}

/* row */
.pt-tr:last-child .pt-td{border-bottom:none}
.pt-tr:hover .pt-td{background:var(--color-surface-sunken)}
.pt-tr.clickable{cursor:pointer}
.pt-tr.selected .pt-td{background:color-mix(in srgb,var(--color-action-primary-bg) 8%,transparent)}

/* checkbox cell */
.pt-cb-th,.pt-cb-td{width:40px;padding:var(--spacing-xs) 0 var(--spacing-xs) var(--spacing-md)!important}
.pt-cb{width:15px;height:15px;accent-color:var(--color-action-primary-bg);cursor:pointer}

/* density */
.pt-root.compact .pt-th{padding:4px var(--spacing-sm)}
.pt-root.compact .pt-td{padding:4px var(--spacing-sm);font-size:13px}
.pt-root.spacious .pt-th{padding:var(--spacing-md) var(--spacing-md)}
.pt-root.spacious .pt-td{padding:var(--spacing-md) var(--spacing-md)}

/* skeleton */
.pt-skel{height:14px;border-radius:4px;
  background:linear-gradient(90deg,var(--color-surface-sunken) 25%,
    var(--color-surface-page) 50%,
    var(--color-surface-sunken) 75%);
  background-size:200% 100%;animation:pt-shimmer 1.4s infinite}
@keyframes pt-shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}

/* empty */
.pt-empty{padding:var(--spacing-md);text-align:center;
  color:var(--color-text-muted);font-size:13px;
  display:flex;flex-direction:column;align-items:center;gap:var(--spacing-sm)}

/* pagination */
.pt-footer{padding:0 var(--spacing-md)}
`;
  document.head.appendChild(el);
}

// ─── Types ──────────────────────────────────────────────────────────────────

export interface ProTableColumn<T> {
  key: string;
  header: string;
  render?: (row: T, index: number) => ReactNode;
  sortable?: boolean;
  hideable?: boolean;
  width?: number | string;
  align?: "left" | "center" | "right";
  exportValue?: (row: T) => string;
}

export interface ProTablePagination {
  page: number;
  totalPages: number;
  totalItems?: number;
  pageSize?: number;
  onPageChange: (page: number) => void;
}

export interface ProTableBulkAction {
  label: string;
  onClick: (selectedKeys: string[]) => void;
  danger?: boolean;
}

export interface ProTableToolbar {
  title?: string;
  search?: {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
  };
  actions?: ReactNode;
}

export interface ProTableEmptyState {
  title: string;
  description?: string;
  action?: ReactNode;
}

export interface ProTableProps<T extends Record<string, unknown>> {
  columns: ProTableColumn<T>[];
  rows: T[];
  rowKey: keyof T | ((row: T) => string);

  loading?: boolean;
  emptyState?: ProTableEmptyState;
  emptyMessage?: string;

  toolbar?: ProTableToolbar;

  pagination?: ProTablePagination | false;

  selectable?: boolean;
  selectedKeys?: string[];
  onSelectChange?: (keys: string[]) => void;
  bulkActions?: ProTableBulkAction[];

  sortState?: { key: string; dir: "asc" | "desc" };
  onSortChange?: (key: string, dir: "asc" | "desc") => void;

  onRowClick?: (row: T) => void;
  onRefresh?: () => void;
  exportable?: boolean;
  exportFilename?: string;

  size?: "compact" | "comfortable" | "spacious";

  className?: string;
  style?: CSSProperties;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function getKey<T extends Record<string, unknown>>(
  row: T,
  rowKey: keyof T | ((row: T) => string),
): string {
  if (typeof rowKey === "function") return rowKey(row);
  return String(row[rowKey] ?? "");
}

function exportToCsv<T extends Record<string, unknown>>(
  cols: ProTableColumn<T>[],
  rows: T[],
  filename: string,
) {
  const headers = cols.map((c) => `"${c.header.replace(/"/g, '""')}"`).join(",");
  const body = rows
    .map((row) =>
      cols
        .map((c) => {
          const raw = c.exportValue ? c.exportValue(row) : String(row[c.key] ?? "");
          return `"${raw.replace(/"/g, '""')}"`;
        })
        .join(","),
    )
    .join("\n");
  const blob = new Blob([`﻿${headers}\n${body}`], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Component ──────────────────────────────────────────────────────────────

const SKELETON_ROWS = 5;

export function ProTable<T extends Record<string, unknown>>({
  columns,
  rows,
  rowKey,
  loading = false,
  emptyState,
  emptyMessage = "Không có dữ liệu",
  toolbar,
  pagination,
  selectable = false,
  selectedKeys: selectedKeysProp,
  onSelectChange,
  bulkActions,
  sortState: sortStateProp,
  onSortChange,
  onRowClick,
  onRefresh,
  exportable = false,
  exportFilename = "export",
  size = "comfortable",
  className,
  style,
}: ProTableProps<T>) {
  ensureCss();

  // ── Column visibility ─────────────────────────────────────────────────────
  const [hiddenCols, setHiddenCols] = useState<Set<string>>(new Set());
  const [colPanelOpen, setColPanelOpen] = useState(false);
  const colPanelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!colPanelOpen) return;
    function onOutside(e: MouseEvent) {
      if (colPanelRef.current && !colPanelRef.current.contains(e.target as Node)) {
        setColPanelOpen(false);
      }
    }
    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, [colPanelOpen]);

  const visibleCols = useMemo(
    () => columns.filter((c) => !hiddenCols.has(c.key)),
    [columns, hiddenCols],
  );

  // ── Sort (uncontrolled fallback) ──────────────────────────────────────────
  const [localSort, setLocalSort] = useState<{ key: string; dir: "asc" | "desc" } | null>(null);
  const sortState = sortStateProp ?? localSort;

  function handleSort(key: string) {
    const nextDir = sortState?.key === key && sortState.dir === "asc" ? "desc" : "asc";
    if (onSortChange) {
      onSortChange(key, nextDir);
    } else {
      setLocalSort({ key, dir: nextDir });
    }
  }

  const displayRows = useMemo(() => {
    if (onSortChange || !localSort) return rows;
    const col = columns.find((c) => c.key === localSort.key);
    if (!col) return rows;
    return [...rows].sort((a, b) => {
      const av = col.exportValue ? col.exportValue(a) : String(a[col.key] ?? "");
      const bv = col.exportValue ? col.exportValue(b) : String(b[col.key] ?? "");
      const cmp = av.localeCompare(bv, "vi");
      return localSort.dir === "asc" ? cmp : -cmp;
    });
  }, [rows, localSort, onSortChange, columns]);

  // ── Row selection ─────────────────────────────────────────────────────────
  const [localSelected, setLocalSelected] = useState<Set<string>>(new Set());
  const selectedKeys = selectedKeysProp
    ? new Set(selectedKeysProp)
    : localSelected;

  const updateSelected = useCallback(
    (next: Set<string>) => {
      if (!selectedKeysProp) setLocalSelected(next);
      onSelectChange?.([...next]);
    },
    [selectedKeysProp, onSelectChange],
  );

  function toggleRow(key: string) {
    const next = new Set(selectedKeys);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    updateSelected(next);
  }

  function toggleAll() {
    const allKeys = displayRows.map((r) => getKey(r, rowKey));
    const allSelected = allKeys.every((k) => selectedKeys.has(k));
    updateSelected(allSelected ? new Set() : new Set(allKeys));
  }

  const allSelected =
    displayRows.length > 0 && displayRows.every((r) => selectedKeys.has(getKey(r, rowKey)));
  const someSelected = !allSelected && displayRows.some((r) => selectedKeys.has(getKey(r, rowKey)));
  const selectedCount = selectedKeys.size;

  // ── Render ────────────────────────────────────────────────────────────────
  const showToolbar =
    toolbar?.title || toolbar?.search || toolbar?.actions || onRefresh || exportable ||
    columns.some((c) => c.hideable !== false);

  const thCb: CSSProperties = {};
  const tdCb: CSSProperties = {};

  return (
    <div
      className={`pt-root ${size}${className ? ` ${className}` : ""}`}
      style={style}
      role="region"
      aria-label={toolbar?.title ?? "Bảng dữ liệu"}
    >
      {/* ── Toolbar ── */}
      {showToolbar ? (
        <div className="pt-toolbar">
          {toolbar?.title ? <span className="pt-toolbar-title">{toolbar.title}</span> : null}

          {toolbar?.search ? (
            <div className="pt-search">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" aria-hidden="true">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
              <input
                type="search"
                value={toolbar.search.value}
                onChange={(e) => toolbar.search!.onChange(e.target.value)}
                placeholder={toolbar.search.placeholder ?? "Tìm kiếm…"}
                aria-label={toolbar.search.placeholder ?? "Tìm kiếm"}
              />
              {toolbar.search.value ? (
                <button
                  type="button"
                  aria-label="Xóa tìm kiếm"
                  style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-text-muted)", lineHeight: 1, padding: 0, fontSize: 14 }}
                  onClick={() => toolbar.search!.onChange("")}
                >
                  ✕
                </button>
              ) : null}
            </div>
          ) : null}

          {toolbar?.actions ?? null}

          {onRefresh ? (
            <button
              type="button"
              className="pt-icon-btn"
              onClick={onRefresh}
              title="Tải lại"
              aria-label="Tải lại"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                <path d="M21 3v5h-5" />
                <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                <path d="M8 16H3v5" />
              </svg>
            </button>
          ) : null}

          {exportable ? (
            <button
              type="button"
              className="pt-icon-btn"
              title="Xuất CSV"
              aria-label="Xuất CSV"
              onClick={() => exportToCsv(visibleCols, displayRows, exportFilename)}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
            </button>
          ) : null}

          {columns.some((c) => c.hideable !== false) ? (
            <div className="pt-col-panel" ref={colPanelRef}>
              <button
                type="button"
                className={`pt-icon-btn${colPanelOpen ? " on" : ""}`}
                onClick={() => setColPanelOpen((v) => !v)}
                title="Cột hiển thị"
                aria-label="Cột hiển thị"
                aria-expanded={colPanelOpen}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
                  <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
                </svg>
              </button>
              {colPanelOpen ? (
                <div className="pt-col-dropdown" role="dialog" aria-label="Chọn cột hiển thị">
                  <div style={{ fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: ".6px", padding: "2px 6px 6px" }}>Cột hiển thị</div>
                  {columns
                    .filter((c) => c.hideable !== false)
                    .map((c) => (
                      <label key={c.key}>
                        <input
                          type="checkbox"
                          checked={!hiddenCols.has(c.key)}
                          onChange={() => {
                            setHiddenCols((prev) => {
                              const next = new Set(prev);
                              if (next.has(c.key)) next.delete(c.key);
                              else next.add(c.key);
                              return next;
                            });
                          }}
                        />
                        {c.header}
                      </label>
                    ))}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}

      {/* ── Bulk actions bar ── */}
      {selectable && selectedCount > 0 && bulkActions && bulkActions.length > 0 ? (
        <div className="pt-bulk-bar" role="toolbar" aria-label="Thao tác hàng loạt">
          <span>Đã chọn {selectedCount} mục</span>
          {bulkActions.map((a) => (
            <button
              key={a.label}
              type="button"
              style={a.danger ? { borderColor: "rgba(220,38,38,.6)", background: "rgba(220,38,38,.15)" } : undefined}
              onClick={() => a.onClick([...selectedKeys])}
            >
              {a.label}
            </button>
          ))}
          <button
            type="button"
            style={{ marginLeft: "auto", opacity: .7 }}
            onClick={() => updateSelected(new Set())}
          >
            Bỏ chọn
          </button>
        </div>
      ) : null}

      {/* ── Table ── */}
      <div className="pt-table-wrap">
        <table className="pt-table">
          <thead>
            <tr>
              {selectable ? (
                <th className="pt-th pt-cb-th" style={thCb}>
                  <input
                    type="checkbox"
                    className="pt-cb"
                    checked={allSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = someSelected;
                    }}
                    onChange={toggleAll}
                    aria-label="Chọn tất cả"
                  />
                </th>
              ) : null}
              {visibleCols.map((col) => (
                <th
                  key={col.key}
                  className={`pt-th${col.sortable ? " sortable" : ""} ${col.align ?? "left"}`}
                  style={{ width: col.width }}
                  onClick={col.sortable ? () => handleSort(col.key) : undefined}
                  aria-sort={
                    col.sortable
                      ? sortState?.key === col.key
                        ? sortState.dir === "asc"
                          ? "ascending"
                          : "descending"
                        : "none"
                      : undefined
                  }
                >
                  <span className="pt-th-inner">
                    {col.header}
                    {col.sortable ? (
                      <span
                        className={`pt-sort-icon${sortState?.key === col.key ? " on" : ""}`}
                        aria-hidden="true"
                      >
                        {sortState?.key === col.key
                          ? sortState.dir === "asc"
                            ? "▲"
                            : "▼"
                          : "⇅"}
                      </span>
                    ) : null}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: SKELETON_ROWS }, (_, ri) => (
                <tr key={ri} className="pt-tr" aria-hidden="true">
                  {selectable ? <td className="pt-td pt-cb-td" style={tdCb} /> : null}
                  {visibleCols.map((col) => (
                    <td key={col.key} className="pt-td">
                      <div
                        className="pt-skel"
                        style={{ width: `${55 + ((ri * 7 + col.key.length * 3) % 35)}%` }}
                      />
                    </td>
                  ))}
                </tr>
              ))
            ) : displayRows.length === 0 ? (
              <tr>
                <td colSpan={visibleCols.length + (selectable ? 1 : 0)}>
                  <div className="pt-empty">
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true" style={{ opacity: .3 }}>
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                      <polyline points="10 9 9 9 8 9" />
                    </svg>
                    <strong style={{ fontSize: 14, color: "var(--color-text-primary)" }}>
                      {emptyState?.title ?? emptyMessage}
                    </strong>
                    {emptyState?.description ? (
                      <span style={{ fontSize: 13 }}>{emptyState.description}</span>
                    ) : null}
                    {emptyState?.action ?? null}
                  </div>
                </td>
              </tr>
            ) : (
              displayRows.map((row, ri) => {
                const key = getKey(row, rowKey);
                const isSelected = selectedKeys.has(key);
                return (
                  <tr
                    key={key}
                    className={`pt-tr${onRowClick ? " clickable" : ""}${isSelected ? " selected" : ""}`}
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                  >
                    {selectable ? (
                      <td
                        className="pt-td pt-cb-td"
                        style={tdCb}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleRow(key);
                        }}
                      >
                        <input
                          type="checkbox"
                          className="pt-cb"
                          checked={isSelected}
                          onChange={() => toggleRow(key)}
                          aria-label={`Chọn hàng ${ri + 1}`}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </td>
                    ) : null}
                    {visibleCols.map((col) => (
                      <td key={col.key} className={`pt-td ${col.align ?? "left"}`}>
                        {col.render
                          ? col.render(row, ri)
                          : String(row[col.key] ?? "")}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ── Pagination ── */}
      {pagination && !loading ? (
        <div className="pt-footer">
          <Pagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            totalItems={pagination.totalItems}
            pageSize={pagination.pageSize}
            onPageChange={pagination.onPageChange}
          />
        </div>
      ) : null}
    </div>
  );
}

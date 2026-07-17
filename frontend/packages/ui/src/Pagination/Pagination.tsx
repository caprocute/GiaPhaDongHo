"use client";

import { type CSSProperties, type KeyboardEvent, useEffect, useState } from "react";

export interface PaginationProps {
  /** Trang hiện tại — 1-based. */
  page: number;
  totalPages: number;
  totalItems?: number;
  pageSize?: number;
  onPageChange: (page: number) => void;
}

const btn: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minWidth: 34,
  height: 34,
  padding: "0 8px",
  border: "1px solid var(--color-border-strong)",
  background: "var(--color-surface-card)",
  color: "var(--color-text-primary)",
  fontFamily: "var(--font-body)",
  fontSize: 13,
  cursor: "pointer",
  lineHeight: 1,
  transition: "border-color 0.15s, color 0.15s",
  userSelect: "none",
};

const btnDisabled: CSSProperties = {
  ...btn,
  opacity: 0.38,
  cursor: "not-allowed",
};

const jumpInput: CSSProperties = {
  width: 44,
  height: 34,
  padding: "0 6px",
  border: "1px solid var(--color-border-strong)",
  background: "var(--color-surface-card)",
  color: "var(--color-text-primary)",
  fontFamily: "var(--font-body)",
  fontSize: 13,
  textAlign: "center",
  outline: "none",
};

function Btn({
  label,
  onClick,
  disabled,
  title,
}: {
  label: string;
  onClick: () => void;
  disabled: boolean;
  title?: string;
}) {
  return (
    <button
      type="button"
      style={disabled ? btnDisabled : btn}
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={title ?? label}
    >
      {label}
    </button>
  );
}

export function Pagination({
  page,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
}: PaginationProps) {
  const pages = Math.max(1, totalPages);
  const [draft, setDraft] = useState(String(page));

  useEffect(() => {
    setDraft(String(page));
  }, [page]);

  function go(p: number) {
    const clamped = Math.max(1, Math.min(pages, p));
    if (clamped !== page) onPageChange(clamped);
  }

  function commitDraft() {
    const parsed = parseInt(draft, 10);
    if (!Number.isNaN(parsed)) go(parsed);
    else setDraft(String(page));
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") commitDraft();
    if (e.key === "Escape") setDraft(String(page));
  }

  // Summary: "Hiển thị 21–40 trong 128 bản ghi"
  let summary = "";
  if (typeof totalItems === "number" && totalItems > 0) {
    const ps = pageSize ?? Math.ceil(totalItems / pages);
    const from = (page - 1) * ps + 1;
    const to = Math.min(page * ps, totalItems);
    summary = `${from.toLocaleString("vi-VN")}–${to.toLocaleString("vi-VN")} trong ${totalItems.toLocaleString("vi-VN")} bản ghi`;
  }

  const wrap: CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "var(--spacing-sm)",
    flexWrap: "wrap",
    fontFamily: "var(--font-body)",
    fontSize: 13,
    color: "var(--color-text-muted)",
    marginTop: "var(--spacing-md)",
    paddingTop: "var(--spacing-md)",
    borderTop: "1px solid var(--color-border-default)",
  };

  return (
    <nav aria-label="Phân trang" style={wrap}>
      {summary ? (
        <span style={{ marginRight: "auto", fontSize: 12.5 }}>{summary}</span>
      ) : null}

      <Btn label="«" title="Trang đầu" disabled={page <= 1} onClick={() => go(1)} />
      <Btn label="‹" title="Trang trước" disabled={page <= 1} onClick={() => go(page - 1)} />

      <span style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--color-text-primary)" }}>
        Trang
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commitDraft}
          onKeyDown={onKeyDown}
          aria-label="Đến trang"
          style={jumpInput}
        />
        / {pages.toLocaleString("vi-VN")}
      </span>

      <Btn label="›" title="Trang sau" disabled={page >= pages} onClick={() => go(page + 1)} />
      <Btn label="»" title="Trang cuối" disabled={page >= pages} onClick={() => go(pages)} />
    </nav>
  );
}

import type { CSSProperties } from "react";
import { Button } from "../Button/Button";

export interface PaginationProps {
  /** Trang hiện tại — 1-based (hiển thị người dùng). */
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  /** Tổng số bản ghi (tuỳ chọn). */
  totalItems?: number;
}

export function Pagination({ page, totalPages, onPageChange, totalItems }: PaginationProps) {
  const wrap: CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "var(--spacing-sm)",
    flexWrap: "wrap",
    color: "var(--color-text-primary)",
    fontFamily: "var(--font-body)",
    fontSize: 13.5,
  };

  const pages = Math.max(1, totalPages);

  return (
    <nav aria-label="Phân trang" style={wrap}>
      <Button type="button" variant="secondary" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
        Trước
      </Button>
      <span>
        Trang {page} / {pages}
        {typeof totalItems === "number" ? ` · ${totalItems} mục` : ""}
      </span>
      <Button
        type="button"
        variant="secondary"
        disabled={page >= pages}
        onClick={() => onPageChange(page + 1)}
      >
        Sau
      </Button>
    </nav>
  );
}

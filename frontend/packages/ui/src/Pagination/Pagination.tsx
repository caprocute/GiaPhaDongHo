import type { CSSProperties } from "react";
import { Button } from "../Button/Button";

export interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  const wrap: CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "var(--spacing-sm)",
    color: "var(--color-text-primary)",
    fontFamily: "var(--font-body)",
  };

  return (
    <nav aria-label="Phân trang" style={wrap}>
      <Button variant="secondary" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
        Trước
      </Button>
      <span>
        Trang {page} / {totalPages}
      </span>
      <Button variant="secondary" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
        Sau
      </Button>
    </nav>
  );
}

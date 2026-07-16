import type { CSSProperties, ReactNode } from "react";
import { cardSurface } from "../styles/common";

export interface DataTableColumn<T> {
  key: keyof T | string;
  header: string;
  render?: (row: T) => ReactNode;
}

export interface DataTableProps<T extends Record<string, unknown>> {
  columns: DataTableColumn<T>[];
  rows: T[];
  emptyMessage?: string;
}

export function DataTable<T extends Record<string, unknown>>({
  columns,
  rows,
  emptyMessage = "Không có dữ liệu",
}: DataTableProps<T>) {
  const tableStyle: CSSProperties = {
    ...cardSurface,
    width: "100%",
    borderCollapse: "collapse",
    overflow: "hidden",
  };

  const th: CSSProperties = {
    textAlign: "left",
    padding: "var(--spacing-sm) var(--spacing-md)",
    background: "var(--color-surface-page)",
    color: "var(--color-text-muted)",
    fontFamily: "var(--font-body)",
    fontSize: "var(--font-size-sm)",
    borderBottom: "1px solid var(--color-border-subtle)",
  };

  const td: CSSProperties = {
    padding: "var(--spacing-sm) var(--spacing-md)",
    color: "var(--color-text-primary)",
    fontFamily: "var(--font-body)",
    fontSize: "var(--font-size-md)",
    borderBottom: "1px solid var(--color-border-subtle)",
  };

  if (rows.length === 0) {
    return <p style={{ color: "var(--color-text-muted)" }}>{emptyMessage}</p>;
  }

  return (
    <table style={tableStyle}>
      <thead>
        <tr>
          {columns.map((col) => (
            <th key={String(col.key)} style={th}>
              {col.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i}>
            {columns.map((col) => (
              <td key={String(col.key)} style={td}>
                {col.render ? col.render(row) : String(row[col.key as keyof T] ?? "")}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

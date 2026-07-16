import type { CSSProperties } from "react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  const style: CSSProperties = {
    display: "flex",
    flexWrap: "wrap",
    gap: "var(--spacing-xs)",
    color: "var(--color-text-muted)",
    fontFamily: "var(--font-body)",
    fontSize: "var(--font-size-sm)",
  };

  return (
    <nav aria-label="Breadcrumb" style={style}>
      {items.map((item, index) => (
        <span key={`${item.label}-${index}`}>
          {item.href ? (
            <a href={item.href} style={{ color: "var(--color-text-primary)" }}>
              {item.label}
            </a>
          ) : (
            <span style={{ color: "var(--color-text-primary)" }}>{item.label}</span>
          )}
          {index < items.length - 1 ? " / " : ""}
        </span>
      ))}
    </nav>
  );
}

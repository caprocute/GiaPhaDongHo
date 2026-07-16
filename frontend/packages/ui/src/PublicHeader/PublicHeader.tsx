import type { CSSProperties } from "react";

export interface PublicHeaderProps {
  title?: string;
}

export function PublicHeader({ title = "GiaPhaHub" }: PublicHeaderProps) {
  const style: CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "var(--spacing-md) var(--spacing-lg)",
    background: "var(--color-surface-card)",
    borderBottom: "2px solid var(--color-heritage-frame)",
    color: "var(--color-text-primary)",
    fontFamily: "var(--font-display)",
    fontSize: "var(--font-size-xl)",
  };

  const nav: CSSProperties = {
    display: "flex",
    gap: "var(--spacing-md)",
    fontFamily: "var(--font-body)",
    fontSize: "var(--font-size-sm)",
  };

  return (
    <header style={style}>
      <strong>{title}</strong>
      <nav style={nav} aria-label="Điều hướng chính">
        <a href="/persons" style={{ color: "var(--color-text-primary)" }}>
          Gia phả
        </a>
        <a href="/news" style={{ color: "var(--color-text-primary)" }}>
          Tin tức
        </a>
        <a href="/search" style={{ color: "var(--color-text-primary)" }}>
          Tìm kiếm
        </a>
      </nav>
    </header>
  );
}

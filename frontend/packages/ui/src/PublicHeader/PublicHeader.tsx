import type { CSSProperties, ReactNode } from "react";

export interface PublicHeaderProps {
  title?: string;
  /** Slot bên phải (VD: nút đăng nhập OIDC). */
  endSlot?: ReactNode;
}

export function PublicHeader({ title = "GiaPhaHub", endSlot }: PublicHeaderProps) {
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
      <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-md)" }}>
        <nav style={nav} aria-label="Điều hướng chính">
          <a href="/" style={{ color: "var(--color-text-primary)" }}>
            Trang chủ
          </a>
          <a href="/persons" style={{ color: "var(--color-text-primary)" }}>
            Gia phả
          </a>
          <a href="/tree" style={{ color: "var(--color-text-primary)" }}>
            Phả đồ
          </a>
          <a href="/gio" style={{ color: "var(--color-text-primary)" }}>
            Ngày giỗ
          </a>
          <a href="/news" style={{ color: "var(--color-text-primary)" }}>
            Tin tức
          </a>
          <a href="/album" style={{ color: "var(--color-text-primary)" }}>
            Album
          </a>
          <a href="/search" style={{ color: "var(--color-text-primary)" }}>
            Tìm kiếm
          </a>
        </nav>
        {endSlot}
      </div>
    </header>
  );
}

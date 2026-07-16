"use client";

import { useAuth } from "@giapha/auth";

export function AuthNav() {
  const { user, loading, login, logout } = useAuth();

  if (loading) {
    return null;
  }

  if (!user) {
    return (
      <button
        type="button"
        onClick={() => void login()}
        style={{
          font: "inherit",
          border: "1px solid color-mix(in srgb, var(--color-heritage-line) 70%, transparent)",
          background: "transparent",
          color: "var(--color-text-on-brand)",
          padding: "4px 12px",
          cursor: "pointer",
          fontSize: "var(--font-size-sm)",
          letterSpacing: "0.04em",
        }}
      >
        Đăng nhập
      </button>
    );
  }

  const name = user.profile.preferred_username ?? user.profile.name ?? "Thành viên";

  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "var(--spacing-sm)" }}>
      <span style={{ opacity: 0.9 }}>{name}</span>
      <button
        type="button"
        onClick={() => void logout()}
        style={{
          font: "inherit",
          border: 0,
          background: "transparent",
          color: "var(--color-heritage-soft)",
          cursor: "pointer",
          textDecoration: "underline",
          fontSize: "var(--font-size-sm)",
        }}
      >
        Đăng xuất
      </button>
    </span>
  );
}

"use client";

import { useAuth } from "@giapha/auth";
import { Button } from "@giapha/ui";

export function AuthNav() {
  const { user, loading, login, logout } = useAuth();

  if (loading) {
    return null;
  }

  if (!user) {
    return (
      <Button type="button" variant="secondary" onClick={() => void login()}>
        Đăng nhập
      </Button>
    );
  }

  const name = user.profile.preferred_username ?? user.profile.name ?? "Thành viên";

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-sm)" }}>
      <span style={{ fontFamily: "var(--font-body)", fontSize: "var(--font-size-sm)" }}>{name}</span>
      <Button type="button" variant="ghost" onClick={() => void logout()}>
        Đăng xuất
      </Button>
    </div>
  );
}

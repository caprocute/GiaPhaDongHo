import type { ReactNode } from "react";
import { Alert, Button } from "@giapha/ui";
import { useAuth } from "@giapha/auth";

export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading, error, login } = useAuth();

  if (loading) {
    return <p style={{ fontFamily: "var(--font-body)" }}>Đang kiểm tra phiên…</p>;
  }

  if (!user) {
    return (
      <div style={{ maxWidth: 480, margin: "var(--spacing-xl) auto", display: "flex", flexDirection: "column", gap: "var(--spacing-md)" }}>
        <h1 style={{ fontFamily: "var(--font-display)" }}>Đăng nhập Admin</h1>
        <p style={{ color: "var(--color-text-muted)", fontFamily: "var(--font-body)" }}>
          OIDC Keycloak (PKCE) — client <code>giapha_admin</code>. Role quản trị cần TOTP (R1.5).
        </p>
        {error ? (
          <Alert title="Lỗi xác thực" variant="error">
            {error}
          </Alert>
        ) : null}
        <Button type="button" onClick={() => void login()}>
          Đăng nhập với Keycloak
        </Button>
      </div>
    );
  }

  return children;
}

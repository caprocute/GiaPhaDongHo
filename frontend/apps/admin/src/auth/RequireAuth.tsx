import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@giapha/auth";

export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <p
        style={{
          fontFamily: "var(--font-body)",
          padding: "var(--spacing-xl)",
          color: "var(--color-text-muted)",
        }}
      >
        Đang kiểm tra phiên…
      </p>
    );
  }

  if (!user) {
    const next = `${location.pathname}${location.search}`;
    const q = next && next !== "/" ? `?next=${encodeURIComponent(next)}` : "";
    return <Navigate to={`/login${q}`} replace />;
  }

  return children;
}

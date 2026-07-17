import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Alert } from "@giapha/ui";
import { useAuth } from "@giapha/auth";

export function AuthCallbackPage() {
  const { completeSignIn } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void completeSignIn()
      .then(() => navigate("/", { replace: true }))
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Đăng nhập thất bại"));
  }, [completeSignIn, navigate]);

  if (error) {
    return (
      <Alert title="Không hoàn tất đăng nhập" variant="error">
        {error}
      </Alert>
    );
  }

  return <p style={{ fontFamily: "var(--font-body)" }}>Đang hoàn tất đăng nhập…</p>;
}

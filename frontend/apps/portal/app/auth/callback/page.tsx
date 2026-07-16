"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@giapha/auth";
import { Alert } from "@giapha/ui";

export default function AuthCallbackPage() {
  const { completeSignIn } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void completeSignIn()
      .then(() => router.replace("/"))
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Đăng nhập thất bại"));
  }, [completeSignIn, router]);

  if (error) {
    return (
      <Alert title="OIDC callback lỗi" variant="error">
        {error}
      </Alert>
    );
  }

  return <p>Đang hoàn tất đăng nhập…</p>;
}

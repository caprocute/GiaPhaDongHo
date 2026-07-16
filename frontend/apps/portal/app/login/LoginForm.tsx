"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { z } from "zod";
import { useAuth } from "@giapha/auth";
import { FormField } from "@giapha/ui";
import styles from "./login.module.css";

const schema = z.object({
  username: z.string().trim().min(1, "Nhập tên đăng nhập hoặc email"),
  password: z.string().min(1, "Nhập mật khẩu"),
});

export function LoginForm() {
  const { loginWithPassword, user, loading } = useAuth();
  const router = useRouter();
  const search = useSearchParams();
  const next = search.get("next") || "/";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ username?: string; password?: string }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      router.replace(next.startsWith("/") ? next : "/");
    }
  }, [loading, user, next, router]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    const parsed = schema.safeParse({ username, password });
    if (!parsed.success) {
      const flat = parsed.error.flatten().fieldErrors;
      setFieldErrors({
        username: flat.username?.[0],
        password: flat.password?.[0],
      });
      return;
    }
    setFieldErrors({});
    setPending(true);
    try {
      await loginWithPassword(parsed.data.username, parsed.data.password);
      router.replace(next.startsWith("/") ? next : "/");
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : "Đăng nhập thất bại");
    } finally {
      setPending(false);
    }
  }

  return (
    <form className={styles.cardInner} onSubmit={(e) => void onSubmit(e)} noValidate>
      <div className={styles.formEyebrow}>Thành viên dòng họ</div>
      <h1 className={styles.formTitle}>Đăng nhập</h1>
      <p className={styles.formSub}>
        Vào không gian gia phả Họ Hoàng – Huỳnh để xem hồ sơ, phả đồ và ngày giỗ.
      </p>

      {formError ? <div className={styles.error}>{formError}</div> : null}

      <div className={styles.field}>
        <FormField label="Tên đăng nhập" htmlFor="login-user" required error={fieldErrors.username}>
          <input
            id="login-user"
            name="username"
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={pending}
            placeholder="user hoặc email"
          />
        </FormField>
      </div>

      <div className={styles.field}>
        <FormField label="Mật khẩu" htmlFor="login-pass" required error={fieldErrors.password}>
          <input
            id="login-pass"
            name="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={pending}
            placeholder="••••••••"
          />
        </FormField>
      </div>

      <button className={styles.submit} type="submit" disabled={pending}>
        {pending ? "Đang xác thực…" : "Đăng nhập"}
      </button>

      <div className={styles.meta}>
        <a href="/">← Về trang nhất</a>
      </div>

      <p className={styles.hint}>
        Tài khoản mẫu DEV: <strong>user</strong> / <strong>user</strong> · quản trị{" "}
        <strong>admin</strong> / <strong>admin</strong> (sau khi đã sync realm Keycloak).
      </p>
    </form>
  );
}

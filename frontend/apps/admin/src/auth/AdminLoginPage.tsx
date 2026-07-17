import { useEffect, useState, type FormEvent } from "react";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { z } from "zod";
import { useAuth } from "@giapha/auth";
import { Alert, Button, FormField, Input } from "@giapha/ui";
import { Shield } from "lucide-react";
import { adminSiteTitle } from "../lib/siteTitle";
import styles from "./adminLogin.module.css";

const schema = z.object({
  username: z.string().trim().min(1, "Nhập tên đăng nhập"),
  password: z.string().min(1, "Nhập mật khẩu"),
});

function safeNext(raw: string | null): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return "/";
  if (raw.startsWith("/login") || raw.startsWith("/auth/")) return "/";
  return raw;
}

export function AdminLoginPage() {
  const { loginWithPassword, user, loading } = useAuth();
  const navigate = useNavigate();
  const [search] = useSearchParams();
  const next = safeNext(search.get("next"));

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ username?: string; password?: string }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    document.title = `Đăng nhập quản trị · ${adminSiteTitle()}`;
  }, []);

  if (loading) {
    return <div className={styles.loading}>Đang kiểm tra phiên…</div>;
  }

  if (user) {
    return <Navigate to={next} replace />;
  }

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
      navigate(next, { replace: true });
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : "Đăng nhập thất bại");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.topStrip}>
        <span>
          <strong>GiaPhaHub</strong> · CRM tộc sự
        </span>
        <span>Khu vực nội bộ · không công khai</span>
      </div>

      <main className={styles.main}>
        <div className={styles.panel}>
          <div className={styles.panelHead}>
            <div className={styles.iconWrap} aria-hidden>
              <Shield size={22} strokeWidth={1.75} />
            </div>
            <div>
              <p className={styles.eyebrow}>Quản trị hệ thống</p>
              <h1 className={styles.title}>Đăng nhập quản trị</h1>
              <p className={styles.sub}>
                {adminSiteTitle()} — dành cho tộc trưởng, thư ký gia phả và ban biên tập.
              </p>
            </div>
          </div>

          <form className={styles.panelBody} onSubmit={(e) => void onSubmit(e)} noValidate>
            {formError ? (
              <Alert title="Không đăng nhập được" variant="error">
                {formError}
              </Alert>
            ) : null}

            <div className={styles.fields}>
              <FormField
                label="Tên đăng nhập"
                htmlFor="admin-login-user"
                required
                error={fieldErrors.username}
              >
                <Input
                  id="admin-login-user"
                  name="username"
                  autoComplete="username"
                  autoFocus
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={pending}
                  placeholder="admin / genealogy / editor"
                />
              </FormField>

              <FormField
                label="Mật khẩu"
                htmlFor="admin-login-pass"
                required
                error={fieldErrors.password}
              >
                <Input
                  id="admin-login-pass"
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

            <Button type="submit" style={{ width: "100%", marginTop: "var(--spacing-xs)" }} disabled={pending}>
              {pending ? "Đang xác thực…" : "Vào bảng điều khiển"}
            </Button>

            <div className={styles.metaRow}>
              <span>Quên mật khẩu? Liên hệ tộc trưởng.</span>
              <a href={import.meta.env.VITE_PORTAL_URL ?? "http://localhost:3000"}>Cổng thông tin</a>
            </div>
          </form>
        </div>
      </main>

      <footer className={styles.foot}>
        Xác thực qua API OIDC · client <code>giapha_admin</code> · không dùng Hosted Login Keycloak
      </footer>
    </div>
  );
}

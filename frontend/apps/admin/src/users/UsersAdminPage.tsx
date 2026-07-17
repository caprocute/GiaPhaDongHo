import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@giapha/auth";
import {
  Alert,
  Badge,
  Button,
  DataTable,
  EmptyState,
  Input,
  Select,
} from "@giapha/ui";
import { KeyRound, Shield, UserCheck, UserX } from "lucide-react";
import { ApiError } from "../api/http";
import {
  activateManagedUser,
  approveManagedUser,
  getManagedUserLoginHistory,
  getUserAdminStatus,
  listManagedUsers,
  listRoleOptions,
  lockManagedUser,
  resetManagedUserPassword,
  setManagedUserRoles,
  type LoginEventDto,
  type ManagedUserDto,
  type RoleOptionDto,
} from "../api/userAdminApi";
import { AdminPageHeader } from "../components/AdminPageHeader";
import styles from "./users.module.css";

type Row = ManagedUserDto & Record<string, unknown>;

function roleLabel(code: string, catalog: RoleOptionDto[]): string {
  return catalog.find((r) => r.code === code)?.label ?? code.replace(/^ROLE_/, "");
}

function formatTime(ts?: number | null): string {
  if (!ts) return "—";
  try {
    return new Date(ts).toLocaleString("vi-VN");
  } catch {
    return "—";
  }
}

export function UsersAdminPage() {
  const { getAccessToken } = useAuth();
  const [available, setAvailable] = useState(true);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "locked">("all");
  const [rows, setRows] = useState<ManagedUserDto[]>([]);
  const [roles, setRoles] = useState<RoleOptionDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [selected, setSelected] = useState<ManagedUserDto | null>(null);
  const [roleDraft, setRoleDraft] = useState<string[]>([]);
  const [tempPassword, setTempPassword] = useState("");
  const [history, setHistory] = useState<LoginEventDto[]>([]);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await getAccessToken();
      const status = await getUserAdminStatus(token);
      setAvailable(status.available);
      if (!status.available) {
        setRows([]);
        setRoles([]);
        return;
      }
      const enabled = filter === "all" ? undefined : filter === "active";
      const [list, catalog] = await Promise.all([
        listManagedUsers(token, { q: query, enabled, page: 0, size: 50 }),
        listRoleOptions(token),
      ]);
      setRows(list);
      setRoles(catalog);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Không tải được danh sách tài khoản.");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [filter, getAccessToken, query]);

  useEffect(() => {
    const t = window.setTimeout(() => void reload(), 250);
    return () => window.clearTimeout(t);
  }, [reload]);

  async function openDetail(user: ManagedUserDto) {
    setSelected(user);
    setRoleDraft([...(user.realmRoles ?? [])]);
    setTempPassword("");
    setHistory([]);
    setToast(null);
    try {
      const token = await getAccessToken();
      const hist = await getManagedUserLoginHistory(user.id, token);
      setHistory(hist);
    } catch {
      setHistory([]);
    }
  }

  async function runAction(id: string, action: () => Promise<ManagedUserDto>, okMsg: string) {
    setBusyId(id);
    setError(null);
    setToast(null);
    try {
      const updated = await action();
      setToast(okMsg);
      setRows((prev) => prev.map((r) => (r.id === id ? updated : r)));
      if (selected?.id === id) {
        setSelected(updated);
        setRoleDraft([...(updated.realmRoles ?? [])]);
      }
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Thao tác thất bại.");
    } finally {
      setBusyId(null);
    }
  }

  function toggleRole(code: string) {
    setRoleDraft((prev) => (prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]));
  }

  async function saveRoles() {
    if (!selected) return;
    const token = await getAccessToken();
    await runAction(
      selected.id,
      () => setManagedUserRoles(selected.id, roleDraft, token),
      "Đã cập nhật nhóm quyền.",
    );
  }

  async function doResetPassword() {
    if (!selected) return;
    setBusyId(selected.id);
    setError(null);
    setToast(null);
    try {
      const token = await getAccessToken();
      const res = await resetManagedUserPassword(selected.id, tempPassword, token);
      setToast(res.message);
      setTempPassword("");
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Không đặt được mật khẩu tạm.");
    } finally {
      setBusyId(null);
    }
  }

  const columns = useMemo(
    () => [
      {
        key: "displayName",
        header: "Họ tên",
        render: (row: Row) => row.displayName || row.username || "—",
      },
      {
        key: "username",
        header: "Tên đăng nhập",
        render: (row: Row) => <code>{row.username}</code>,
      },
      {
        key: "email",
        header: "Email",
        render: (row: Row) => row.email || "—",
      },
      {
        key: "enabled",
        header: "Trạng thái",
        render: (row: Row) => (
          <Badge tone={row.enabled ? "success" : "default"}>
            {row.enabled ? "Đang hoạt động" : "Đã khóa"}
          </Badge>
        ),
      },
      {
        key: "roles",
        header: "Nhóm quyền",
        render: (row: Row) =>
          (row.realmRoles ?? []).length
            ? (row.realmRoles ?? []).map((c) => roleLabel(c, roles)).join(", ")
            : "—",
      },
      {
        key: "actions",
        header: "Thao tác",
        render: (row: Row) => (
          <Button type="button" variant="secondary" onClick={() => void openDetail(row)}>
            Chi tiết
          </Button>
        ),
      },
    ],
    [roles],
  );

  return (
    <div className={styles.page}>
      <AdminPageHeader
        title="Tài khoản"
        description="Duyệt, khóa, gán nhóm quyền và đặt mật khẩu tạm cho người đăng ký — FR-12.16."
      />

      {error ? (
        <Alert title="Lỗi" variant="error">
          {error}
        </Alert>
      ) : null}
      {toast ? (
        <Alert title="Thành công" variant="success">
          {toast}
        </Alert>
      ) : null}

      {!available ? (
        <Alert title="Chưa kết nối" variant="info">
          Chưa cấu hình quản trị tài khoản trên máy chủ. Liên hệ quản trị hệ thống để hoàn tất kết nối.
        </Alert>
      ) : null}

      <div className={styles.toolbar}>
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Tìm tên đăng nhập hoặc email…"
          style={{ maxWidth: 280 }}
        />
        <Select
          options={[
            { value: "all", label: "Tất cả trạng thái" },
            { value: "active", label: "Đang hoạt động" },
            { value: "locked", label: "Đã khóa" },
          ]}
          value={filter}
          onChange={(e) => setFilter(e.target.value as "all" | "active" | "locked")}
        />
        <Button type="button" variant="secondary" onClick={() => void reload()} disabled={loading}>
          Tải lại
        </Button>
      </div>

      {loading ? (
        <p className={styles.muted}>Đang tải danh sách tài khoản…</p>
      ) : rows.length === 0 ? (
        <EmptyState
          title="Chưa có tài khoản"
          description={
            available
              ? "Chưa có người đăng ký khớp bộ lọc."
              : "Kết nối máy chủ đăng nhập để xem danh sách."
          }
        />
      ) : (
        <div className={styles.layout}>
          <div className={styles.list}>
            <DataTable columns={columns} rows={rows as Row[]} />
          </div>

          {selected ? (
            <aside className={styles.panel} aria-label="Chi tiết tài khoản">
              <h2 className={styles.panelTitle}>{selected.displayName || selected.username}</h2>
              <p className={styles.muted}>
                {selected.email || "Không có email"} ·{" "}
                {selected.emailVerified ? "Đã xác nhận thư" : "Chưa xác nhận thư"}
              </p>
              <p className={styles.muted}>Tạo lúc: {formatTime(selected.createdTimestamp)}</p>

              <div className={styles.actions}>
                <Button
                  type="button"
                  disabled={busyId === selected.id}
                  onClick={() => {
                    void (async () => {
                      const token = await getAccessToken();
                      await runAction(
                        selected.id,
                        () => approveManagedUser(selected.id, token),
                        "Đã duyệt và kích hoạt tài khoản.",
                      );
                    })();
                  }}
                >
                  <UserCheck size={16} /> Duyệt / kích hoạt
                </Button>
                {selected.enabled ? (
                  <Button
                    type="button"
                    variant="secondary"
                    disabled={busyId === selected.id}
                    onClick={() => {
                      void (async () => {
                        const token = await getAccessToken();
                        await runAction(
                          selected.id,
                          () => lockManagedUser(selected.id, token),
                          "Đã khóa tài khoản.",
                        );
                      })();
                    }}
                  >
                    <UserX size={16} /> Khóa
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="secondary"
                    disabled={busyId === selected.id}
                    onClick={() => {
                      void (async () => {
                        const token = await getAccessToken();
                        await runAction(
                          selected.id,
                          () => activateManagedUser(selected.id, token),
                          "Đã mở khóa tài khoản.",
                        );
                      })();
                    }}
                  >
                    <UserCheck size={16} /> Mở khóa
                  </Button>
                )}
              </div>

              <section className={styles.section}>
                <h3>
                  <Shield size={16} /> Nhóm quyền
                </h3>
                <div className={styles.roleList}>
                  {roles.map((r) => (
                    <label key={r.code} className={styles.roleItem}>
                      <input
                        type="checkbox"
                        checked={roleDraft.includes(r.code)}
                        onChange={() => toggleRole(r.code)}
                      />
                      <span>
                        <strong>{r.label}</strong>
                        <small>{r.description}</small>
                      </span>
                    </label>
                  ))}
                </div>
                <Button
                  type="button"
                  disabled={busyId === selected.id}
                  onClick={() => void saveRoles()}
                >
                  Lưu nhóm quyền
                </Button>
              </section>

              <section className={styles.section}>
                <h3>
                  <KeyRound size={16} /> Đặt mật khẩu tạm
                </h3>
                <Input
                  type="password"
                  value={tempPassword}
                  onChange={(e) => setTempPassword(e.target.value)}
                  placeholder="Ít nhất 8 ký tự"
                  autoComplete="new-password"
                />
                <Button
                  type="button"
                  variant="secondary"
                  disabled={busyId === selected.id || tempPassword.length < 8}
                  onClick={() => void doResetPassword()}
                >
                  Đặt mật khẩu tạm
                </Button>
                <p className={styles.muted}>Người dùng sẽ phải đổi mật khẩu khi đăng nhập lần sau.</p>
              </section>

              <section className={styles.section}>
                <h3>Lịch sử đăng nhập</h3>
                {history.length === 0 ? (
                  <p className={styles.muted}>Chưa có bản ghi hoặc máy chủ chưa bật ghi sự kiện.</p>
                ) : (
                  <ul className={styles.history}>
                    {history.map((h, i) => (
                      <li key={`${h.time}-${i}`}>
                        <strong>{h.type === "LOGIN_ERROR" ? "Thất bại" : "Thành công"}</strong>
                        <span>{formatTime(h.time)}</span>
                        <span>{h.ipAddress || "—"}</span>
                        {h.error ? <span>{h.error}</span> : null}
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </aside>
          ) : null}
        </div>
      )}
    </div>
  );
}

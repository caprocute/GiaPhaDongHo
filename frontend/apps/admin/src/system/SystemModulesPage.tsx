import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@giapha/auth";
import { Alert, EmptyState, Pagination, Select, Switch } from "@giapha/ui";
import { ApiError, apiFetch, apiFetchPage } from "../api/http";
import { AdminPageHeader } from "../components/AdminPageHeader";

type Mod = { code: string; enabled: boolean; configJson?: string | null } & Record<string, unknown>;
type Audit = {
  id?: number;
  actor?: string;
  action?: string;
  entityType?: string;
  entityId?: string;
  detail?: string | null;
  createdAt?: string;
} & Record<string, unknown>;

const AUDIT_PAGE_SIZE = 20;

const MODULE_META: Record<
  string,
  { name: string; desc: string; icon: string; settingsTo?: string }
> = {
  FAMILY_TREE: {
    name: "Phả hệ cây gia đình",
    desc: "Tra cứu, sơ đồ cây gia phả, tự khai thay đổi hồ sơ.",
    icon: "🌳",
    settingsTo: "/settings#tree",
  },
  MEDIA_LIBRARY: {
    name: "Thư viện ảnh",
    desc: "Album ảnh gia đình, tải lên và quản lý tư liệu.",
    icon: "📸",
    settingsTo: "/media",
  },
  CMS_NEWS: {
    name: "Tin tức & thông báo",
    desc: "Bài viết, chuyên mục và cổng thông tin dòng họ.",
    icon: "📰",
    settingsTo: "/posts",
  },
  DONATION: {
    name: "Quỹ công đức",
    desc: "Chiến dịch quyên góp, bảng vàng và sao kê.",
    icon: "💰",
    settingsTo: "/donation",
  },
  EVENTS: {
    name: "Sự kiện dòng họ",
    desc: "Họp họ, đăng ký tham dự và phân công.",
    icon: "📅",
    settingsTo: "/events",
  },
  NOTIFICATIONS: {
    name: "Nhắc giỗ & thông báo",
    desc: "Lịch giỗ âm lịch và hàng đợi gửi tin nhắc.",
    icon: "🔔",
    settingsTo: "/notifications",
  },
  SCHOLARSHIP: {
    name: "Khuyến học",
    desc: "Đề cử, duyệt và công bố học bổng dòng họ.",
    icon: "🎓",
    settingsTo: "/scholarship",
  },
  COMMENTS: {
    name: "Bình luận",
    desc: "Kiểm duyệt bình luận trên bài viết công khai.",
    icon: "💬",
    settingsTo: "/comments",
  },
};

function metaFor(code: string) {
  return (
    MODULE_META[code] ?? {
      name: code.replace(/_/g, " "),
      desc: "Module tính năng của hệ thống.",
      icon: "⚙",
    }
  );
}

function auditDotClass(action?: string | null): string {
  const a = (action ?? "").toLowerCase();
  if (a.includes("create") || a.includes("tạo") || a.includes("enable")) return "create";
  if (a.includes("delete") || a.includes("xóa") || a.includes("disable")) return "delete";
  if (a.includes("dispatch") || a.includes("gửi")) return "dispatch";
  return "update";
}

function actionLabel(action?: string | null): string {
  return action?.trim() || "thao tác";
}

export function SystemModulesPage() {
  const { getAccessToken } = useAuth();
  const [mods, setMods] = useState<Mod[]>([]);
  const [auditPage, setAuditPage] = useState(0);
  const [audit, setAudit] = useState<Audit[]>([]);
  const [auditTotal, setAuditTotal] = useState(0);
  const [auditTotalPages, setAuditTotalPages] = useState(1);
  const [auditFilter, setAuditFilter] = useState("all");
  const [error, setError] = useState<string | null>(null);
  const [busyCode, setBusyCode] = useState<string | null>(null);

  const reload = useCallback(async () => {
    try {
      const token = await getAccessToken();
      setMods(await apiFetch<Mod[]>("/api/v1/system/modules", { token }));
      const auditResult = await apiFetchPage<Audit>("/api/v1/system/audit-logs", {
        token,
        page: auditPage,
        size: AUDIT_PAGE_SIZE,
      });
      setAudit(auditResult.content);
      setAuditTotal(auditResult.totalElements);
      setAuditTotalPages(Math.max(1, auditResult.totalPages));
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Không tải được thông tin hệ thống.");
    }
  }, [auditPage, getAccessToken]);

  useEffect(() => {
    void reload();
  }, [reload]);

  async function toggle(code: string, enabled: boolean) {
    setBusyCode(code);
    setError(null);
    try {
      const token = await getAccessToken();
      await apiFetch(`/api/v1/system/modules/${encodeURIComponent(code)}`, {
        method: "PUT",
        body: { enabled },
        token,
      });
      await reload();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Không đổi được trạng thái module.");
    } finally {
      setBusyCode(null);
    }
  }

  const enabledCount = mods.filter((m) => m.enabled).length;
  const todayCount = useMemo(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    return audit.filter((a) => a.createdAt && new Date(a.createdAt) >= start).length;
  }, [audit]);

  const filteredAudit = useMemo(() => {
    if (auditFilter === "all") return audit;
    return audit.filter((a) => auditDotClass(a.action) === auditFilter);
  }, [audit, auditFilter]);

  return (
    <div className="admin-stack">
      <AdminPageHeader
        title="Hệ thống"
        description="Bật/tắt module tính năng, xem nhật ký thao tác quản trị và cấu hình từng module."
      />

      {error ? (
        <Alert title="Lỗi" variant="error">
          {error}
        </Alert>
      ) : null}

      <div className="stat-row">
        <div className="stat">
          <div className="stat-lbl">Module đang bật</div>
          <div className="stat-val stat-val-ok">{enabledCount}</div>
          <div className="stat-sub">Trong {mods.length || "—"} module cài sẵn</div>
        </div>
        <div className="stat">
          <div className="stat-lbl">Thao tác hôm nay</div>
          <div className="stat-val">{todayCount}</div>
          <div className="stat-sub">Trên trang nhật ký hiện tại</div>
        </div>
        <div className="stat">
          <div className="stat-lbl">Nhật ký tổng</div>
          <div className="stat-val">{auditTotal.toLocaleString("vi-VN")}</div>
          <div className="stat-sub">Từ ngày khởi tạo hệ thống</div>
        </div>
        <div className="stat">
          <div className="stat-lbl">Phiên bản</div>
          <div className="stat-val" style={{ fontSize: "1rem", paddingTop: 4 }}>
            v1.0
          </div>
          <div className="stat-sub">Bản phát hành nội bộ</div>
        </div>
      </div>

      <div className="sys-layout">
        <section>
          <div className="sys-section-hd">
            <h2>Module tính năng</h2>
            <span>
              {enabledCount}/{mods.length} đang bật
            </span>
          </div>
          {mods.length === 0 ? (
            <EmptyState
              title="Chưa có module"
              description="Danh sách module sẽ hiện khi hệ thống khởi tạo."
            />
          ) : (
            <div className="sys-mod-grid">
              {mods.map((m) => {
                const meta = metaFor(m.code);
                const on = !!m.enabled;
                return (
                  <article
                    key={m.code}
                    className={`sys-mod-card${on ? "" : " disabled"}`}
                  >
                    <div className={`sys-mod-banner ${on ? "on" : "off"}`} />
                    <div className="sys-mod-body">
                      <div className="sys-mod-head">
                        <div className={`sys-mod-icon ${on ? "on" : "off"}`} aria-hidden>
                          {meta.icon}
                        </div>
                        <div className="sys-mod-meta">
                          <span className="sys-mod-code">{m.code}</span>
                          <div className="sys-mod-name">{meta.name}</div>
                        </div>
                      </div>
                      <p className="sys-mod-desc">{meta.desc}</p>
                      <div className="sys-mod-foot">
                        <span className={`sys-mod-status ${on ? "on" : "off"}`}>
                          {on ? "Đang bật" : "Đang tắt"}
                        </span>
                        <div className="sys-mod-actions">
                          {meta.settingsTo ? (
                            <Link className="sys-mod-config" to={meta.settingsTo}>
                              ⚙ Cài đặt
                            </Link>
                          ) : null}
                          <button
                            type="button"
                            className={`sys-mod-btn ${on ? "disable" : "enable"}`}
                            disabled={busyCode === m.code}
                            onClick={() => void toggle(m.code, !on)}
                          >
                            {on ? "Tắt" : "Bật"}
                          </button>
                          <Switch
                            className="gio-switch"
                            label=""
                            aria-label={`${on ? "Tắt" : "Bật"} ${meta.name}`}
                            checked={on}
                            disabled={busyCode === m.code}
                            onChange={(e) => void toggle(m.code, e.target.checked)}
                          />
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <aside className="audit-panel" aria-label="Nhật ký thao tác">
          <div className="audit-hd">
            <h3>Nhật ký thao tác</h3>
          </div>
          <div className="audit-filter">
            <Select
              aria-label="Lọc loại thao tác"
              value={auditFilter}
              onChange={(e) => setAuditFilter(e.target.value)}
              options={[
                { value: "all", label: "Tất cả thao tác" },
                { value: "create", label: "Tạo / bật" },
                { value: "update", label: "Cập nhật" },
                { value: "delete", label: "Xóa / tắt" },
                { value: "dispatch", label: "Gửi thông báo" },
              ]}
            />
          </div>
          <div className="audit-list">
            {filteredAudit.length === 0 ? (
              <div className="crm-empty">Chưa có nhật ký khớp bộ lọc.</div>
            ) : (
              filteredAudit.map((a) => {
                const kind = auditDotClass(a.action);
                return (
                  <div key={a.id ?? `${a.createdAt}-${a.actor}`} className="audit-row">
                    <span className={`audit-dot ${kind}`} aria-hidden />
                    <div className="audit-body">
                      <div>
                        <span className="audit-actor">{a.actor ?? "Hệ thống"}</span>{" "}
                        <span className={`audit-action-${kind}`}>{actionLabel(a.action)}</span>
                      </div>
                      {(a.entityType || a.entityId) && (
                        <div>
                          <span className="audit-entity">
                            {[a.entityType, a.entityId].filter(Boolean).join(" ")}
                          </span>
                        </div>
                      )}
                      {a.detail ? <div className="audit-detail">{String(a.detail)}</div> : null}
                    </div>
                    <span className="audit-time">
                      {a.createdAt ? new Date(a.createdAt).toLocaleString("vi-VN") : "—"}
                    </span>
                  </div>
                );
              })
            )}
          </div>
          <div className="audit-foot">
            <Pagination
              page={auditPage + 1}
              totalPages={auditTotalPages}
              totalItems={auditTotal}
              pageSize={AUDIT_PAGE_SIZE}
              onPageChange={(p) => setAuditPage(p - 1)}
            />
          </div>
        </aside>
      </div>
    </div>
  );
}

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@giapha/auth";
import { Alert, Button, DataTable, EmptyState, Pagination } from "@giapha/ui";
import { ApiError, apiFetch, apiFetchPage } from "../api/http";
import { AdminPageHeader } from "../components/AdminPageHeader";

type Mod = { code: string; enabled: boolean; configJson?: string | null } & Record<string, unknown>;
type Audit = {
  id?: number;
  actor?: string;
  action?: string;
  entityType?: string;
  entityId?: string;
  createdAt?: string;
} & Record<string, unknown>;

const AUDIT_PAGE_SIZE = 20;

export function SystemModulesPage() {
  const { getAccessToken } = useAuth();
  const [mods, setMods] = useState<Mod[]>([]);
  const [auditPage, setAuditPage] = useState(0);
  const [audit, setAudit] = useState<Audit[]>([]);
  const [auditTotal, setAuditTotal] = useState(0);
  const [auditTotalPages, setAuditTotalPages] = useState(1);
  const [error, setError] = useState<string | null>(null);

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
      setAuditTotalPages(auditResult.totalPages);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Không tải được thông tin hệ thống.");
    }
  }, [auditPage, getAccessToken]);

  useEffect(() => {
    void reload();
  }, [reload]);

  async function toggle(code: string, enabled: boolean) {
    const token = await getAccessToken();
    await apiFetch(`/api/v1/system/modules/${encodeURIComponent(code)}`, {
      method: "PUT",
      body: { enabled },
      token,
    });
    await reload();
  }

  return (
    <div className="admin-stack">
      <AdminPageHeader
        title="Hệ thống"
        description="Bật/tắt module tính năng và xem nhật ký thao tác quản trị."
      />

      {error ? (
        <Alert title="Lỗi" variant="error">
          {error}
        </Alert>
      ) : null}

      <section>
        <h2 style={{ fontFamily: "var(--font-display)" }}>Module</h2>
        {mods.length === 0 ? (
          <EmptyState title="Chưa có module" description="Danh sách module sẽ hiện khi hệ thống khởi tạo." />
        ) : (
          <DataTable
            columns={[
              { key: "code", header: "Mã module", render: (r: Mod) => r.code },
              { key: "en", header: "Trạng thái", render: (r: Mod) => (r.enabled ? "Đang bật" : "Đang tắt") },
              {
                key: "act",
                header: "Thao tác",
                render: (r: Mod) => (
                  <Button type="button" onClick={() => void toggle(r.code, !r.enabled)}>
                    {r.enabled ? "Tắt" : "Bật"}
                  </Button>
                ),
              },
            ]}
            rows={mods}
          />
        )}
      </section>

      <section>
        <h2 style={{ fontFamily: "var(--font-display)" }}>Nhật ký thao tác</h2>
        {audit.length === 0 ? (
          <EmptyState title="Chưa có nhật ký" description="Thao tác quản trị sẽ được ghi lại tại đây." />
        ) : (
          <>
            <div className="admin-table-wrap">
              <DataTable
                columns={[
                  { key: "id", header: "ID", render: (r: Audit) => r.id ?? "—" },
                  { key: "actor", header: "Người thực hiện", render: (r: Audit) => r.actor ?? "—" },
                  { key: "action", header: "Hành động", render: (r: Audit) => r.action ?? "—" },
                  {
                    key: "ent",
                    header: "Đối tượng",
                    render: (r: Audit) => `${r.entityType ?? ""} ${r.entityId ?? ""}`.trim() || "—",
                  },
                  {
                    key: "at",
                    header: "Thời gian",
                    render: (r: Audit) =>
                      r.createdAt ? new Date(r.createdAt).toLocaleString("vi-VN") : "—",
                  },
                ]}
                rows={audit}
              />
            </div>
            <div className="admin-table-footer">
              <Pagination
                page={auditPage + 1}
                totalPages={auditTotalPages}
                totalItems={auditTotal}
                onPageChange={(p) => setAuditPage(p - 1)}
              />
            </div>
          </>
        )}
      </section>
    </div>
  );
}

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@giapha/auth";
import { Alert, Button, DataTable, EmptyState } from "@giapha/ui";
import { ApiError, apiFetch } from "../api/http";

type Mod = { code: string; enabled: boolean; configJson?: string | null } & Record<string, unknown>;
type Audit = {
  id?: number;
  actor?: string;
  action?: string;
  entityType?: string;
  entityId?: string;
  createdAt?: string;
} & Record<string, unknown>;

export function SystemModulesPage() {
  const { getAccessToken } = useAuth();
  const [mods, setMods] = useState<Mod[]>([]);
  const [audit, setAudit] = useState<Audit[]>([]);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    try {
      const token = await getAccessToken();
      setMods(await apiFetch<Mod[]>("/api/v1/system/modules", { token }));
      setAudit(await apiFetch<Audit[]>("/api/v1/system/audit-logs", { token }));
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Không tải hệ thống.");
    }
  }, [getAccessToken]);

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
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-lg)" }}>
      <h1 style={{ fontFamily: "var(--font-display)", margin: 0 }}>Hệ thống</h1>
      {error ? (
        <Alert title="Lỗi" variant="error">
          {error}
        </Alert>
      ) : null}

      <section>
        <h2 style={{ fontFamily: "var(--font-display)" }}>Module on/off</h2>
        {mods.length === 0 ? (
          <EmptyState title="Chưa có module" description="Sẽ seed khi mở trang." />
        ) : (
          <DataTable
            columns={[
              { key: "code", header: "Mã", render: (r: Mod) => r.code },
              { key: "en", header: "Bật", render: (r: Mod) => (r.enabled ? "ON" : "OFF") },
              {
                key: "act",
                header: "",
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
        <h2 style={{ fontFamily: "var(--font-display)" }}>Audit log</h2>
        {audit.length === 0 ? (
          <EmptyState title="Chưa có nhật ký" description="Thao tác module sẽ ghi audit." />
        ) : (
          <DataTable
            columns={[
              { key: "id", header: "ID", render: (r: Audit) => r.id ?? "—" },
              { key: "actor", header: "Actor", render: (r: Audit) => r.actor ?? "—" },
              { key: "action", header: "Action", render: (r: Audit) => r.action ?? "—" },
              {
                key: "ent",
                header: "Entity",
                render: (r: Audit) => `${r.entityType ?? ""} ${r.entityId ?? ""}`,
              },
              { key: "at", header: "Khi", render: (r: Audit) => r.createdAt ?? "—" },
            ]}
            rows={audit}
          />
        )}
      </section>
    </div>
  );
}

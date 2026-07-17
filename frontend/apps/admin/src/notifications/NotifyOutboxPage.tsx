import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@giapha/auth";
import { Alert, Button, DataTable, EmptyState, Select } from "@giapha/ui";
import {
  defaultTreeSlug,
  dispatchNotificationOutbox,
  listNotificationOutbox,
  type NotificationOutboxDto,
} from "../api/genealogyApi";
import { ApiError, apiBase } from "../api/http";

type Row = NotificationOutboxDto & Record<string, unknown>;

export function NotifyOutboxPage() {
  const { getAccessToken } = useAuth();
  const slug = defaultTreeSlug();
  const [filter, setFilter] = useState("pending");
  const [rows, setRows] = useState<NotificationOutboxDto[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const reload = useCallback(async () => {
    setError(null);
    try {
      const token = await getAccessToken();
      setRows(await listNotificationOutbox(slug, filter === "all" ? undefined : filter, token));
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Không tải outbox.");
      setRows([]);
    }
  }, [filter, getAccessToken, slug]);

  useEffect(() => {
    void reload();
  }, [reload]);

  async function runDispatch() {
    setBusy(true);
    setError(null);
    setMsg(null);
    try {
      const token = await getAccessToken();
      const r = await dispatchNotificationOutbox(slug, token);
      setMsg(`Đã xử lý ${r.processed} mục (plan + dispatch).`);
      await reload();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Dispatch thất bại.");
    } finally {
      setBusy(false);
    }
  }

  const columns = [
    { key: "id", header: "ID", render: (row: Row) => row.id ?? "—" },
    { key: "channel", header: "Kênh", render: (row: Row) => row.channel ?? "—" },
    { key: "status", header: "TT", render: (row: Row) => row.status ?? "—" },
    {
      key: "payload",
      header: "Payload",
      render: (row: Row) => (
        <pre
          style={{
            margin: 0,
            maxWidth: 360,
            maxHeight: 100,
            overflow: "auto",
            fontSize: "var(--font-size-sm)",
            fontFamily: "var(--font-body)",
          }}
        >
          {(row.payloadJson ?? "").slice(0, 300)}
        </pre>
      ),
    },
    { key: "created", header: "Tạo", render: (row: Row) => row.createdAt ?? "—" },
    { key: "sent", header: "Gửi", render: (row: Row) => row.sentAt ?? "—" },
  ];

  const icsUrl = `${apiBase()}/api/v1/trees/${encodeURIComponent(slug)}/anniversaries.ics`;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-md)" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: "var(--spacing-md)",
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <div>
          <h1 style={{ fontFamily: "var(--font-display)", margin: 0 }}>Outbox nhắc giỗ</h1>
          <p style={{ margin: 0, color: "var(--color-text-muted)", fontFamily: "var(--font-body)" }}>
            Email / Zalo OA / Web Push — F1 / R2.4 ·{" "}
            <a href={icsUrl} target="_blank" rel="noreferrer">
              Tải iCal cây
            </a>
          </p>
        </div>
        <div style={{ display: "flex", gap: "var(--spacing-sm)", alignItems: "center" }}>
          <Select
            aria-label="Lọc trạng thái"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            options={[
              { value: "pending", label: "Pending" },
              { value: "sent", label: "Sent" },
              { value: "dry_run", label: "Dry-run" },
              { value: "failed", label: "Failed" },
              { value: "all", label: "Tất cả" },
            ]}
          />
          <Button type="button" disabled={busy} onClick={() => void runDispatch()}>
            {busy ? "Đang chạy…" : "Plan + dispatch"}
          </Button>
        </div>
      </div>

      {error ? (
        <Alert title="Lỗi" variant="error">
          {error}
        </Alert>
      ) : null}
      {msg ? (
        <Alert title="OK" variant="success">
          {msg}
        </Alert>
      ) : null}

      {rows.length === 0 ? (
        <EmptyState title="Outbox trống" description="Chưa có tin nhắc khớp bộ lọc." />
      ) : (
        <DataTable columns={columns} rows={rows as Row[]} />
      )}
    </div>
  );
}

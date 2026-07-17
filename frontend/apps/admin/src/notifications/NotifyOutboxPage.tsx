import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@giapha/auth";
import { Alert, Button, DataTable, EmptyState, Pagination, Select } from "@giapha/ui";
import {
  defaultTreeSlug,
  dispatchNotificationOutbox,
  listNotificationOutbox,
  type NotificationOutboxDto,
} from "../api/genealogyApi";
import { ApiError, apiBase } from "../api/http";
import { AdminPageHeader } from "../components/AdminPageHeader";

type Row = NotificationOutboxDto & Record<string, unknown>;
const PAGE_SIZE = 20;

const statusLabel: Record<string, string> = {
  pending: "Chờ gửi",
  sent: "Đã gửi",
  dry_run: "Thử nghiệm",
  failed: "Thất bại",
};

export function NotifyOutboxPage() {
  const { getAccessToken } = useAuth();
  const slug = defaultTreeSlug();
  const [filter, setFilter] = useState("pending");
  const [page, setPage] = useState(0);
  const [rows, setRows] = useState<NotificationOutboxDto[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const reload = useCallback(async () => {
    setError(null);
    try {
      const token = await getAccessToken();
      const result = await listNotificationOutbox(
        slug,
        filter === "all" ? undefined : filter,
        token,
        page,
        PAGE_SIZE,
      );
      setRows(result.content);
      setTotalElements(result.totalElements);
      setTotalPages(result.totalPages);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Không tải được hàng đợi nhắc giỗ.");
      setRows([]);
    }
  }, [filter, getAccessToken, page, slug]);

  useEffect(() => {
    void reload();
  }, [reload]);

  useEffect(() => {
    setPage(0);
  }, [filter]);

  async function runDispatch() {
    setBusy(true);
    setError(null);
    setMsg(null);
    try {
      const token = await getAccessToken();
      const r = await dispatchNotificationOutbox(slug, token);
      setMsg(`Đã xử lý ${r.processed} tin nhắc.`);
      await reload();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Gửi nhắc giỗ thất bại.");
    } finally {
      setBusy(false);
    }
  }

  const columns = [
    { key: "id", header: "ID", render: (row: Row) => row.id ?? "—" },
    { key: "channel", header: "Kênh", render: (row: Row) => row.channel ?? "—" },
    {
      key: "status",
      header: "Trạng thái",
      render: (row: Row) => statusLabel[(row.status ?? "").toLowerCase()] ?? row.status ?? "—",
    },
    {
      key: "payload",
      header: "Nội dung",
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
    { key: "created", header: "Tạo lúc", render: (row: Row) => row.createdAt ?? "—" },
    { key: "sent", header: "Gửi lúc", render: (row: Row) => row.sentAt ?? "—" },
  ];

  const icsUrl = `${apiBase()}/api/v1/trees/${encodeURIComponent(slug)}/anniversaries.ics`;

  return (
    <div className="admin-stack">
      <AdminPageHeader
        title="Hàng đợi nhắc giỗ"
        description={
          <>
            Theo dõi tin nhắc ngày giỗ qua email, Zalo và thông báo web.{" "}
            <a href={icsUrl} target="_blank" rel="noreferrer">
              Tải lịch giỗ (iCal)
            </a>
          </>
        }
        actions={
          <div style={{ display: "flex", gap: "var(--spacing-sm)", alignItems: "center" }}>
            <Select
              aria-label="Lọc trạng thái"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              options={[
                { value: "pending", label: "Chờ gửi" },
                { value: "sent", label: "Đã gửi" },
                { value: "dry_run", label: "Thử nghiệm" },
                { value: "failed", label: "Thất bại" },
                { value: "all", label: "Tất cả" },
              ]}
            />
            <Button type="button" disabled={busy} onClick={() => void runDispatch()}>
              {busy ? "Đang gửi…" : "Lên lịch & gửi"}
            </Button>
          </div>
        }
      />

      {error ? (
        <Alert title="Lỗi" variant="error">
          {error}
        </Alert>
      ) : null}
      {msg ? (
        <Alert title="Thành công" variant="success">
          {msg}
        </Alert>
      ) : null}

      {rows.length === 0 ? (
        <EmptyState title="Hàng đợi trống" description="Chưa có tin nhắc khớp bộ lọc." />
      ) : (
        <>
          <div className="admin-table-wrap">
            <DataTable columns={columns} rows={rows as Row[]} />
          </div>
          <div className="admin-table-footer">
            <Pagination
              page={page + 1}
              totalPages={totalPages}
              totalItems={totalElements}
              onPageChange={(p) => setPage(p - 1)}
            />
          </div>
        </>
      )}
    </div>
  );
}

import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@giapha/auth";
import {
  Alert,
  Badge,
  Button,
  DataTable,
  EmptyState,
  Pagination,
  Select,
  Textarea,
} from "@giapha/ui";
import {
  defaultTreeSlug,
  listChangeRequests,
  reviewChangeRequest,
  type ChangeRequestDto,
} from "../api/genealogyApi";
import { ApiError } from "../api/http";
import { AdminPageHeader } from "../components/AdminPageHeader";

type Row = ChangeRequestDto & Record<string, unknown>;
const PAGE_SIZE = 20;

const statusLabel: Record<string, string> = {
  pending: "Chờ duyệt",
  approved: "Đã duyệt",
  rejected: "Từ chối",
};

export function ModerationInboxPage() {
  const { getAccessToken } = useAuth();
  const slug = defaultTreeSlug();
  const [filter, setFilter] = useState("pending");
  const [page, setPage] = useState(0);
  const [rows, setRows] = useState<ChangeRequestDto[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await getAccessToken();
      const result = await listChangeRequests(
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
      setError(e instanceof ApiError ? e.message : "Không tải được hàng đợi tự khai.");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [filter, getAccessToken, page, slug]);

  useEffect(() => {
    void reload();
  }, [reload]);

  useEffect(() => {
    setPage(0);
  }, [filter]);

  async function review(id: number, action: "approve" | "reject") {
    setBusyId(id);
    setError(null);
    try {
      const token = await getAccessToken();
      await reviewChangeRequest(slug, id, action, note.trim() || undefined, token);
      setNote("");
      await reload();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Duyệt thất bại.");
    } finally {
      setBusyId(null);
    }
  }

  const columns = [
    {
      key: "id",
      header: "ID",
      render: (row: Row) => row.id ?? "—",
    },
    {
      key: "summary",
      header: "Tóm tắt",
      render: (row: Row) => row.summary || row.entityType || "—",
    },
    {
      key: "person",
      header: "Người",
      render: (row: Row) =>
        row.person ? (
          <Link to={`/persons/${row.person.code}`}>{row.person.fullName ?? row.person.code}</Link>
        ) : (
          "—"
        ),
    },
    {
      key: "requesterUserId",
      header: "Người gửi",
      render: (row: Row) => <code>{row.requesterUserId}</code>,
    },
    {
      key: "status",
      header: "Trạng thái",
      render: (row: Row) => {
        const s = (row.status ?? "pending").toLowerCase();
        return (
          <Badge tone={s === "approved" ? "success" : s === "rejected" ? "error" : "warning"}>
            {statusLabel[s] ?? s}
          </Badge>
        );
      },
    },
    {
      key: "diff",
      header: "Thay đổi",
      render: (row: Row) => (
        <pre
          style={{
            margin: 0,
            maxWidth: 280,
            maxHeight: 120,
            overflow: "auto",
            fontSize: "var(--font-size-sm)",
            fontFamily: "var(--font-body)",
          }}
        >
          {(row.diffJson ?? "").slice(0, 400)}
        </pre>
      ),
    },
    {
      key: "actions",
      header: "Thao tác",
      render: (row: Row) => {
        if ((row.status ?? "").toLowerCase() !== "pending" || row.id == null) return "—";
        const busy = busyId === row.id;
        return (
          <div style={{ display: "flex", gap: "var(--spacing-xs)", flexWrap: "wrap" }}>
            <Button type="button" disabled={busy} onClick={() => void review(row.id!, "approve")}>
              Duyệt
            </Button>
            <Button
              type="button"
              variant="secondary"
              disabled={busy}
              onClick={() => void review(row.id!, "reject")}
            >
              Từ chối
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="admin-stack">
      <AdminPageHeader
        title="Duyệt tự khai"
        description="Xem và phê duyệt thông tin con cháu tự khai bổ sung hoặc chỉnh sửa."
        actions={
          <div style={{ minWidth: 180 }}>
            <Select
              aria-label="Lọc trạng thái"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              options={[
                { value: "pending", label: "Chờ duyệt" },
                { value: "approved", label: "Đã duyệt" },
                { value: "rejected", label: "Từ chối" },
                { value: "all", label: "Tất cả" },
              ]}
            />
          </div>
        }
      />

      {error ? (
        <Alert title="Lỗi" variant="error">
          {error}
        </Alert>
      ) : null}

      <Textarea
        rows={2}
        placeholder="Ghi chú duyệt / từ chối (tuỳ chọn)…"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        aria-label="Ghi chú duyệt"
      />

      {loading ? (
        <p style={{ fontFamily: "var(--font-body)", color: "var(--color-text-muted)" }}>Đang tải…</p>
      ) : rows.length === 0 ? (
        <EmptyState title="Không có yêu cầu" description="Chưa có tự khai khớp bộ lọc." />
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

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@giapha/auth";
import { Alert, Badge, Button, DataTable, EmptyState, Select } from "@giapha/ui";
import { deleteCmsComment, listCmsComments, patchCmsComment } from "../api/cmsApi";
import type { CmsCommentDto } from "../api/cmsTypes";
import { ApiError } from "../api/http";

type Filter = "all" | "pending" | "approved" | "rejected";

type Row = CmsCommentDto & Record<string, unknown>;

const statusLabel: Record<string, string> = {
  pending: "Chờ duyệt",
  approved: "Đã duyệt",
  rejected: "Từ chối",
};

function normalizeStatus(raw: string | null | undefined): string {
  return (raw ?? "pending").toLowerCase();
}

export function CommentsModerationPage() {
  const { getAccessToken } = useAuth();
  const [filter, setFilter] = useState<Filter>("pending");
  const [rows, setRows] = useState<CmsCommentDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await getAccessToken();
      setRows(await listCmsComments(token));
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Không tải được bình luận.");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [getAccessToken]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const filtered = useMemo(() => {
    if (filter === "all") return rows as Row[];
    return rows.filter((c) => normalizeStatus(c.status) === filter) as Row[];
  }, [filter, rows]);

  async function setStatus(row: CmsCommentDto, status: "approved" | "rejected") {
    if (row.id == null) return;
    setBusyId(row.id);
    setError(null);
    try {
      const token = await getAccessToken();
      await patchCmsComment(row.id, { id: row.id, status }, token);
      await reload();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Cập nhật trạng thái thất bại.");
    } finally {
      setBusyId(null);
    }
  }

  async function remove(row: CmsCommentDto) {
    if (row.id == null) return;
    if (!confirm("Xóa bình luận này?")) return;
    setBusyId(row.id);
    setError(null);
    try {
      const token = await getAccessToken();
      await deleteCmsComment(row.id, token);
      await reload();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Xóa thất bại.");
    } finally {
      setBusyId(null);
    }
  }

  const columns = [
    {
      key: "post",
      header: "Bài viết",
      render: (row: Row) => row.post?.title ?? row.post?.slug ?? "—",
    },
    {
      key: "authorName",
      header: "Tác giả",
      render: (row: Row) => row.authorName ?? "Ẩn danh",
    },
    {
      key: "body",
      header: "Nội dung",
      render: (row: Row) => (
        <span style={{ maxWidth: 360, display: "inline-block" }}>
          {(row.body ?? "").slice(0, 160)}
          {(row.body?.length ?? 0) > 160 ? "…" : ""}
        </span>
      ),
    },
    {
      key: "status",
      header: "Trạng thái",
      render: (row: Row) => {
        const s = normalizeStatus(row.status);
        return (
          <Badge tone={s === "approved" ? "success" : s === "rejected" ? "error" : "warning"}>
            {statusLabel[s] ?? s}
          </Badge>
        );
      },
    },
    {
      key: "createdAt",
      header: "Thời gian",
      render: (row: Row) =>
        row.createdAt ? new Date(row.createdAt).toLocaleString("vi-VN") : "—",
    },
    {
      key: "actions",
      header: "Thao tác",
      render: (row: Row) => {
        const busy = busyId === row.id;
        const s = normalizeStatus(row.status);
        return (
          <div style={{ display: "flex", gap: "var(--spacing-xs)", flexWrap: "wrap" }}>
            {s !== "approved" ? (
              <Button
                type="button"
                disabled={busy}
                onClick={() => void setStatus(row, "approved")}
              >
                Duyệt
              </Button>
            ) : null}
            {s !== "rejected" ? (
              <Button
                type="button"
                variant="secondary"
                disabled={busy}
                onClick={() => void setStatus(row, "rejected")}
              >
                Từ chối
              </Button>
            ) : null}
            <Button type="button" variant="ghost" disabled={busy} onClick={() => void remove(row)}>
              Xóa
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-md)" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "var(--spacing-md)",
          flexWrap: "wrap",
        }}
      >
        <h1 style={{ fontFamily: "var(--font-display)", margin: 0 }}>Duyệt bình luận</h1>
        <div style={{ minWidth: 200 }}>
          <Select
            aria-label="Lọc trạng thái"
            value={filter}
            onChange={(e) => setFilter(e.target.value as Filter)}
            options={[
              { value: "pending", label: "Chờ duyệt" },
              { value: "approved", label: "Đã duyệt" },
              { value: "rejected", label: "Từ chối" },
              { value: "all", label: "Tất cả" },
            ]}
          />
        </div>
      </div>

      {error ? (
        <Alert title="Lỗi API" variant="error">
          {error}
        </Alert>
      ) : null}

      {loading ? (
        <p style={{ fontFamily: "var(--font-body)", color: "var(--color-text-muted)" }}>Đang tải…</p>
      ) : filtered.length === 0 ? (
        <EmptyState
          title="Không có bình luận"
          description="Không có mục khớp bộ lọc hiện tại."
        />
      ) : (
        <DataTable columns={columns} rows={filtered} />
      )}
    </div>
  );
}

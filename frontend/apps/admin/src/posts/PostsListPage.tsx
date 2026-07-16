import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@giapha/auth";
import { Alert, Badge, Button, DataTable, EmptyState, Input } from "@giapha/ui";
import { deleteCmsPost, listCmsPosts } from "../api/cmsApi";
import { ApiError } from "../api/http";
import { fromCmsPost } from "./postMappers";
import type { PostRecord } from "./types";

type Row = PostRecord & Record<string, unknown>;

const statusLabel: Record<PostRecord["status"], string> = {
  draft: "Nháp",
  published: "Đã xuất bản",
  archived: "Lưu trữ",
};

export function PostsListPage() {
  const { getAccessToken } = useAuth();
  const [query, setQuery] = useState("");
  const [rows, setRows] = useState<PostRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await getAccessToken();
      const posts = await listCmsPosts(token);
      setRows(posts.map(fromCmsPost));
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : "Không tải được danh sách bài viết.";
      setError(msg);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [getAccessToken]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter(
      (p) =>
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q) ||
        (p.summary?.toLowerCase().includes(q) ?? false),
    ) as Row[];
  }, [query, rows]);

  const columns = [
    {
      key: "title",
      header: "Tiêu đề",
      render: (row: Row) => row.title,
    },
    {
      key: "slug",
      header: "Slug",
      render: (row: Row) => <code>{row.slug}</code>,
    },
    {
      key: "status",
      header: "Trạng thái",
      render: (row: Row) => (
        <Badge tone={row.status === "published" ? "success" : "default"}>
          {statusLabel[row.status]}
        </Badge>
      ),
    },
    {
      key: "categorySlug",
      header: "Chuyên mục",
      render: (row: Row) => row.categorySlug ?? "—",
    },
    {
      key: "actions",
      header: "Thao tác",
      render: (row: Row) => (
        <div style={{ display: "flex", gap: "var(--spacing-sm)" }}>
          <Link to={`/posts/${row.id}`}>Sửa</Link>
          <button
            type="button"
            style={{
              border: "none",
              background: "transparent",
              color: "var(--color-status-error-fg)",
              cursor: "pointer",
              fontFamily: "var(--font-body)",
            }}
            onClick={() => {
              void (async () => {
                if (!confirm(`Xóa «${row.title}»?`)) return;
                try {
                  const token = await getAccessToken();
                  await deleteCmsPost(Number(row.id), token);
                  await reload();
                } catch (e) {
                  setError(e instanceof ApiError ? e.message : "Xóa thất bại.");
                }
              })();
            }}
          >
            Xóa
          </button>
        </div>
      ),
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
        <h1 style={{ fontFamily: "var(--font-display)", margin: 0 }}>Bài viết</h1>
        <Link to="/posts/new">
          <Button type="button">Viết bài</Button>
        </Link>
      </div>
      {error ? (
        <Alert title="Lỗi API" variant="error">
          {error}
        </Alert>
      ) : null}
      <Input
        placeholder="Tìm theo tiêu đề / slug…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        aria-label="Tìm bài viết"
      />
      {loading ? (
        <p style={{ fontFamily: "var(--font-body)", color: "var(--color-text-muted)" }}>Đang tải…</p>
      ) : filtered.length === 0 ? (
        <EmptyState
          title="Chưa có bài viết"
          description="Tạo bài mới hoặc kiểm tra quyền cms:post:read / API."
          action={
            <Link to="/posts/new">
              <Button>Viết bài</Button>
            </Link>
          }
        />
      ) : (
        <DataTable columns={columns} rows={filtered} />
      )}
    </div>
  );
}

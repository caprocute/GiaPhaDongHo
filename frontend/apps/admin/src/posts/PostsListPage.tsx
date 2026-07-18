import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@giapha/auth";
import {
  Alert,
  Badge,
  Button,
  Input,
  ProTable,
} from "@giapha/ui";
import type { ProTableColumn } from "@giapha/ui";
import { deleteCmsPost, listCmsCategories, listCmsPosts } from "../api/cmsApi";
import type { CmsCategoryDto } from "../api/cmsTypes";
import { ApiError } from "../api/http";
import { AdminPageHeader } from "../components/AdminPageHeader";
import { fromCmsPost } from "./postMappers";
import type { PostRecord } from "./types";

type Row = PostRecord & Record<string, unknown>;
type StatusFilter = "all" | PostRecord["status"];

const PAGE_SIZE = 20;

const statusLabel: Record<PostRecord["status"], string> = {
  draft: "Nháp",
  published: "Đã xuất bản",
  archived: "Lưu trữ",
};

export function PostsListPage() {
  const { getAccessToken } = useAuth();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [category, setCategory] = useState("all");
  const [categories, setCategories] = useState<CmsCategoryDto[]>([]);
  const [page, setPage] = useState(0);
  const [rows, setRows] = useState<PostRecord[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await getAccessToken();
      const [result, cats] = await Promise.all([
        listCmsPosts(token, page, PAGE_SIZE),
        listCmsCategories(token),
      ]);
      setRows(result.content.map(fromCmsPost));
      setTotalElements(result.totalElements);
      setTotalPages(Math.max(1, result.totalPages));
      setCategories(cats);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Không tải được danh sách bài viết.");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [getAccessToken, page]);

  useEffect(() => {
    void reload();
  }, [reload]);

  useEffect(() => {
    setPage(0);
  }, [status, category, query]);

  const counts = useMemo(() => {
    return {
      all: rows.length,
      published: rows.filter((p) => p.status === "published").length,
      draft: rows.filter((p) => p.status === "draft").length,
      archived: rows.filter((p) => p.status === "archived").length,
    };
  }, [rows]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((p) => {
      if (status !== "all" && p.status !== status) return false;
      if (category !== "all" && (p.categorySlug ?? "") !== category) return false;
      if (!q) return true;
      return (
        p.title.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q) ||
        (p.summary?.toLowerCase().includes(q) ?? false)
      );
    }) as Row[];
  }, [category, query, rows, status]);

  const columns: ProTableColumn<Row>[] = [
    {
      key: "title",
      header: "Tiêu đề",
      render: (row) => (
        <div className="cms-title-cell">
          <strong>{row.title as string}</strong>
          {row.summary ? <small>{(row.summary as string).slice(0, 90)}{((row.summary as string).length ?? 0) > 90 ? "…" : ""}</small> : null}
          <code>{row.slug as string}</code>
        </div>
      ),
      sortable: true,
      exportValue: (row) => String(row.title ?? ""),
    },
    {
      key: "status",
      header: "Trạng thái",
      render: (row) => (
        <Badge tone={row.status === "published" ? "success" : "default"}>
          {statusLabel[row.status as PostRecord["status"]]}
        </Badge>
      ),
      width: 130,
      exportValue: (row) => statusLabel[row.status as PostRecord["status"]] ?? String(row.status ?? ""),
    },
    {
      key: "categorySlug",
      header: "Chuyên mục",
      render: (row) => (row.categorySlug as string | null | undefined) ?? "—",
      exportValue: (row) => String(row.categorySlug ?? ""),
    },
    {
      key: "authorName",
      header: "Tác giả",
      render: (row) => (row.authorName as string | null | undefined) ?? "—",
      exportValue: (row) => String(row.authorName ?? ""),
    },
    {
      key: "actions",
      header: "Thao tác",
      hideable: false,
      width: 100,
      render: (row) => (
        <div style={{ display: "flex", gap: "var(--spacing-sm)" }}>
          <Link to={`/posts/${row.id}`}>Sửa</Link>
          <button
            type="button"
            className="link-danger"
            onClick={(e) => {
              e.stopPropagation();
              void (async () => {
                if (!confirm(`Xóa «${row.title}»?`)) return;
                try {
                  const token = await getAccessToken();
                  await deleteCmsPost(Number(String(row.id)), token);
                  await reload();
                } catch (err) {
                  setError(err instanceof ApiError ? err.message : "Xóa thất bại.");
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

  const statusTabs: { key: StatusFilter; label: string; count: number }[] = [
    { key: "all", label: "Tất cả", count: counts.all },
    { key: "published", label: "Xuất bản", count: counts.published },
    { key: "draft", label: "Nháp", count: counts.draft },
    { key: "archived", label: "Lưu trữ", count: counts.archived },
  ];

  return (
    <div className="admin-stack">
      <AdminPageHeader
        title="Bài viết"
        description="Tin tức và thông báo hiển thị trên trang công khai khi đã xuất bản."
        actions={
          <Link to="/posts/new">
            <Button type="button">+ Viết bài</Button>
          </Link>
        }
      />
      {error ? (
        <Alert title="Lỗi" variant="error">
          {error}
        </Alert>
      ) : null}

      <div className="cms-layout">
        <aside className="cms-sidebar" aria-label="Chuyên mục">
          <div className="cms-sidebar-hd">Chuyên mục</div>
          <button
            type="button"
            className={`cms-cat${category === "all" ? " on" : ""}`}
            onClick={() => setCategory("all")}
          >
            Tất cả chuyên mục
          </button>
          {categories.map((c) => (
            <button
              key={c.slug}
              type="button"
              className={`cms-cat${category === c.slug ? " on" : ""}`}
              onClick={() => setCategory(c.slug)}
            >
              {c.name}
            </button>
          ))}
          <div className="cms-sidebar-note">
            Tháng này: <b>{counts.published}</b> bài đã xuất bản trên trang hiện tại.
          </div>
        </aside>

        <div className="cms-main">
          <div className="status-tabs" role="tablist">
            {statusTabs.map((t) => (
              <button
                key={t.key}
                type="button"
                role="tab"
                aria-selected={status === t.key}
                className={`status-tab${status === t.key ? " on" : ""}`}
                onClick={() => setStatus(t.key)}
              >
                {t.label}
                <span className="ct">{t.count}</span>
              </button>
            ))}
          </div>

          <div className="cms-toolbar">
            <label className="fi-search">
              <span aria-hidden>⌕</span>
              <Input
                placeholder="Tìm tiêu đề, đường dẫn…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Tìm bài viết"
              />
            </label>
          </div>

          <ProTable
            rowKey="id"
            columns={columns}
            rows={filtered}
            loading={loading}
            exportable
            exportFilename="bai-viet"
            onRefresh={() => void reload()}
            emptyState={{
              title: "Chưa có bài viết",
              description: "Tạo bài mới — soạn nội dung bằng trình soạn thảo, rồi xuất bản lên cổng thông tin.",
              action: (
                <Link to="/posts/new">
                  <Button>Viết bài</Button>
                </Link>
              ),
            }}
            pagination={{
              page: page + 1,
              totalPages,
              totalItems: totalElements,
              pageSize: PAGE_SIZE,
              onPageChange: (p) => setPage(p - 1),
            }}
          />
        </div>
      </div>
    </div>
  );
}

import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@giapha/auth";
import { Alert, Badge, EmptyState, Input, Pagination, Select } from "@giapha/ui";
import { deleteCmsComment, listCmsComments, patchCmsComment } from "../api/cmsApi";
import type { CmsCommentDto } from "../api/cmsTypes";
import { ApiError } from "../api/http";
import { AdminPageHeader } from "../components/AdminPageHeader";

type Filter = "all" | "pending" | "approved" | "rejected";

const PAGE_SIZE = 20;

const statusLabel: Record<string, string> = {
  pending: "Chờ duyệt",
  approved: "Đã duyệt",
  rejected: "Từ chối",
};

function normalizeStatus(raw: string | null | undefined): string {
  return (raw ?? "pending").toLowerCase();
}

function initials(label: string): string {
  return (
    label
      .split(/\s+/)
      .filter(Boolean)
      .slice(-2)
      .map((p) => p[0]?.toUpperCase() ?? "")
      .join("") || "?"
  );
}

export function CommentsModerationPage() {
  const { getAccessToken } = useAuth();
  const [filter, setFilter] = useState<Filter>("pending");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const [rows, setRows] = useState<CmsCommentDto[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [counts, setCounts] = useState({ pending: 0, approved: 0, rejected: 0, all: 0 });

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await getAccessToken();
      const result = await listCmsComments(token, page, PAGE_SIZE);
      setRows(result.content);
      setTotalElements(result.totalElements);
      setTotalPages(Math.max(1, result.totalPages));

      // Đếm tab từ vài trang đầu (đủ cho CRM nhỏ; tránh phụ thuộc API filter chưa có)
      const probe = await listCmsComments(token, 0, 100);
      const all = probe.content;
      setCounts({
        all: probe.totalElements,
        pending: all.filter((c) => normalizeStatus(c.status) === "pending").length,
        approved: all.filter((c) => normalizeStatus(c.status) === "approved").length,
        rejected: all.filter((c) => normalizeStatus(c.status) === "rejected").length,
      });
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Không tải được bình luận.");
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
    setSelected(new Set());
  }, [filter, query]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((c) => {
      if (filter !== "all" && normalizeStatus(c.status) !== filter) return false;
      if (!q) return true;
      return (
        (c.body ?? "").toLowerCase().includes(q) ||
        (c.authorName ?? "").toLowerCase().includes(q) ||
        (c.post?.title ?? "").toLowerCase().includes(q)
      );
    });
  }, [filter, query, rows]);

  const visibleIds = filtered.map((c) => c.id).filter((id): id is number => id != null);
  const allSelected = visibleIds.length > 0 && visibleIds.every((id) => selected.has(id));

  function toggleOne(id: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (allSelected) setSelected(new Set());
    else setSelected(new Set(visibleIds));
  }

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
      setSelected((s) => {
        const n = new Set(s);
        n.delete(row.id!);
        return n;
      });
      await reload();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Xóa thất bại.");
    } finally {
      setBusyId(null);
    }
  }

  async function bulk(action: "approved" | "rejected" | "delete") {
    const ids = [...selected];
    if (ids.length === 0) return;
    if (action === "delete" && !confirm(`Xóa ${ids.length} bình luận đã chọn?`)) return;
    setError(null);
    try {
      const token = await getAccessToken();
      for (const id of ids) {
        if (action === "delete") await deleteCmsComment(id, token);
        else await patchCmsComment(id, { id, status: action }, token);
      }
      setSelected(new Set());
      await reload();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Thao tác hàng loạt thất bại.");
    }
  }

  const tabs: { key: Filter; label: string; count: number; warn?: boolean }[] = [
    { key: "pending", label: "Chờ duyệt", count: counts.pending, warn: true },
    { key: "approved", label: "Đã duyệt", count: counts.approved },
    { key: "rejected", label: "Từ chối", count: counts.rejected },
    { key: "all", label: "Tất cả", count: counts.all },
  ];

  const emptyTitle =
    filter === "pending" ? "Không có bình luận chờ duyệt" : "Không có bình luận";
  const emptyDesc =
    filter === "pending"
      ? "Tất cả bình luận đã được xử lý. Bình luận mới sẽ hiện tại đây."
      : "Không có mục khớp bộ lọc trên trang hiện tại.";

  return (
    <div className="admin-stack">
      <AdminPageHeader
        title="Duyệt bình luận"
        description="Kiểm duyệt bình luận trên bài viết trước khi hiển thị công khai — xem ngữ cảnh bài, duyệt hoặc từ chối từng bình luận."
        actions={
          <Link to="/settings" className="admin-link-btn">
            ⚙ Cấu hình kiểm duyệt
          </Link>
        }
      />

      {error ? (
        <Alert title="Lỗi" variant="error">
          {error}
        </Alert>
      ) : null}

      <div className="status-tabs" role="tablist">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            role="tab"
            aria-selected={filter === t.key}
            className={`status-tab${filter === t.key ? " on" : ""}`}
            onClick={() => setFilter(t.key)}
          >
            {t.label}
            <span className={`ct${t.warn && t.count > 0 ? " warn" : ""}`}>{t.count}</span>
          </button>
        ))}
      </div>

      <div className="cms-toolbar">
        <label className="fi-search">
          <span aria-hidden>⌕</span>
          <Input
            placeholder="Tìm nội dung, tác giả, bài viết…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Tìm bình luận"
          />
        </label>
        <Select
          aria-label="Sắp xếp"
          value="newest"
          onChange={() => undefined}
          options={[
            { value: "newest", label: "Sắp xếp: Mới nhất" },
            { value: "oldest", label: "Cũ nhất" },
          ]}
        />
      </div>

      {selected.size > 0 ? (
        <div className="bulk-bar">
          <input type="checkbox" checked={allSelected} onChange={toggleAll} aria-label="Chọn tất cả" />
          <b>{selected.size}</b> bình luận được chọn
          <div className="bulk-acts">
            <button type="button" className="bulk-btn ok" onClick={() => void bulk("approved")}>
              ✓ Duyệt tất cả
            </button>
            <button type="button" className="bulk-btn rej" onClick={() => void bulk("rejected")}>
              ✕ Từ chối tất cả
            </button>
            <button type="button" className="bulk-btn del" onClick={() => void bulk("delete")}>
              🗑 Xóa tất cả
            </button>
          </div>
        </div>
      ) : null}

      {loading ? (
        <p className="admin-loading">Đang tải…</p>
      ) : filtered.length === 0 ? (
        <EmptyState title={emptyTitle} description={emptyDesc} />
      ) : (
        <>
          {filtered.map((row) => {
            const s = normalizeStatus(row.status);
            const author = row.authorName?.trim() || "Ẩn danh";
            const busy = busyId === row.id;
            const checked = row.id != null && selected.has(row.id);
            return (
              <article
                key={row.id}
                className={`comment-card ${s}${checked ? " selected" : ""}`}
              >
                <div className="comment-post-ctx">
                  <span aria-hidden>📰</span>
                  Bài viết:{" "}
                  {row.post?.id != null ? (
                    <Link to={`/posts/${row.post.id}`}>{row.post.title ?? row.post.slug}</Link>
                  ) : (
                    <span>{row.post?.title ?? "—"}</span>
                  )}
                </div>
                <div className="comment-main">
                  <div className="comment-check">
                    <input
                      type="checkbox"
                      checked={checked}
                      disabled={row.id == null}
                      onChange={() => row.id != null && toggleOne(row.id)}
                      aria-label={`Chọn bình luận của ${author}`}
                    />
                  </div>
                  <div className="comment-avatar" aria-hidden>
                    {initials(author)}
                  </div>
                  <div className="comment-content">
                    <div className="comment-header">
                      <span className="comment-author">{author}</span>
                      <Badge
                        tone={s === "approved" ? "success" : s === "rejected" ? "error" : "warning"}
                      >
                        {statusLabel[s] ?? s}
                      </Badge>
                      <span className="comment-time">
                        {row.createdAt ? new Date(row.createdAt).toLocaleString("vi-VN") : "—"}
                      </span>
                    </div>
                    <div className="comment-body-text">{row.body ?? "—"}</div>
                    <div className="comment-actions">
                      {s === "pending" ? (
                        <>
                          <button
                            type="button"
                            className="act-approve"
                            disabled={busy}
                            onClick={() => void setStatus(row, "approved")}
                          >
                            ✓ Duyệt
                          </button>
                          <button
                            type="button"
                            className="act-reject"
                            disabled={busy}
                            onClick={() => void setStatus(row, "rejected")}
                          >
                            Từ chối
                          </button>
                        </>
                      ) : null}
                      {s === "approved" ? (
                        <button
                          type="button"
                          className="act-reject"
                          disabled={busy}
                          onClick={() => void setStatus(row, "rejected")}
                        >
                          Từ chối
                        </button>
                      ) : null}
                      {s === "rejected" ? (
                        <button
                          type="button"
                          className="act-approve"
                          disabled={busy}
                          onClick={() => void setStatus(row, "approved")}
                        >
                          ✓ Duyệt lại
                        </button>
                      ) : null}
                      <button
                        type="button"
                        className="act-delete"
                        disabled={busy}
                        onClick={() => void remove(row)}
                      >
                        Xóa
                      </button>
                      {row.post?.id != null ? (
                        <>
                          <span className="divider" aria-hidden />
                          <Link className="act-view" to={`/posts/${row.post.id}`}>
                            Xem bài viết ↗
                          </Link>
                        </>
                      ) : null}
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
          <Pagination
            page={page + 1}
            totalPages={totalPages}
            totalItems={totalElements}
            pageSize={PAGE_SIZE}
            onPageChange={(p) => setPage(p - 1)}
          />
        </>
      )}
    </div>
  );
}

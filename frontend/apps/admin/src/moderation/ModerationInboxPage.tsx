import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CheckCheck, Clock, ThumbsDown, ThumbsUp } from "lucide-react";
import { useAuth } from "@giapha/auth";
import { Alert, Badge, Button, EmptyState, Pagination, Textarea } from "@giapha/ui";
import {
  defaultTreeSlug,
  listChangeRequests,
  reviewChangeRequest,
  type ChangeRequestDto,
} from "../api/genealogyApi";
import { ApiError } from "../api/http";
import { AdminPageHeader } from "../components/AdminPageHeader";

const PAGE_SIZE = 20;

const TABS = [
  { key: "pending",  label: "Chờ duyệt",  icon: Clock,      tone: "warning" as const },
  { key: "approved", label: "Đã duyệt",   icon: ThumbsUp,   tone: "success" as const },
  { key: "rejected", label: "Từ chối",    icon: ThumbsDown, tone: "error"   as const },
  { key: "all",      label: "Tất cả",     icon: null,       tone: "neutral" as const },
];

const statusLabel: Record<string, string> = {
  pending: "Chờ duyệt",
  approved: "Đã duyệt",
  rejected: "Từ chối",
};

function relTime(iso?: string | null): string {
  if (!iso) return "—";
  const d = Date.now() - new Date(iso).getTime();
  if (d < 60_000) return "vừa xong";
  if (d < 3_600_000) return `${Math.round(d / 60_000)} phút trước`;
  if (d < 86_400_000) return `${Math.round(d / 3_600_000)} giờ trước`;
  return `${Math.round(d / 86_400_000)} ngày trước`;
}

function DiffPreview({ json }: { json?: string | null }) {
  if (!json) return <span style={{ color: "var(--color-text-muted)" }}>—</span>;
  let parsed: Record<string, unknown> | null = null;
  try { parsed = JSON.parse(json); } catch { /* ignore */ }
  if (!parsed) return <code style={{ fontSize: 11 }}>{json.slice(0, 120)}</code>;
  const entries = Object.entries(parsed).filter(([, v]) => v !== null && v !== undefined && v !== "");
  if (entries.length === 0) return <span style={{ color: "var(--color-text-muted)" }}>Không có thay đổi</span>;
  return (
    <ul style={{ margin: 0, padding: "0 0 0 14px", fontSize: 11.5, fontFamily: "var(--font-body)" }}>
      {entries.slice(0, 6).map(([k, v]) => (
        <li key={k}>
          <b>{k}</b>: {String(v).slice(0, 60)}
        </li>
      ))}
      {entries.length > 6 ? <li>…và {entries.length - 6} trường khác</li> : null}
    </ul>
  );
}

export function ModerationInboxPage() {
  const { getAccessToken } = useAuth();
  const slug = defaultTreeSlug();

  const [tab, setTab] = useState("pending");
  const [page, setPage] = useState(0);
  const [rows, setRows] = useState<ChangeRequestDto[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [tabCounts, setTabCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [bulkBusy, setBulkBusy] = useState(false);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    setSelected(new Set());
    try {
      const token = await getAccessToken();
      const result = await listChangeRequests(
        slug,
        tab === "all" ? undefined : tab,
        token,
        page,
        PAGE_SIZE,
      );
      setRows(result.content);
      setTotalElements(result.totalElements);
      setTotalPages(result.totalPages);

      // Load tab counts in background
      const [pendingRes, approvedRes, rejectedRes] = await Promise.allSettled([
        listChangeRequests(slug, "pending", token, 0, 1),
        listChangeRequests(slug, "approved", token, 0, 1),
        listChangeRequests(slug, "rejected", token, 0, 1),
      ]);
      setTabCounts({
        pending:  pendingRes.status === "fulfilled"  ? pendingRes.value.totalElements  : 0,
        approved: approvedRes.status === "fulfilled" ? approvedRes.value.totalElements : 0,
        rejected: rejectedRes.status === "fulfilled" ? rejectedRes.value.totalElements : 0,
      });
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Không tải được hàng đợi tự khai.");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [tab, page, getAccessToken, slug]);

  useEffect(() => { void reload(); }, [reload]);
  useEffect(() => { setPage(0); }, [tab]);

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

  async function bulkReview(action: "approve" | "reject") {
    if (selected.size === 0) return;
    setBulkBusy(true);
    setError(null);
    try {
      const token = await getAccessToken();
      await Promise.all(
        [...selected].map((id) =>
          reviewChangeRequest(slug, id, action, note.trim() || undefined, token),
        ),
      );
      setNote("");
      setSelected(new Set());
      await reload();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Duyệt hàng loạt thất bại.");
    } finally {
      setBulkBusy(false);
    }
  }

  function toggleSelect(id: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    const pendingIds = rows.filter((r) => (r.status ?? "").toLowerCase() === "pending" && r.id != null).map((r) => r.id!);
    if (pendingIds.every((id) => selected.has(id))) {
      setSelected(new Set());
    } else {
      setSelected(new Set(pendingIds));
    }
  }

  const pendingRows = rows.filter((r) => (r.status ?? "").toLowerCase() === "pending");
  const allPendingSelected = pendingRows.length > 0 && pendingRows.every((r) => r.id != null && selected.has(r.id!));

  return (
    <div className="admin-stack">
      <AdminPageHeader
        title="Duyệt tự khai"
        description="Xem xét và phê duyệt thông tin con cháu tự khai bổ sung hoặc chỉnh sửa hồ sơ."
      />

      {error ? (
        <Alert title="Lỗi" variant="error">{error}</Alert>
      ) : null}

      {/* Tab strip */}
      <div className="mod-tabs" role="tablist">
        {TABS.map((t) => {
          const Icon = t.icon;
          const count = tabCounts[t.key];
          return (
            <button
              key={t.key}
              role="tab"
              type="button"
              aria-selected={tab === t.key}
              className={`mod-tab${tab === t.key ? " mod-tab-on" : ""}`}
              onClick={() => setTab(t.key)}
            >
              {Icon ? <Icon size={14} /> : null}
              {t.label}
              {count != null && count > 0 ? (
                <span className={`mod-tab-badge mod-tab-badge-${t.tone}`}>{count}</span>
              ) : null}
            </button>
          );
        })}
      </div>

      {/* Bulk actions bar */}
      {tab === "pending" && rows.length > 0 ? (
        <div className="mod-bulk-bar">
          <label className="mod-check-label">
            <input
              type="checkbox"
              checked={allPendingSelected}
              onChange={toggleAll}
              aria-label="Chọn tất cả"
            />
            {selected.size > 0 ? `Đã chọn ${selected.size}` : "Chọn tất cả"}
          </label>

          {selected.size > 0 ? (
            <>
              <Textarea
                rows={1}
                placeholder="Ghi chú (tùy chọn)…"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                aria-label="Ghi chú duyệt"
                style={{ flex: 1, minWidth: 160, maxWidth: 320 }}
              />
              <Button
                type="button"
                disabled={bulkBusy}
                onClick={() => void bulkReview("approve")}
              >
                <CheckCheck size={15} /> Duyệt {selected.size} yêu cầu
              </Button>
              <Button
                type="button"
                variant="secondary"
                disabled={bulkBusy}
                onClick={() => void bulkReview("reject")}
              >
                Từ chối {selected.size}
              </Button>
            </>
          ) : null}
        </div>
      ) : null}

      {/* Request cards */}
      {loading ? (
        <p style={{ fontFamily: "var(--font-body)", color: "var(--color-text-muted)" }}>Đang tải…</p>
      ) : rows.length === 0 ? (
        <EmptyState title="Không có yêu cầu" description="Chưa có tự khai khớp bộ lọc." />
      ) : (
        <div className="mod-cards">
          {rows.map((req) => {
            const status = (req.status ?? "pending").toLowerCase();
            const isPending = status === "pending";
            const isSelected = req.id != null && selected.has(req.id);

            return (
              <div
                key={req.id}
                className={`mod-card${isSelected ? " mod-card-selected" : ""}`}
              >
                {/* Card header */}
                <div className="mod-card-head">
                  {isPending ? (
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => req.id != null && toggleSelect(req.id)}
                      aria-label={`Chọn yêu cầu #${req.id}`}
                    />
                  ) : <span />}

                  <div className="mod-card-who">
                    <div className="mod-avatar">{(req.person?.fullName ?? req.requesterUserId ?? "?")[0]?.toUpperCase()}</div>
                    <div>
                      <b>
                        {req.person?.fullName ? (
                          <Link to={`/persons/${req.person.code}`}>{req.person.fullName}</Link>
                        ) : (
                          req.summary ?? `Yêu cầu #${req.id}`
                        )}
                      </b>
                      <div className="mod-card-meta">
                        {req.requesterUserId ? `Người gửi: ${req.requesterUserId} · ` : ""}
                        {relTime(req.createdAt)}
                        {req.person?.code ? ` · Mã ${req.person.code}` : ""}
                      </div>
                    </div>
                  </div>

                  <Badge
                    tone={status === "approved" ? "success" : status === "rejected" ? "error" : "warning"}
                  >
                    {statusLabel[status] ?? status}
                  </Badge>
                </div>

                {/* Diff preview */}
                {req.diffJson ? (
                  <div className="mod-diff">
                    <span className="mod-diff-label">Thay đổi</span>
                    <DiffPreview json={req.diffJson} />
                  </div>
                ) : req.summary ? (
                  <p className="mod-card-summary">{req.summary}</p>
                ) : null}

                {/* Actions */}
                {isPending && req.id != null ? (
                  <div className="mod-card-acts">
                    <Button
                      type="button"
                      disabled={busyId === req.id}
                      onClick={() => void review(req.id!, "approve")}
                    >
                      <ThumbsUp size={14} /> Duyệt
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      disabled={busyId === req.id}
                      onClick={() => void review(req.id!, "reject")}
                    >
                      <ThumbsDown size={14} /> Từ chối
                    </Button>
                    <Textarea
                      rows={1}
                      placeholder="Ghi chú…"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      aria-label="Ghi chú"
                    />
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      )}

      {rows.length > 0 ? (
        <Pagination
          page={page + 1}
          totalPages={totalPages}
          totalItems={totalElements}
          pageSize={PAGE_SIZE}
          onPageChange={(p) => setPage(p - 1)}
        />
      ) : null}
    </div>
  );
}

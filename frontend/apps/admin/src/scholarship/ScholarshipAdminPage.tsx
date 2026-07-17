import { useCallback, useEffect, useState } from "react";
import { Award, CheckCheck, GraduationCap } from "lucide-react";
import { useAuth } from "@giapha/auth";
import { Alert, Badge, Button, EmptyState, Pagination } from "@giapha/ui";
import { defaultTreeSlug } from "../api/genealogyApi";
import { ApiError, apiFetch, apiFetchPage } from "../api/http";
import { AdminPageHeader } from "../components/AdminPageHeader";

type Entry = {
  id?: number;
  personName?: string;
  personCode?: string;
  achievement?: string;
  level?: string | null;
  year?: number | null;
  status?: string | null;
} & Record<string, unknown>;

const PAGE_SIZE = 20;

const TABS = [
  { key: "nominated", label: "Chờ duyệt", tone: "warning" as const },
  { key: "approved",  label: "Đã duyệt",  tone: "success" as const },
  { key: "rejected",  label: "Từ chối",   tone: "error"   as const },
  { key: "all",       label: "Tất cả",    tone: "neutral" as const },
];

const levelLabel: Record<string, string> = {
  university: "Đại học",
  highschool: "THPT",
  master:     "Thạc sĩ",
  phd:        "Tiến sĩ",
};

export function ScholarshipAdminPage() {
  const { getAccessToken } = useAuth();
  const slug = defaultTreeSlug();

  const [tab, setTab] = useState("nominated");
  const [page, setPage] = useState(0);
  const [rows, setRows] = useState<Entry[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [tabCounts, setTabCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [bulkBusy, setBulkBusy] = useState(false);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    setSelected(new Set());
    try {
      const token = await getAccessToken();
      const q = tab === "all" ? "" : `?status=${encodeURIComponent(tab)}`;
      const result = await apiFetchPage<Entry>(
        `/api/v1/trees/${encodeURIComponent(slug)}/scholarship-entries/admin${q}`,
        { token, page, size: PAGE_SIZE },
      );
      setRows(result.content);
      setTotalElements(result.totalElements);
      setTotalPages(result.totalPages);

      // Count per tab
      const [nom, apr, rej] = await Promise.allSettled([
        apiFetchPage<Entry>(`/api/v1/trees/${encodeURIComponent(slug)}/scholarship-entries/admin?status=nominated`, { token, page: 0, size: 1 }),
        apiFetchPage<Entry>(`/api/v1/trees/${encodeURIComponent(slug)}/scholarship-entries/admin?status=approved`,  { token, page: 0, size: 1 }),
        apiFetchPage<Entry>(`/api/v1/trees/${encodeURIComponent(slug)}/scholarship-entries/admin?status=rejected`,  { token, page: 0, size: 1 }),
      ]);
      setTabCounts({
        nominated: nom.status === "fulfilled" ? nom.value.totalElements : 0,
        approved:  apr.status === "fulfilled" ? apr.value.totalElements : 0,
        rejected:  rej.status === "fulfilled" ? rej.value.totalElements : 0,
      });
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Không tải được đề cử khuyến học.");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [tab, page, getAccessToken, slug]);

  useEffect(() => { void reload(); }, [reload]);
  useEffect(() => { setPage(0); }, [tab]);

  async function review(id: number, action: "approve" | "reject") {
    const token = await getAccessToken();
    await apiFetch(
      `/api/v1/trees/${encodeURIComponent(slug)}/scholarship-entries/${id}/${action}`,
      { method: "POST", body: {}, token },
    );
    await reload();
  }

  async function bulkReview(action: "approve" | "reject") {
    if (selected.size === 0) return;
    setBulkBusy(true);
    setError(null);
    try {
      const token = await getAccessToken();
      await Promise.all(
        [...selected].map((id) =>
          apiFetch(
            `/api/v1/trees/${encodeURIComponent(slug)}/scholarship-entries/${id}/${action}`,
            { method: "POST", body: {}, token },
          ),
        ),
      );
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
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  const pendingRows = rows.filter((r) => (r.status ?? "").toLowerCase() === "nominated" && r.id != null);
  const allSelected = pendingRows.length > 0 && pendingRows.every((r) => selected.has(r.id!));

  return (
    <div className="admin-stack">
      <AdminPageHeader
        title="Khuyến học"
        description="Duyệt đề cử thành tích học tập của con cháu dòng họ và quản lý học bổng tộc."
      />

      {error ? <Alert title="Lỗi" variant="error">{error}</Alert> : null}

      {/* Tab strip */}
      <div className="mod-tabs" role="tablist">
        {TABS.map((t) => {
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
              {t.key === "nominated" ? <Award size={14} /> : t.key === "approved" ? <GraduationCap size={14} /> : null}
              {t.label}
              {count != null && count > 0 ? (
                <span className={`mod-tab-badge mod-tab-badge-${t.tone}`}>{count}</span>
              ) : null}
            </button>
          );
        })}
      </div>

      {/* Bulk bar */}
      {tab === "nominated" && rows.length > 0 ? (
        <div className="mod-bulk-bar">
          <label className="mod-check-label">
            <input type="checkbox" checked={allSelected} onChange={() => {
              const ids = pendingRows.map((r) => r.id!);
              if (allSelected) setSelected(new Set());
              else setSelected(new Set(ids));
            }} />
            {selected.size > 0 ? `Đã chọn ${selected.size}` : "Chọn tất cả"}
          </label>
          {selected.size > 0 ? (
            <>
              <Button type="button" disabled={bulkBusy} onClick={() => void bulkReview("approve")}>
                <CheckCheck size={15} /> Duyệt {selected.size}
              </Button>
              <Button type="button" variant="secondary" disabled={bulkBusy} onClick={() => void bulkReview("reject")}>
                Từ chối {selected.size}
              </Button>
            </>
          ) : null}
        </div>
      ) : null}

      {loading ? (
        <p className="admin-loading">Đang tải…</p>
      ) : rows.length === 0 ? (
        <EmptyState title="Chưa có đề cử" description="Chưa có đề cử khuyến học khớp bộ lọc." />
      ) : (
        <>
          <div className="scholar-cards">
            {rows.map((r) => {
              const status = (r.status ?? "").toLowerCase();
              const isPending = status === "nominated";
              const isSelected = r.id != null && selected.has(r.id);
              return (
                <div
                  key={r.id}
                  className={`scholar-card${isSelected ? " scholar-card-selected" : ""}`}
                >
                  <div className="scholar-card-head">
                    {isPending ? (
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => r.id != null && toggleSelect(r.id)}
                      />
                    ) : <span />}
                    <div className="scholar-info">
                      <b>{r.personName ?? "—"}</b>
                      {r.personCode ? <span className="scholar-code">{r.personCode}</span> : null}
                    </div>
                    <Badge
                      tone={status === "approved" ? "success" : status === "rejected" ? "error" : "warning"}
                    >
                      {status === "nominated" ? "Chờ duyệt" : status === "approved" ? "Đã duyệt" : "Từ chối"}
                    </Badge>
                  </div>
                  <div className="scholar-body">
                    <div className="scholar-achievement">{r.achievement ?? "—"}</div>
                    <div className="scholar-meta">
                      {r.year ? `Năm ${r.year}` : ""}
                      {r.level ? ` · ${levelLabel[r.level] ?? r.level}` : ""}
                    </div>
                  </div>
                  {isPending && r.id != null ? (
                    <div className="mod-card-acts">
                      <Button type="button" onClick={() => void review(r.id!, "approve")}>
                        Duyệt
                      </Button>
                      <Button type="button" variant="secondary" onClick={() => void review(r.id!, "reject")}>
                        Từ chối
                      </Button>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
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

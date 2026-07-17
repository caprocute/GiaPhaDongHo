import { useCallback, useEffect, useState } from "react";
import { Bell, Calendar, Download, Play, RefreshCw } from "lucide-react";
import { useAuth } from "@giapha/auth";
import { Alert, Badge, Button, EmptyState, Pagination, Select } from "@giapha/ui";
import {
  defaultTreeSlug,
  dispatchNotificationOutbox,
  listNotificationOutbox,
  type NotificationOutboxDto,
} from "../api/genealogyApi";
import { ApiError, apiBase, apiFetchPage } from "../api/http";
import { AdminPageHeader } from "../components/AdminPageHeader";

const PAGE_SIZE = 20;

type Anniversary = {
  id?: number;
  lunarDay?: number;
  lunarMonth?: number;
  note?: string | null;
  person?: { code?: string; fullName?: string; generation?: number | null } | null;
};

const TABS = [
  { key: "upcoming", label: "Danh sách giỗ" },
  { key: "outbox",   label: "Lịch sử nhắc" },
];

const statusLabel: Record<string, string> = {
  pending:  "Chờ gửi",
  sent:     "Đã gửi",
  dry_run:  "Thử nghiệm",
  failed:   "Thất bại",
};

const statusTone: Record<string, "warning" | "success" | "error" | "default"> = {
  pending:  "warning",
  sent:     "success",
  dry_run:  "default",
  failed:   "error",
};

const channelLabel: Record<string, string> = {
  email: "Email",
  zalo:  "Zalo OA",
  web:   "Thông báo web",
};

function LunarBadge({ day, month }: { day?: number | null; month?: number | null }) {
  return (
    <span className="gio-badge">
      <span className="gio-badge-mm">{month ?? "?"} ÂL</span>
      <span className="gio-badge-dd">{String(day ?? "").padStart(2, "0")}</span>
    </span>
  );
}

export function NotifyOutboxPage() {
  const { getAccessToken } = useAuth();
  const slug = defaultTreeSlug();

  const [tab, setTab] = useState("upcoming");

  // Anniversary list
  const [anniversaries, setAnniversaries] = useState<Anniversary[]>([]);
  const [annTotal, setAnnTotal] = useState(0);
  const [annTotalPages, setAnnTotalPages] = useState(1);
  const [annPage, setAnnPage] = useState(0);
  const [annMonth, setAnnMonth] = useState<string>("all");
  const [annLoading, setAnnLoading] = useState(false);

  // Outbox
  const [outboxFilter, setOutboxFilter] = useState("pending");
  const [outboxPage, setOutboxPage] = useState(0);
  const [outboxRows, setOutboxRows] = useState<NotificationOutboxDto[]>([]);
  const [outboxTotal, setOutboxTotal] = useState(0);
  const [outboxTotalPages, setOutboxTotalPages] = useState(1);
  const [outboxLoading, setOutboxLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const icsUrl = `${apiBase()}/api/v1/trees/${encodeURIComponent(slug)}/anniversaries.ics`;

  const loadAnniversaries = useCallback(async () => {
    setAnnLoading(true);
    setError(null);
    try {
      const token = await getAccessToken();
      const q = annMonth !== "all" ? `&lunarMonth=${annMonth}` : "";
      const result = await apiFetchPage<Anniversary>(
        `/api/v1/trees/${encodeURIComponent(slug)}/anniversaries?sort=lunarMonth,asc&sort=lunarDay,asc${q}`,
        { token, page: annPage, size: PAGE_SIZE },
      );
      setAnniversaries(result.content);
      setAnnTotal(result.totalElements);
      setAnnTotalPages(result.totalPages);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Không tải được danh sách giỗ.");
    } finally {
      setAnnLoading(false);
    }
  }, [annMonth, annPage, getAccessToken, slug]);

  const loadOutbox = useCallback(async () => {
    setOutboxLoading(true);
    setError(null);
    try {
      const token = await getAccessToken();
      const result = await listNotificationOutbox(
        slug,
        outboxFilter === "all" ? undefined : outboxFilter,
        token,
        outboxPage,
        PAGE_SIZE,
      );
      setOutboxRows(result.content);
      setOutboxTotal(result.totalElements);
      setOutboxTotalPages(result.totalPages);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Không tải được lịch sử nhắc.");
      setOutboxRows([]);
    } finally {
      setOutboxLoading(false);
    }
  }, [outboxFilter, outboxPage, getAccessToken, slug]);

  useEffect(() => {
    if (tab === "upcoming") void loadAnniversaries();
    else void loadOutbox();
  }, [tab, loadAnniversaries, loadOutbox]);

  useEffect(() => { setAnnPage(0); }, [annMonth]);
  useEffect(() => { setOutboxPage(0); }, [outboxFilter]);

  async function runDispatch() {
    setBusy(true);
    setError(null);
    setMsg(null);
    try {
      const token = await getAccessToken();
      const r = await dispatchNotificationOutbox(slug, token);
      setMsg(`Đã xử lý ${r.processed} tin nhắc giỗ.`);
      if (tab === "outbox") await loadOutbox();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Gửi nhắc giỗ thất bại.");
    } finally {
      setBusy(false);
    }
  }

  const monthOptions = [
    { value: "all", label: "Tất cả tháng" },
    ...Array.from({ length: 12 }, (_, i) => ({
      value: String(i + 1),
      label: `Tháng ${i + 1} ÂL`,
    })),
  ];

  return (
    <div className="admin-stack">
      <AdminPageHeader
        title="Ngày giỗ"
        description="Danh sách ngày giỗ trong phả hệ và lịch sử gửi tin nhắc nhắc nhở."
        actions={
          <div style={{ display: "flex", gap: "var(--spacing-sm)" }}>
            <a href={icsUrl} target="_blank" rel="noreferrer" className="admin-link-btn">
              <Download size={14} /> Tải lịch (iCal)
            </a>
            <Button type="button" disabled={busy} onClick={() => void runDispatch()}>
              <Play size={14} /> {busy ? "Đang gửi…" : "Gửi nhắc ngay"}
            </Button>
          </div>
        }
      />

      {error ? <Alert title="Lỗi" variant="error">{error}</Alert> : null}
      {msg   ? <Alert title="Thành công" variant="success">{msg}</Alert> : null}

      {/* Tab strip */}
      <div className="mod-tabs" role="tablist">
        {TABS.map((t) => (
          <button
            key={t.key}
            role="tab"
            type="button"
            aria-selected={tab === t.key}
            className={`mod-tab${tab === t.key ? " mod-tab-on" : ""}`}
            onClick={() => setTab(t.key)}
          >
            {t.key === "upcoming" ? <Calendar size={14} /> : <Bell size={14} />}
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Tab: Danh sách giỗ ── */}
      {tab === "upcoming" ? (
        <>
          <div className="admin-filter-bar">
            <Select
              aria-label="Lọc tháng"
              value={annMonth}
              onChange={(e) => setAnnMonth(e.target.value)}
              options={monthOptions}
            />
            <Button type="button" variant="secondary" onClick={() => void loadAnniversaries()} disabled={annLoading}>
              <RefreshCw size={14} /> Tải lại
            </Button>
          </div>

          {annLoading ? (
            <p className="admin-loading">Đang tải…</p>
          ) : anniversaries.length === 0 ? (
            <EmptyState
              title="Chưa có ngày giỗ"
              description="Thêm ngày mất cho thành viên ở mục Thành viên để tự động tạo ngày giỗ."
            />
          ) : (
            <>
              <div className="gio-grid">
                {anniversaries.map((a) => (
                  <div
                    key={a.id ?? `${a.lunarMonth}-${a.lunarDay}-${a.person?.code}`}
                    className="gio-card"
                  >
                    <LunarBadge day={a.lunarDay} month={a.lunarMonth} />
                    <div className="gio-card-body">
                      <div className="gio-card-name">
                        {a.person?.fullName ?? "—"}
                      </div>
                      <div className="gio-card-meta">
                        {a.person?.code ? `Mã ${a.person.code}` : ""}
                        {a.person?.generation != null ? ` · Đời ${a.person.generation}` : ""}
                        {a.note ? ` · ${a.note}` : ""}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <Pagination
                page={annPage + 1}
                totalPages={annTotalPages}
                totalItems={annTotal}
                pageSize={PAGE_SIZE}
                onPageChange={(p) => setAnnPage(p - 1)}
              />
            </>
          )}
        </>
      ) : null}

      {/* ── Tab: Lịch sử nhắc ── */}
      {tab === "outbox" ? (
        <>
          <div className="admin-filter-bar">
            <Select
              aria-label="Lọc trạng thái"
              value={outboxFilter}
              onChange={(e) => setOutboxFilter(e.target.value)}
              options={[
                { value: "pending",  label: "Chờ gửi" },
                { value: "sent",     label: "Đã gửi" },
                { value: "dry_run",  label: "Thử nghiệm" },
                { value: "failed",   label: "Thất bại" },
                { value: "all",      label: "Tất cả" },
              ]}
            />
            <Button type="button" variant="secondary" onClick={() => void loadOutbox()} disabled={outboxLoading}>
              <RefreshCw size={14} /> Tải lại
            </Button>
          </div>

          <p className="admin-help-text">
            Hệ thống tự động tạo tin nhắc nhắc giỗ 3 ngày trước ngày âm lịch. Nhấn <b>Gửi nhắc ngay</b> để gửi thủ công.
          </p>

          {outboxLoading ? (
            <p className="admin-loading">Đang tải…</p>
          ) : outboxRows.length === 0 ? (
            <EmptyState
              title="Hàng đợi trống"
              description="Chưa có tin nhắc khớp bộ lọc."
            />
          ) : (
            <>
              <div className="outbox-list">
                {outboxRows.map((row) => {
                  const status = (row.status ?? "pending").toLowerCase();
                  let payloadSummary = "";
                  try {
                    const obj = JSON.parse(row.payloadJson ?? "{}");
                    payloadSummary = obj.message ?? obj.title ?? obj.body ?? "";
                  } catch { /* ignore */ }

                  return (
                    <div key={row.id} className="outbox-row">
                      <div className="outbox-row-left">
                        <Badge tone={statusTone[status] ?? "default"}>
                          {statusLabel[status] ?? status}
                        </Badge>
                        <span className="outbox-channel">
                          {channelLabel[row.channel ?? ""] ?? row.channel ?? "—"}
                        </span>
                      </div>
                      <div className="outbox-row-body">
                        {payloadSummary || <span style={{ color: "var(--color-text-muted)" }}>—</span>}
                      </div>
                      <div className="outbox-row-time">
                        {row.sentAt
                          ? `Gửi: ${new Date(row.sentAt).toLocaleString("vi-VN")}`
                          : row.createdAt
                            ? `Tạo: ${new Date(row.createdAt).toLocaleString("vi-VN")}`
                            : "—"}
                      </div>
                    </div>
                  );
                })}
              </div>
              <Pagination
                page={outboxPage + 1}
                totalPages={outboxTotalPages}
                totalItems={outboxTotal}
                pageSize={PAGE_SIZE}
                onPageChange={(p) => setOutboxPage(p - 1)}
              />
            </>
          )}
        </>
      ) : null}
    </div>
  );
}

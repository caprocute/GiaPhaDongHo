import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Bell, Calendar, Download, Pencil, Play, RefreshCw, Settings2 } from "lucide-react";
import { useAuth } from "@giapha/auth";
import { convertLunarToSolar } from "@giapha/lunar";
import {
  Alert,
  Badge,
  Button,
  EmptyState,
  FormField,
  Input,
  Pagination,
  Select,
  Switch,
} from "@giapha/ui";
import {
  defaultTreeSlug,
  dispatchNotificationOutbox,
  getTreeSettings,
  listNotificationOutbox,
  updateTreeSettings,
  type NotificationOutboxDto,
  type NotifySettings,
  type TreeSettingsDto,
} from "../api/genealogyApi";
import { ApiError, apiBase, apiFetchPage } from "../api/http";
import { AdminPageHeader } from "../components/AdminPageHeader";

const PAGE_SIZE = 12;
const OUTBOX_PAGE = 20;

type Anniversary = {
  id?: number;
  lunarDay?: number;
  lunarMonth?: number;
  note?: string | null;
  person?: {
    code?: string;
    fullName?: string;
    generation?: number | null;
    gender?: string | null;
  } | null;
};

type TabKey = "upcoming" | "outbox" | "config";

const TABS: { key: TabKey; label: string; icon: typeof Calendar }[] = [
  { key: "upcoming", label: "Danh sách giỗ", icon: Calendar },
  { key: "outbox", label: "Lịch sử nhắc", icon: Bell },
  { key: "config", label: "Cấu hình nhắc", icon: Settings2 },
];

const statusLabel: Record<string, string> = {
  pending: "Chờ gửi",
  sent: "Đã gửi",
  dry_run: "Thử nghiệm",
  failed: "Thất bại",
};

const statusTone: Record<string, "warning" | "success" | "error" | "default"> = {
  pending: "warning",
  sent: "success",
  dry_run: "default",
  failed: "error",
};

const channelLabel: Record<string, string> = {
  email: "Email",
  zalo: "Zalo OA",
  web: "Thông báo web",
  web_push: "Thông báo web",
  push: "Thông báo web",
};

function genderLabel(g?: string | null): string | null {
  if (!g) return null;
  const v = g.trim().toLowerCase();
  if (v === "m" || v === "male" || v === "nam") return "Nam";
  if (v === "f" || v === "female" || v === "nữ" || v === "nu") return "Nữ";
  return g;
}

function daysUntilLunar(day?: number | null, month?: number | null): number | null {
  if (day == null || month == null || day < 1 || month < 1 || month > 12) return null;
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const years = [today.getFullYear(), today.getFullYear() + 1];
  let best: number | null = null;
  for (const year of years) {
    const solar = convertLunarToSolar(day, month, year, false);
    if (Number.isNaN(solar.day) || Number.isNaN(solar.month) || Number.isNaN(solar.year)) continue;
    const target = new Date(solar.year, solar.month - 1, solar.day);
    const diff = Math.round((target.getTime() - start.getTime()) / 86_400_000);
    if (diff >= 0 && (best == null || diff < best)) best = diff;
  }
  return best;
}

function fmtShort(iso?: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function payloadSummary(row: NotificationOutboxDto): string {
  try {
    const obj = JSON.parse(row.payloadJson ?? "{}") as Record<string, unknown>;
    const msg = obj.message ?? obj.title ?? obj.body ?? obj.text;
    if (typeof msg === "string" && msg.trim()) return msg.trim();
    const name = typeof obj.personName === "string" ? obj.personName : null;
    const lunar = typeof obj.lunarLabel === "string" ? obj.lunarLabel : null;
    if (name && lunar) return `Nhắc giỗ ${name} — ${lunar}`;
    if (name) return `Nhắc giỗ ${name}`;
  } catch {
    /* ignore */
  }
  return "";
}

function normalizeChannel(ch?: string | null): string {
  const c = (ch ?? "").toLowerCase();
  if (c === "web_push" || c === "push" || c === "webpush") return "web";
  return c;
}

export function NotifyOutboxPage() {
  const { getAccessToken } = useAuth();
  const slug = defaultTreeSlug();

  const [tab, setTab] = useState<TabKey>("upcoming");

  const [anniversaries, setAnniversaries] = useState<Anniversary[]>([]);
  const [annTotal, setAnnTotal] = useState(0);
  const [annTotalPages, setAnnTotalPages] = useState(1);
  const [annPage, setAnnPage] = useState(0);
  const [annMonth, setAnnMonth] = useState("all");
  const [annQuery, setAnnQuery] = useState("");
  const [annGen, setAnnGen] = useState("all");
  const [annLoading, setAnnLoading] = useState(false);
  const [personsTotal, setPersonsTotal] = useState<number | null>(null);

  const [outboxFilter, setOutboxFilter] = useState("pending");
  const [outboxChannel, setOutboxChannel] = useState("all");
  const [outboxPage, setOutboxPage] = useState(0);
  const [outboxRows, setOutboxRows] = useState<NotificationOutboxDto[]>([]);
  const [outboxTotal, setOutboxTotal] = useState(0);
  const [outboxTotalPages, setOutboxTotalPages] = useState(1);
  const [outboxLoading, setOutboxLoading] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [sentCount, setSentCount] = useState(0);
  const [failedCount, setFailedCount] = useState(0);

  const [settings, setSettings] = useState<TreeSettingsDto | null>(null);
  const [notifyDraft, setNotifyDraft] = useState<NotifySettings>({
    remindDaysBefore: 3,
    remindHour: 8,
    channelEmail: false,
    channelZalo: true,
    channelWeb: true,
  });
  const [configSaving, setConfigSaving] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const icsUrl = `${apiBase()}/api/v1/trees/${encodeURIComponent(slug)}/anniversaries.ics`;
  const remindDays = notifyDraft.remindDaysBefore ?? settings?.notify?.remindDaysBefore ?? 3;

  const loadKpis = useCallback(async () => {
    try {
      const token = await getAccessToken();
      const [sent, failed, pending, persons] = await Promise.all([
        listNotificationOutbox(slug, "sent", token, 0, 1),
        listNotificationOutbox(slug, "failed", token, 0, 1),
        listNotificationOutbox(slug, "pending", token, 0, 1),
        apiFetchPage<{ id?: number }>(
          `/api/v1/trees/${encodeURIComponent(slug)}/persons?sort=id,desc`,
          { token, page: 0, size: 1 },
        ).catch(() => null),
      ]);
      setSentCount(sent.totalElements);
      setFailedCount(failed.totalElements);
      setPendingCount(pending.totalElements);
      if (persons) setPersonsTotal(persons.totalElements);
    } catch {
      /* KPI phụ — không chặn trang */
    }
  }, [getAccessToken, slug]);

  const loadSettings = useCallback(async () => {
    try {
      const token = await getAccessToken();
      const s = await getTreeSettings(slug, token);
      setSettings(s);
      setNotifyDraft({
        remindDaysBefore: s.notify?.remindDaysBefore ?? 7,
        remindHour: s.notify?.remindHour ?? 8,
        channelEmail: !!s.notify?.channelEmail,
        channelZalo: !!s.notify?.channelZalo,
        channelWeb: s.notify?.channelWeb !== false,
      });
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Không tải được cấu hình nhắc.");
    }
  }, [getAccessToken, slug]);

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
      setAnnTotalPages(Math.max(1, result.totalPages));
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
        OUTBOX_PAGE,
      );
      setOutboxRows(result.content);
      setOutboxTotal(result.totalElements);
      setOutboxTotalPages(Math.max(1, result.totalPages));
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Không tải được lịch sử nhắc.");
      setOutboxRows([]);
    } finally {
      setOutboxLoading(false);
    }
  }, [outboxFilter, outboxPage, getAccessToken, slug]);

  useEffect(() => {
    void loadSettings();
    void loadKpis();
  }, [loadSettings, loadKpis]);

  useEffect(() => {
    if (tab === "upcoming" || tab === "config") void loadAnniversaries();
    if (tab === "outbox") void loadOutbox();
  }, [tab, loadAnniversaries, loadOutbox]);

  useEffect(() => {
    setAnnPage(0);
  }, [annMonth]);
  useEffect(() => {
    setOutboxPage(0);
  }, [outboxFilter]);

  const filteredAnniversaries = useMemo(() => {
    const q = annQuery.trim().toLowerCase();
    return anniversaries.filter((a) => {
      const gen = a.person?.generation;
      if (annGen === "1-3" && (gen == null || gen < 1 || gen > 3)) return false;
      if (annGen === "4-6" && (gen == null || gen < 4 || gen > 6)) return false;
      if (annGen === "7+" && (gen == null || gen < 7)) return false;
      if (!q) return true;
      const name = (a.person?.fullName ?? "").toLowerCase();
      const code = (a.person?.code ?? "").toLowerCase();
      return name.includes(q) || code.includes(q);
    });
  }, [annGen, annQuery, anniversaries]);

  const enriched = useMemo(
    () =>
      filteredAnniversaries.map((a) => {
        const days = daysUntilLunar(a.lunarDay, a.lunarMonth);
        const near = days != null && days <= Math.max(remindDays, 3);
        let reminder: "near" | "sent" | "later" = "later";
        if (near && days != null && days <= remindDays) reminder = "near";
        else if (days != null && days > remindDays && days <= remindDays + 14) reminder = "sent";
        return { a, days, near, reminder };
      }),
    [filteredAnniversaries, remindDays],
  );

  const nearWindow = useMemo(() => {
    const withDays = anniversaries
      .map((a) => ({ a, days: daysUntilLunar(a.lunarDay, a.lunarMonth) }))
      .filter((x) => x.days != null && x.days <= 30) as { a: Anniversary; days: number }[];
    withDays.sort((x, y) => x.days - y.days);
    const nearest = withDays[0];
    return {
      count: withDays.length,
      nearestLabel: nearest
        ? `${String(nearest.a.lunarDay).padStart(2, "0")}/${nearest.a.lunarMonth} ÂL (${nearest.days} ngày)`
        : "—",
    };
  }, [anniversaries]);

  const filteredOutbox = useMemo(() => {
    if (outboxChannel === "all") return outboxRows;
    return outboxRows.filter((r) => normalizeChannel(r.channel) === outboxChannel);
  }, [outboxChannel, outboxRows]);

  const monthOptions = [
    { value: "all", label: "Tất cả tháng ÂL" },
    ...Array.from({ length: 12 }, (_, i) => ({
      value: String(i + 1),
      label: `Tháng ${i + 1} ÂL`,
    })),
  ];

  const hourOptions = [6, 7, 8, 9, 10, 12, 18].map((h) => ({
    value: String(h),
    label: `${String(h).padStart(2, "0")}:00`,
  }));

  async function runDispatch() {
    setBusy(true);
    setError(null);
    setMsg(null);
    try {
      const token = await getAccessToken();
      const r = await dispatchNotificationOutbox(slug, token);
      setMsg(`Đã xử lý ${r.processed} tin nhắc giỗ.`);
      await loadKpis();
      if (tab === "outbox") await loadOutbox();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Gửi nhắc giỗ thất bại.");
    } finally {
      setBusy(false);
    }
  }

  async function saveConfig(e: React.FormEvent) {
    e.preventDefault();
    setConfigSaving(true);
    setError(null);
    setMsg(null);
    try {
      const token = await getAccessToken();
      const current = settings ?? (await getTreeSettings(slug, token));
      const saved = await updateTreeSettings(
        slug,
        {
          ...current,
          notify: {
            ...current.notify,
            remindDaysBefore: Math.min(30, Math.max(0, Number(notifyDraft.remindDaysBefore) || 0)),
            remindHour: Math.min(23, Math.max(0, Number(notifyDraft.remindHour) || 0)),
            channelEmail: !!notifyDraft.channelEmail,
            channelZalo: !!notifyDraft.channelZalo,
            channelWeb: !!notifyDraft.channelWeb,
          },
        },
        token,
      );
      setSettings(saved);
      setMsg("Đã lưu cấu hình nhắc giỗ.");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Không lưu được cấu hình.");
    } finally {
      setConfigSaving(false);
    }
  }

  const previewName = settings?.displayName?.replace(/^Họ\s+/i, "") || "Hoàng";

  function reminderBadge(item: (typeof enriched)[number]) {
    if (item.near) {
      return (
        <>
          <Badge tone="warning">Chưa nhắc</Badge>
          {item.days != null ? <span className="gio-days-left">còn {item.days} ngày</span> : null}
        </>
      );
    }
    if (item.reminder === "sent") return <Badge tone="success">Đã nhắc</Badge>;
    return <Badge tone="default">Chưa đến</Badge>;
  }

  const listPanel = (
    <div className="gio-main">
      <div className="admin-filter-bar">
        <label className="gio-search">
          <span className="gio-search-icon" aria-hidden>
            ⌕
          </span>
          <Input
            aria-label="Tìm tên hoặc mã hiệu"
            placeholder="Tìm tên người, mã hiệu…"
            value={annQuery}
            onChange={(e) => setAnnQuery(e.target.value)}
          />
        </label>
        <Select
          aria-label="Lọc tháng âm"
          value={annMonth}
          onChange={(e) => setAnnMonth(e.target.value)}
          options={monthOptions}
        />
        <Select
          aria-label="Lọc đời"
          value={annGen}
          onChange={(e) => setAnnGen(e.target.value)}
          options={[
            { value: "all", label: "Tất cả đời" },
            { value: "1-3", label: "Đời 1–3" },
            { value: "4-6", label: "Đời 4–6" },
            { value: "7+", label: "Đời 7+" },
          ]}
        />
        <Button type="button" variant="secondary" onClick={() => void loadAnniversaries()} disabled={annLoading}>
          <RefreshCw size={14} /> Tải lại
        </Button>
      </div>

      {annLoading ? (
        <p className="admin-loading">Đang tải…</p>
      ) : enriched.length === 0 ? (
        <EmptyState
          title="Chưa có ngày giỗ"
          description="Thêm ngày mất cho thành viên ở mục Thành viên để tự động tạo ngày giỗ."
        />
      ) : (
        <>
          <div className="gio-grid">
            {enriched.map((item) => {
              const { a, near } = item;
              const g = genderLabel(a.person?.gender);
              return (
                <article
                  key={a.id ?? `${a.lunarMonth}-${a.lunarDay}-${a.person?.code}`}
                  className={`gio-card${near ? " gio-card-near" : ""}`}
                >
                  <div className={`gio-badge${near ? " gio-badge-near" : ""}`}>
                    <span className="gio-badge-mm">{a.lunarMonth ?? "?"} ÂL</span>
                    <span className="gio-badge-dd">{String(a.lunarDay ?? "").padStart(2, "0")}</span>
                  </div>
                  <div className="gio-card-body">
                    <div className="gio-card-name">{a.person?.fullName ?? "—"}</div>
                    <div className="gio-card-meta">
                      {a.person?.code ? `Mã ${a.person.code}` : ""}
                      {a.person?.generation != null ? ` · Đời ${a.person.generation}` : ""}
                      {g ? ` · ${g}` : ""}
                      {a.note ? ` · ${a.note}` : ""}
                    </div>
                    <div className="gio-card-foot">{reminderBadge(item)}</div>
                  </div>
                </article>
              );
            })}
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
    </div>
  );

  const configPanel = (
    <aside className="gio-config" aria-label="Cấu hình nhắc giỗ">
      <div className="gio-config-hd">
        <Settings2 size={16} aria-hidden /> Cấu hình nhắc giỗ
      </div>
      <form className="gio-config-body" onSubmit={(e) => void saveConfig(e)}>
        <FormField label="Nhắc trước bao nhiêu ngày" htmlFor="remind-days">
          <Select
            id="remind-days"
            value={String(notifyDraft.remindDaysBefore ?? 3)}
            onChange={(e) =>
              setNotifyDraft((d) => ({ ...d, remindDaysBefore: Number(e.target.value) }))
            }
            options={[1, 2, 3, 5, 7].map((n) => ({
              value: String(n),
              label: `${n} ngày trước`,
            }))}
          />
        </FormField>
        <FormField label="Giờ gửi tin nhắc" htmlFor="remind-hour">
          <Select
            id="remind-hour"
            value={String(notifyDraft.remindHour ?? 8)}
            onChange={(e) => setNotifyDraft((d) => ({ ...d, remindHour: Number(e.target.value) }))}
            options={hourOptions}
          />
        </FormField>

        <div className="gio-config-section">
          <div className="gio-config-section-lbl">Kênh gửi</div>
          <div className="gio-toggle-row">
            <div>
              <div className="gio-toggle-label">Zalo OA</div>
              <div className="gio-toggle-sub">Gửi qua trang Zalo dòng họ</div>
            </div>
            <Switch
              className="gio-switch"
              label=""
              aria-label="Bật Zalo OA"
              checked={!!notifyDraft.channelZalo}
              onChange={(e) => setNotifyDraft((d) => ({ ...d, channelZalo: e.target.checked }))}
            />
          </div>
          <div className="gio-toggle-row">
            <div>
              <div className="gio-toggle-label">Email</div>
              <div className="gio-toggle-sub">Gửi qua địa chỉ email</div>
            </div>
            <Switch
              className="gio-switch"
              label=""
              aria-label="Bật email"
              checked={!!notifyDraft.channelEmail}
              onChange={(e) => setNotifyDraft((d) => ({ ...d, channelEmail: e.target.checked }))}
            />
          </div>
          <div className="gio-toggle-row">
            <div>
              <div className="gio-toggle-label">Thông báo web</div>
              <div className="gio-toggle-sub">Thông báo trên cổng thông tin</div>
            </div>
            <Switch
              className="gio-switch"
              label=""
              aria-label="Bật thông báo web"
              checked={!!notifyDraft.channelWeb}
              onChange={(e) => setNotifyDraft((d) => ({ ...d, channelWeb: e.target.checked }))}
            />
          </div>
        </div>

        <div className="gio-config-section">
          <div className="gio-config-section-lbl">Nội dung mẫu (Zalo OA)</div>
          <div className="gio-config-preview">
            <div className="gio-preview-channel">Zalo OA</div>
            Kính gửi bà con họ {previewName},
            <br />
            Nhắc nhở: <strong>Ngày giỗ cụ {"{tên}"}</strong> sẽ diễn ra vào ngày{" "}
            <strong>
              {"{ngày_am_lich}"} ÂL
            </strong>{" "}
            ({"{ngày_duong_lich}"}).
            <br />
            Trân trọng — Ban quản trị gia phả.
          </div>
          <Link to="/settings#notify" className="gio-config-link">
            <Pencil size={12} aria-hidden /> Chỉnh sửa mẫu trong Cấu hình →
          </Link>
        </div>

        <Button type="submit" disabled={configSaving} style={{ width: "100%", justifyContent: "center" }}>
          {configSaving ? "Đang lưu…" : "Lưu cấu hình"}
        </Button>
      </form>
    </aside>
  );

  return (
    <div className="admin-stack">
      <AdminPageHeader
        title="Ngày giỗ"
        description="Danh sách ngày giỗ trong phả hệ, cấu hình tin nhắc nhắc nhở và xem lịch sử gửi."
        actions={
          <div style={{ display: "flex", gap: "var(--spacing-sm)", flexWrap: "wrap" }}>
            <a href={icsUrl} target="_blank" rel="noreferrer" className="admin-link-btn">
              <Download size={14} /> Tải lịch (iCal)
            </a>
            <Button type="button" disabled={busy} onClick={() => void runDispatch()}>
              <Play size={14} /> {busy ? "Đang gửi…" : "Gửi nhắc ngay"}
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

      <div className="stat-row">
        <div className="stat">
          <div className="stat-lbl">Tổng ngày giỗ</div>
          <div className="stat-val">{annTotal.toLocaleString("vi-VN")}</div>
          <div className="stat-sub">
            {personsTotal != null ? `Từ ${personsTotal.toLocaleString("vi-VN")} thành viên` : "Trong phả hệ"}
          </div>
        </div>
        <div className="stat">
          <div className="stat-lbl">Trong 30 ngày tới</div>
          <div className="stat-val stat-val-warn">{nearWindow.count}</div>
          <div className="stat-sub">Gần nhất: {nearWindow.nearestLabel}</div>
        </div>
        <div className="stat">
          <div className="stat-lbl">Đã gửi nhắc</div>
          <div className="stat-val">{sentCount.toLocaleString("vi-VN")}</div>
          <div className="stat-sub">Trong hàng đợi đã ghi nhận</div>
        </div>
        <div className="stat">
          <div className="stat-lbl">Thất bại gần đây</div>
          <div className={`stat-val${failedCount > 0 ? " stat-val-err" : ""}`}>
            {failedCount.toLocaleString("vi-VN")}
          </div>
          <div className="stat-sub">
            {failedCount > 0 ? "Cần kiểm tra kênh gửi" : "Không có lỗi gần đây"}
          </div>
        </div>
      </div>

      <div className="mod-tabs" role="tablist">
        {TABS.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              role="tab"
              type="button"
              aria-selected={tab === t.key}
              className={`mod-tab${tab === t.key ? " mod-tab-on" : ""}`}
              onClick={() => setTab(t.key)}
            >
              <Icon size={14} aria-hidden />
              {t.label}
              {t.key === "outbox" && pendingCount > 0 ? (
                <span className="mod-tab-badge mod-tab-badge-warning">{pendingCount}</span>
              ) : null}
            </button>
          );
        })}
      </div>

      {tab === "upcoming" ? <div className="gio-layout">{listPanel}{configPanel}</div> : null}

      {tab === "config" ? (
        <div className="gio-layout gio-layout-config-focus">
          <div className="gio-config-help">
            <p className="admin-help-text">
              Hệ thống tự động tạo tin nhắc <b>{remindDays} ngày trước</b> ngày âm lịch (khoảng{" "}
              <b>
                {String(notifyDraft.remindHour ?? 8).padStart(2, "0")}:00
              </b>
              ). Nhấn <b>Gửi nhắc ngay</b> để xử lý thủ công hàng đợi.
            </p>
            <p className="admin-help-text">
              Cấu hình chi tiết SMTP / Zalo nằm ở{" "}
              <Link to="/settings#notify">Hệ thống → Cấu hình</Link>.
            </p>
          </div>
          {configPanel}
        </div>
      ) : null}

      {tab === "outbox" ? (
        <>
          <div className="admin-filter-bar">
            <Select
              aria-label="Lọc trạng thái"
              value={outboxFilter}
              onChange={(e) => setOutboxFilter(e.target.value)}
              options={[
                { value: "pending", label: "Chờ gửi" },
                { value: "sent", label: "Đã gửi" },
                { value: "failed", label: "Thất bại" },
                { value: "dry_run", label: "Thử nghiệm" },
                { value: "all", label: "Tất cả" },
              ]}
            />
            <Select
              aria-label="Lọc kênh"
              value={outboxChannel}
              onChange={(e) => setOutboxChannel(e.target.value)}
              options={[
                { value: "all", label: "Tất cả kênh" },
                { value: "zalo", label: "Zalo OA" },
                { value: "email", label: "Email" },
                { value: "web", label: "Thông báo web" },
              ]}
            />
            <Button type="button" variant="secondary" onClick={() => void loadOutbox()} disabled={outboxLoading}>
              <RefreshCw size={14} /> Tải lại
            </Button>
          </div>

          <p className="admin-help-text gio-help-box">
            Hệ thống tự động tạo tin nhắc nhắc giỗ <b>{remindDays} ngày trước</b> ngày âm lịch. Nhấn{" "}
            <b>Gửi nhắc ngay</b> để xử lý thủ công tất cả hàng đợi.
          </p>

          {outboxLoading ? (
            <p className="admin-loading">Đang tải…</p>
          ) : filteredOutbox.length === 0 ? (
            <EmptyState title="Hàng đợi trống" description="Chưa có tin nhắc khớp bộ lọc." />
          ) : (
            <>
              <div className="outbox-wrap">
                {filteredOutbox.map((row) => {
                  const status = (row.status ?? "pending").toLowerCase();
                  const failed = status === "failed";
                  const ch = normalizeChannel(row.channel);
                  const summary = payloadSummary(row);
                  return (
                    <div key={row.id} className={`outbox-row${failed ? " outbox-row-failed" : ""}`}>
                      <div className="outbox-left">
                        <Badge tone={statusTone[status] ?? "default"}>
                          {statusLabel[status] ?? status}
                        </Badge>
                        <span className="outbox-channel">{channelLabel[ch] ?? row.channel ?? "—"}</span>
                      </div>
                      <div className="outbox-body">
                        {summary || <span className="outbox-empty">—</span>}
                      </div>
                      <div className={`outbox-meta${failed ? " outbox-meta-err" : ""}`}>
                        {row.sentAt
                          ? `Gửi: ${fmtShort(row.sentAt)}`
                          : row.createdAt
                            ? `${failed ? "Lỗi" : "Tạo"}: ${fmtShort(row.createdAt)}`
                            : "—"}
                        {failed ? (
                          <button
                            type="button"
                            className="outbox-retry"
                            disabled={busy}
                            onClick={() => void runDispatch()}
                          >
                            Gửi lại
                          </button>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
              <Pagination
                page={outboxPage + 1}
                totalPages={outboxTotalPages}
                totalItems={outboxTotal}
                pageSize={OUTBOX_PAGE}
                onPageChange={(p) => setOutboxPage(p - 1)}
              />
            </>
          )}
        </>
      ) : null}
    </div>
  );
}

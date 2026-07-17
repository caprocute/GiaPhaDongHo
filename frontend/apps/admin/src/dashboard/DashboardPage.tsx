import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import { useAuth } from "@giapha/auth";
import { Alert, KPICard, Panel } from "@giapha/ui";
import {
  defaultTreeSlug,
  listChangeRequests,
  listDonationCampaignsAdmin,
  reviewChangeRequest,
  type ChangeRequestDto,
  type DonationCampaignView,
} from "../api/genealogyApi";
import { ApiError, apiFetch, apiFetchPage } from "../api/http";

type Stats = {
  persons?: number;
  donationCampaigns?: number;
  events?: number;
  scholarshipApproved?: number;
  modulesEnabled?: number;
};

type Anniversary = {
  id?: number;
  lunarDay?: number;
  lunarMonth?: number;
  note?: string | null;
  person?: { code?: string; fullName?: string; generation?: number | null } | null;
};

type Audit = {
  id?: number;
  actor?: string;
  action?: string;
  entityType?: string;
  entityId?: string;
  createdAt?: string;
};

type Props = {
  onPendingChange?: (count: number) => void;
};

function greetingName(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "quản trị viên";
  const parts = trimmed.split(/\s+/);
  return parts[parts.length - 1] || trimmed;
}

function timeGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Chào buổi sáng";
  if (hour < 18) return "Chào buổi chiều";
  return "Chào buổi tối";
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

function relativeTime(iso?: string | null): string {
  if (!iso) return "—";
  const t = new Date(iso).getTime();
  if (!Number.isFinite(t)) return "—";
  const mins = Math.round((Date.now() - t) / 60_000);
  if (mins < 1) return "vừa xong";
  if (mins < 60) return `${mins} phút trước`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.round(hours / 24);
  if (days === 1) return "hôm qua";
  if (days < 7) return `${days} ngày trước`;
  return new Date(iso).toLocaleDateString("vi-VN");
}

function clockTime(iso?: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (!Number.isFinite(d.getTime())) return "";
  const ageH = (Date.now() - d.getTime()) / 3_600_000;
  if (ageH < 24) {
    return d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
  }
  return relativeTime(iso);
}

function isOverdue48h(iso?: string | null): boolean {
  if (!iso) return false;
  const t = new Date(iso).getTime();
  return Number.isFinite(t) && Date.now() - t > 48 * 3_600_000;
}

function chipFor(req: ChangeRequestDto): { label: string; kind: "add" | "mod" } {
  const type = (req.entityType ?? "").toLowerCase();
  const summary = (req.summary ?? "").toLowerCase();
  if (type.includes("person") || summary.includes("thêm") || summary.includes("con")) {
    return { label: "+1 người", kind: "add" };
  }
  if (type.includes("media") || summary.includes("ảnh")) {
    return { label: "+1 ảnh", kind: "add" };
  }
  return { label: "Sửa 1 trường", kind: "mod" };
}

function formatMillions(amount: number): string {
  if (amount >= 1_000_000) {
    const tr = amount / 1_000_000;
    return `${tr.toLocaleString("vi-VN", { maximumFractionDigits: 1 })}tr`;
  }
  return amount.toLocaleString("vi-VN");
}

function num(v: number | string | null | undefined): number {
  if (v == null) return 0;
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
}

function auditLine(a: Audit): { who: string; rest: string } {
  const actor = a.actor?.trim() || "Hệ thống";
  const action = a.action?.trim() || "thao tác";
  const entity = [a.entityType, a.entityId].filter(Boolean).join(" ");
  return {
    who: actor,
    rest: entity ? `${action} — ${entity}` : action,
  };
}

export function DashboardPage({ onPendingChange }: Props) {
  const { getAccessToken, user } = useAuth();
  const slug = defaultTreeSlug();
  const [stats, setStats] = useState<Stats | null>(null);
  const [pending, setPending] = useState<ChangeRequestDto[]>([]);
  const [pendingTotal, setPendingTotal] = useState(0);
  const [anniversaries, setAnniversaries] = useState<Anniversary[]>([]);
  const [audit, setAudit] = useState<Audit[]>([]);
  const [fund, setFund] = useState<DonationCampaignView | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  const name = useMemo(
    () => greetingName(String(user?.profile?.name ?? user?.profile?.preferred_username ?? "")),
    [user],
  );

  const initialsUser = useMemo(
    () =>
      initials(String(user?.profile?.name ?? user?.profile?.preferred_username ?? "QT")),
    [user],
  );

  const reload = useCallback(async () => {
    setError(null);
    const token = await getAccessToken().catch(() => null);
    const [dashR, reqR, anniR, auditR, campaignR] = await Promise.allSettled([
      apiFetch<Stats>(`/api/v1/system/dashboard?tree=${encodeURIComponent(slug)}`, { token }),
      listChangeRequests(slug, "pending", token, 0, 5),
      apiFetchPage<Anniversary>(
        `/api/v1/trees/${encodeURIComponent(slug)}/anniversaries?sort=lunarMonth,asc&sort=lunarDay,asc`,
        { token, page: 0, size: 8 },
      ),
      apiFetchPage<Audit>("/api/v1/system/audit-logs", { token, page: 0, size: 6 }),
      listDonationCampaignsAdmin(slug, token, 0, 5),
    ]);
    if (dashR.status === "fulfilled") setStats(dashR.value);
    if (reqR.status === "fulfilled") {
      setPending(reqR.value.content);
      setPendingTotal(reqR.value.totalElements);
      onPendingChange?.(reqR.value.totalElements);
    }
    if (anniR.status === "fulfilled") setAnniversaries(anniR.value.content);
    if (auditR.status === "fulfilled") setAudit(auditR.value.content);
    if (campaignR.status === "fulfilled") setFund(campaignR.value.content[0] ?? null);
    const allFailed = [dashR, reqR, anniR, auditR].every((r) => r.status === "rejected");
    if (allFailed) setError("Không kết nối được máy chủ. Thử lại sau.");
  }, [getAccessToken, onPendingChange, slug]);

  useEffect(() => {
    void reload();
  }, [reload]);

  async function review(id: number, action: "approve" | "reject") {
    setBusyId(id);
    setError(null);
    try {
      const token = await getAccessToken();
      await reviewChangeRequest(slug, id, action, undefined, token);
      await reload();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Duyệt thất bại.");
    } finally {
      setBusyId(null);
    }
  }

  const overdue = pending.filter((r) => isOverdue48h(r.createdAt)).length;
  const nearest = anniversaries[0];
  const raised = num(fund?.campaign.raisedAmount);
  const goal = num(fund?.campaign.goalAmount);
  const fundPct = goal > 0 ? Math.round((raised / goal) * 100) : null;

  return (
    <div className="admin-stack" style={{ gap: 20 }}>
      <div className="crm-top">
        <h2>
          {timeGreeting()}, {name}
        </h2>
        <div className="crm-cmdk" role="search">
          <Search size={15} strokeWidth={2.25} aria-hidden style={{ color: "var(--color-heritage-deep)", flex: "none" }} />
          <span>Tìm người, bài viết, thao tác…</span>
          <kbd>⌘K</kbd>
        </div>
        <div className="crm-avatar" aria-hidden>
          {initialsUser}
        </div>
      </div>

      {error ? (
        <Alert title="Lỗi" variant="error">
          {error}
        </Alert>
      ) : null}

      <div className="crm-kpis">
        <KPICard
          label="Thành viên trong phả"
          value={stats?.persons != null ? stats.persons.toLocaleString("vi-VN") : "—"}
          delta={stats ? `${stats.events ?? 0} sự kiện · ${stats.modulesEnabled ?? 0} module` : "Đang tải…"}
          trend="up"
        />
        <KPICard
          label="Chờ duyệt"
          value={pendingTotal}
          delta={
            overdue > 0
              ? `${overdue} tự khai quá 48 giờ`
              : pendingTotal > 0
                ? "Trong hạn xử lý"
                : "Hàng đợi trống"
          }
          trend={overdue > 0 ? "neutral" : "up"}
        />
        <KPICard
          label="Giỗ trong danh sách"
          value={anniversaries.length > 0 ? anniversaries.length : "—"}
          delta={
            nearest
              ? `Gần nhất: ${String(nearest.lunarDay).padStart(2, "0")}/${nearest.lunarMonth} ÂL`
              : "Chưa có ngày giỗ"
          }
        />
        <KPICard
          label={fund?.campaign.title || "Quỹ công đức"}
          value={fund ? formatMillions(raised) : "—"}
          delta={
            fund && goal > 0 && fundPct != null
              ? `${fundPct}% mục tiêu ${formatMillions(goal)}`
              : fund
                ? "Chưa đặt mục tiêu"
                : "Chưa có chiến dịch"
          }
          trend="up"
        />
      </div>

      <div className="crm-cols">
        <Panel
          title="Tự khai của con cháu — chờ duyệt"
          action={
            <Link className="crm-panel-link" to="/moderation">
              Mở hàng đợi →
            </Link>
          }
        >
          {pending.length === 0 ? (
            <div className="crm-empty">Không có tự khai đang chờ duyệt.</div>
          ) : (
            pending.map((req) => {
              const chip = chipFor(req);
              const who =
                req.person?.fullName ||
                req.requesterUserId ||
                req.summary ||
                `Yêu cầu #${req.id}`;
              const detail = req.summary || req.entityType || "Cập nhật hồ sơ";
              return (
                <div key={req.id} className="crm-req">
                  <div className="crm-avatar" aria-hidden>
                    {initials(who)}
                  </div>
                  <div className="crm-req-who">
                    <b>{who}</b> {detail !== who ? detail : null}
                    <small>
                      {req.person?.code ? `Mã ${req.person.code} · ` : null}
                      gửi {relativeTime(req.createdAt)}
                    </small>
                  </div>
                  <span className={`crm-chip crm-chip-${chip.kind}`}>{chip.label}</span>
                  <div className="crm-req-acts">
                    <button
                      type="button"
                      className="crm-btn-ok"
                      disabled={busyId === req.id || req.id == null}
                      onClick={() => req.id != null && void review(req.id, "approve")}
                    >
                      Duyệt
                    </button>
                    <button
                      type="button"
                      className="crm-btn-no"
                      disabled={busyId === req.id || req.id == null}
                      onClick={() => req.id != null && void review(req.id, "reject")}
                    >
                      Từ chối
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </Panel>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Panel
            title="Giỗ sắp tới"
            action={
              <Link className="crm-panel-link" to="/notifications">
                Cấu hình nhắc →
              </Link>
            }
          >
            {anniversaries.length === 0 ? (
              <div className="crm-empty">Chưa có ngày giỗ trong hệ thống.</div>
            ) : (
              anniversaries.slice(0, 3).map((a) => (
                <div key={a.id ?? `${a.lunarMonth}-${a.lunarDay}-${a.person?.code}`} className="crm-gio-row">
                  <span className="crm-cal">
                    <span className="crm-cal-mm">TH.{a.lunarMonth} ÂL</span>
                    <span className="crm-cal-dd">
                      {String(a.lunarDay ?? "").padStart(2, "0")}
                    </span>
                  </span>
                  <div>
                    {a.person?.fullName || "—"}
                    {a.person?.generation != null ? ` — đời ${a.person.generation}` : null}
                    <small>{a.note || (a.person?.code ? `Mã ${a.person.code}` : "Ngày giỗ âm lịch")}</small>
                  </div>
                  <span className="crm-gio-tag">Nhắc</span>
                </div>
              ))
            )}
          </Panel>

          <Panel title="Hoạt động gần đây">
            {audit.length === 0 ? (
              <div className="crm-empty">Chưa có nhật ký gần đây.</div>
            ) : (
              <ul className="crm-audit">
                {audit.map((a) => {
                  const line = auditLine(a);
                  return (
                    <li key={a.id ?? `${a.createdAt}-${line.who}`}>
                      <b>{line.who}</b> {line.rest}
                      <span className="crm-audit-t">{clockTime(a.createdAt)}</span>
                    </li>
                  );
                })}
              </ul>
            )}
          </Panel>
        </div>
      </div>
    </div>
  );
}

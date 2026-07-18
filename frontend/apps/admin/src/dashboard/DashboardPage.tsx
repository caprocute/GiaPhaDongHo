import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Bell,
  CalendarPlus,
  FilePlus2,
  HandCoins,
  Search,
  UserPlus,
  Users,
} from "lucide-react";
import { useAuth } from "@giapha/auth";
import { convertLunarToSolar } from "@giapha/lunar";
import { Alert, Panel } from "@giapha/ui";
import {
  defaultTreeSlug,
  listChangeRequests,
  listDonationCampaignsAdmin,
  listTreePersons,
  reviewChangeRequest,
  type ChangeRequestDto,
  type DonationCampaignView,
} from "../api/genealogyApi";
import { listCmsPosts } from "../api/cmsApi";
import { ApiError, apiFetch, apiFetchPage } from "../api/http";

type Stats = {
  persons?: number;
  donationCampaigns?: number;
  events?: number;
  scholarshipApproved?: number;
  modulesEnabled?: number;
  anniversariesThisLunarMonth?: number;
  currentLunarMonth?: number;
  currentLunarDay?: number;
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

type SearchHit = {
  kind: "person" | "post";
  title: string;
  meta: string;
  to: string;
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

function daysUntilLunar(day?: number | null, month?: number | null): number | null {
  if (day == null || month == null) return null;
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  let best: number | null = null;
  for (const year of [today.getFullYear(), today.getFullYear() + 1]) {
    const solar = convertLunarToSolar(day, month, year, false);
    if (Number.isNaN(solar.day)) continue;
    const target = new Date(solar.year, solar.month - 1, solar.day);
    const diff = Math.round((target.getTime() - start.getTime()) / 86_400_000);
    if (diff >= 0 && (best == null || diff < best)) best = diff;
  }
  return best;
}

function auditKind(action?: string | null): "create" | "update" | "delete" | "other" {
  const a = (action ?? "").toLowerCase();
  if (a.includes("create") || a.includes("tạo") || a.includes("add")) return "create";
  if (a.includes("delete") || a.includes("xóa") || a.includes("remove")) return "delete";
  if (a.includes("update") || a.includes("sửa") || a.includes("patch")) return "update";
  return "other";
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

const QUICK = [
  { to: "/persons/new", label: "Thêm người", Icon: UserPlus },
  { to: "/posts/new", label: "Viết bài", Icon: FilePlus2 },
  { to: "/moderation", label: "Duyệt tự khai", Icon: Users },
  { to: "/events", label: "Sự kiện", Icon: CalendarPlus },
  { to: "/donation", label: "Quỹ công đức", Icon: HandCoins },
  { to: "/notifications", label: "Gửi nhắc giỗ", Icon: Bell },
] as const;

export function DashboardPage({ onPendingChange }: Props) {
  const { getAccessToken, user } = useAuth();
  const navigate = useNavigate();
  const slug = defaultTreeSlug();
  const searchRef = useRef<HTMLDivElement>(null);

  const [stats, setStats] = useState<Stats | null>(null);
  const [pending, setPending] = useState<ChangeRequestDto[]>([]);
  const [pendingTotal, setPendingTotal] = useState(0);
  const [anniversaries, setAnniversaries] = useState<Anniversary[]>([]);
  const [audit, setAudit] = useState<Audit[]>([]);
  const [fund, setFund] = useState<DonationCampaignView | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQ, setSearchQ] = useState("");
  const [searchHits, setSearchHits] = useState<SearchHit[]>([]);
  const [searchBusy, setSearchBusy] = useState(false);

  const name = useMemo(
    () => greetingName(String(user?.profile?.name ?? user?.profile?.preferred_username ?? "")),
    [user],
  );
  const initialsUser = useMemo(
    () => initials(String(user?.profile?.name ?? user?.profile?.preferred_username ?? "QT")),
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
    if ([dashR, reqR, anniR, auditR].every((r) => r.status === "rejected")) {
      setError("Không kết nối được máy chủ. Thử lại sau.");
    }
  }, [getAccessToken, onPendingChange, slug]);

  useEffect(() => {
    void reload();
  }, [reload]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(true);
        searchRef.current?.querySelector("input")?.focus();
      }
      if (e.key === "Escape") setSearchOpen(false);
    }
    function onClick(e: MouseEvent) {
      if (!searchRef.current?.contains(e.target as Node)) setSearchOpen(false);
    }
    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onClick);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onClick);
    };
  }, []);

  useEffect(() => {
    const q = searchQ.trim();
    if (!searchOpen || q.length < 2) {
      setSearchHits([]);
      return;
    }
    const t = window.setTimeout(() => {
      void (async () => {
        setSearchBusy(true);
        try {
          const token = await getAccessToken();
          const [persons, posts] = await Promise.all([
            listTreePersons(slug, token, q, 0, 5),
            listCmsPosts(token, 0, 8),
          ]);
          const qLower = q.toLowerCase();
          const personHits: SearchHit[] = persons.content.map((p) => ({
            kind: "person",
            title: p.fullName ?? "—",
            meta: [p.code, p.generation != null ? `Đời ${p.generation}` : null]
              .filter(Boolean)
              .join(" · "),
            to: `/persons/${encodeURIComponent(p.code ?? "")}`,
          }));
          const postHits: SearchHit[] = posts.content
            .filter(
              (p) =>
                (p.title ?? "").toLowerCase().includes(qLower) ||
                (p.slug ?? "").toLowerCase().includes(qLower),
            )
            .slice(0, 5)
            .map((p) => ({
              kind: "post",
              title: p.title ?? "—",
              meta: p.status === "published" ? "Đã xuất bản" : "Nháp / lưu trữ",
              to: `/posts/${p.id}`,
            }));
          setSearchHits([...personHits, ...postHits]);
        } catch {
          setSearchHits([]);
        } finally {
          setSearchBusy(false);
        }
      })();
    }, 220);
    return () => window.clearTimeout(t);
  }, [getAccessToken, searchOpen, searchQ, slug]);

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
  const nearest = useMemo(() => {
    const ranked = anniversaries
      .map((a) => ({ a, days: daysUntilLunar(a.lunarDay, a.lunarMonth) }))
      .filter((x) => x.days != null)
      .sort((x, y) => (x.days ?? 99) - (y.days ?? 99));
    return ranked[0]?.a ?? anniversaries[0];
  }, [anniversaries]);
  const raised = num(fund?.campaign.raisedAmount);
  const goal = num(fund?.campaign.goalAmount);
  const fundPct = goal > 0 ? Math.min(100, Math.round((raised / goal) * 100)) : null;

  return (
    <div className="admin-stack" style={{ gap: 20 }}>
      <div className="crm-top">
        <h2>
          {timeGreeting()}, {name}
        </h2>
        <div className="crm-search" ref={searchRef}>
          <div
            className="crm-search-input"
            onClick={() => {
              setSearchOpen(true);
              searchRef.current?.querySelector("input")?.focus();
            }}
          >
            <Search size={14} aria-hidden />
            <input
              type="search"
              placeholder="Tìm người, bài viết, sự kiện…"
              value={searchQ}
              onChange={(e) => {
                setSearchQ(e.target.value);
                setSearchOpen(true);
              }}
              onFocus={() => setSearchOpen(true)}
              aria-label="Tìm nhanh"
            />
            <kbd>⌘K</kbd>
          </div>
          {searchOpen && (searchQ.trim().length >= 2 || searchBusy) ? (
            <div className="search-dropdown" role="listbox">
              {searchBusy ? (
                <div className="search-footer">Đang tìm…</div>
              ) : searchHits.length === 0 ? (
                <div className="search-footer">Không có kết quả phù hợp</div>
              ) : (
                <>
                  {searchHits.some((h) => h.kind === "person") ? (
                    <div className="search-group-hd">Thành viên</div>
                  ) : null}
                  {searchHits
                    .filter((h) => h.kind === "person")
                    .map((h) => (
                      <button
                        key={h.to}
                        type="button"
                        className="search-result"
                        onClick={() => {
                          setSearchOpen(false);
                          navigate(h.to);
                        }}
                      >
                        <span className="search-icon person" aria-hidden>
                          👤
                        </span>
                        <span className="search-result-text">
                          <span className="search-result-title">{h.title}</span>
                          <span className="search-result-meta">{h.meta}</span>
                        </span>
                        <span className="search-result-type">Người</span>
                      </button>
                    ))}
                  {searchHits.some((h) => h.kind === "post") ? (
                    <div className="search-group-hd">Bài viết</div>
                  ) : null}
                  {searchHits
                    .filter((h) => h.kind === "post")
                    .map((h) => (
                      <button
                        key={h.to}
                        type="button"
                        className="search-result"
                        onClick={() => {
                          setSearchOpen(false);
                          navigate(h.to);
                        }}
                      >
                        <span className="search-icon post" aria-hidden>
                          📰
                        </span>
                        <span className="search-result-text">
                          <span className="search-result-title">{h.title}</span>
                          <span className="search-result-meta">{h.meta}</span>
                        </span>
                        <span className="search-result-type">Bài</span>
                      </button>
                    ))}
                  <button
                    type="button"
                    className="search-footer"
                    onClick={() => {
                      setSearchOpen(false);
                      navigate(`/persons?q=${encodeURIComponent(searchQ.trim())}`);
                    }}
                  >
                    Xem tất cả kết quả →
                  </button>
                </>
              )}
            </div>
          ) : null}
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
        <div className="kpi kpi-ok">
          <div className="kpi-lbl">Thành viên trong phả</div>
          <div className="kpi-val">
            {stats?.persons != null ? stats.persons.toLocaleString("vi-VN") : "—"}
          </div>
          <div className="kpi-delta">
            <span className="kpi-up">{stats?.events ?? 0} sự kiện</span>
            {" · "}
            {stats?.modulesEnabled ?? 0} module đang bật
          </div>
          <Link className="kpi-link" to="/persons">
            Xem danh sách →
          </Link>
        </div>
        <div className="kpi kpi-warn">
          <div className="kpi-lbl">Chờ duyệt</div>
          <div className="kpi-val">{pendingTotal}</div>
          <div className="kpi-delta">
            {overdue > 0 ? (
              <span className="kpi-dn">⚠ {overdue} tự khai quá 48 giờ</span>
            ) : pendingTotal > 0 ? (
              "Trong hạn xử lý"
            ) : (
              "Hàng đợi trống"
            )}
          </div>
          <Link className="kpi-link" to="/moderation">
            Mở hàng đợi →
          </Link>
        </div>
        <div className="kpi kpi-info">
          <div className="kpi-lbl">Giỗ tháng này</div>
          <div className="kpi-val">
            {stats?.anniversariesThisLunarMonth != null
              ? stats.anniversariesThisLunarMonth.toLocaleString("vi-VN")
              : "—"}
          </div>
          <div className="kpi-delta">
            {nearest
              ? `Gần nhất: ${String(nearest.lunarDay).padStart(2, "0")}/${nearest.lunarMonth} ÂL — ${nearest.person?.fullName ?? ""}`
              : stats?.currentLunarMonth != null
                ? `Đang ở tháng ${stats.currentLunarMonth} ÂL`
                : "Chưa có ngày giỗ"}
          </div>
          <Link className="kpi-link" to="/notifications">
            Xem lịch giỗ →
          </Link>
        </div>
        <div className="kpi kpi-gold">
          <div className="kpi-lbl">{fund?.campaign.title || "Quỹ công đức"}</div>
          <div className="kpi-val">{fund ? formatMillions(raised) : "—"}</div>
          <div className="kpi-delta">
            {fund && goal > 0 && fundPct != null
              ? `${fundPct}% mục tiêu ${formatMillions(goal)}`
              : fund
                ? "Chưa đặt mục tiêu"
                : "Chưa có chiến dịch"}
          </div>
          {fundPct != null ? (
            <div className="kpi-progress" aria-hidden>
              <div className="kpi-progress-bar" style={{ width: `${fundPct}%` }} />
            </div>
          ) : null}
          <Link className="kpi-link" to="/donation">
            Mở quỹ →
          </Link>
        </div>
      </div>

      <div className="quick-grid">
        {QUICK.map(({ to, label, Icon }) => (
          <Link key={to} to={to} className="quick-act">
            <span className="quick-act-icon" aria-hidden>
              <Icon size={20} />
            </span>
            <span className="quick-act-label">{label}</span>
          </Link>
        ))}
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
            <>
              {pending.map((req) => {
                const chip = chipFor(req);
                const who =
                  req.person?.fullName ||
                  req.requesterUserId ||
                  req.summary ||
                  `Yêu cầu #${req.id}`;
                const detail = req.summary || req.entityType || "Cập nhật hồ sơ";
                const overdueReq = isOverdue48h(req.createdAt);
                return (
                  <div key={req.id} className="crm-req">
                    <div className={`crm-req-avatar${overdueReq ? " overdue" : ""}`} aria-hidden>
                      {initials(who)}
                    </div>
                    <div className="crm-req-who">
                      <b>{who}</b>
                      <span className="detail">{detail !== who ? detail : null}</span>
                      <small className={overdueReq ? "ov" : undefined}>
                        {req.person?.code ? `Mã ${req.person.code} · ` : null}
                        {overdueReq ? "Quá 48 giờ · " : null}
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
              })}
              {pendingTotal > pending.length ? (
                <div className="panel-footer-link">
                  <Link to="/moderation">Xem tất cả {pendingTotal} yêu cầu →</Link>
                </div>
              ) : null}
            </>
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
              anniversaries.slice(0, 4).map((a) => {
                const days = daysUntilLunar(a.lunarDay, a.lunarMonth);
                const near = days != null && days <= 3;
                return (
                  <div
                    key={a.id ?? `${a.lunarMonth}-${a.lunarDay}-${a.person?.code}`}
                    className="crm-gio-row"
                  >
                    <span className="crm-cal">
                      <span className="crm-cal-mm">TH.{a.lunarMonth} ÂL</span>
                      <span className="crm-cal-dd">
                        {String(a.lunarDay ?? "").padStart(2, "0")}
                      </span>
                    </span>
                    <div className="crm-gio-info">
                      <b>{a.person?.fullName || "—"}</b>
                      <small>
                        {a.person?.generation != null ? `Đời ${a.person.generation}` : null}
                        {a.person?.code ? ` · Mã ${a.person.code}` : null}
                        {days != null ? ` · còn ${days} ngày` : null}
                      </small>
                    </div>
                    <span className={`crm-gio-tag${near ? "" : " sent"}`}>
                      {near ? "Chưa nhắc" : "Đã nhắc"}
                    </span>
                  </div>
                );
              })
            )}
          </Panel>

          <Panel
            title="Hoạt động gần đây"
            action={
              <Link className="crm-panel-link" to="/system">
                Nhật ký →
              </Link>
            }
          >
            {audit.length === 0 ? (
              <div className="crm-empty">Chưa có nhật ký gần đây.</div>
            ) : (
              <ul className="crm-audit">
                {audit.map((a) => {
                  const line = auditLine(a);
                  const kind = auditKind(a.action);
                  return (
                    <li key={a.id ?? `${a.createdAt}-${line.who}`}>
                      <span className={`audit-dot ${kind}`} aria-hidden />
                      <b>{line.who}</b>
                      <span className="action">{line.rest}</span>
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

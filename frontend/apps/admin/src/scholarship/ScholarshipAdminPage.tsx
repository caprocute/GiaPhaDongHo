import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Award,
  CheckCheck,
  Download,
  GraduationCap,
  Medal,
  Search,
} from "lucide-react";
import { useAuth } from "@giapha/auth";
import { Alert, Badge, Button, EmptyState, Input, Pagination } from "@giapha/ui";
import {
  awardScholarshipRound,
  defaultTreeSlug,
  getScholarshipStats,
  listScholarshipAdmin,
  reviewScholarshipEntry,
  type ScholarshipEntryDto,
  type ScholarshipStats,
} from "../api/genealogyApi";
import { ApiError } from "../api/http";
import { AdminPageHeader } from "../components/AdminPageHeader";

const PAGE_SIZE = 20;

const TABS = [
  { key: "nominated", label: "Chờ duyệt", tone: "warning" as const },
  { key: "approved", label: "Đã duyệt", tone: "success" as const },
  { key: "rejected", label: "Từ chối", tone: "error" as const },
  { key: "all", label: "Tất cả", tone: "neutral" as const },
];

const LEVELS = [
  { value: "", label: "Tất cả trình độ" },
  { value: "phd", label: "Tiến sĩ" },
  { value: "master", label: "Thạc sĩ" },
  { value: "university", label: "Đại học" },
  { value: "highschool", label: "THPT" },
];

const levelLabel: Record<string, string> = {
  university: "Đại học",
  highschool: "THPT",
  master: "Thạc sĩ",
  phd: "Tiến sĩ",
};

const levelTagClass: Record<string, string> = {
  phd: "sch-tag-phd",
  master: "sch-tag-master",
  university: "sch-tag-uni",
  highschool: "sch-tag-hs",
};

function toNumber(v: number | string | null | undefined): number {
  if (v == null || v === "") return 0;
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
}

function formatVndCompact(amount: number): string {
  if (amount <= 0) return "0";
  if (amount >= 1_000_000) {
    const m = amount / 1_000_000;
    return `${m.toLocaleString("vi-VN", { maximumFractionDigits: 1 })}tr`;
  }
  return amount.toLocaleString("vi-VN");
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "·";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ""}${parts[parts.length - 1]![0] ?? ""}`.toUpperCase();
}

function avatarTone(level?: string | null): string {
  switch (level) {
    case "phd":
      return "sch-avatar-phd";
    case "master":
      return "sch-avatar-master";
    case "university":
      return "sch-avatar-uni";
    case "highschool":
      return "sch-avatar-hs";
    default:
      return "";
  }
}

function statusLabel(status: string): string {
  if (status === "nominated") return "Chờ duyệt";
  if (status === "approved") return "Đã duyệt";
  if (status === "rejected") return "Từ chối";
  return status || "—";
}

export function ScholarshipAdminPage() {
  const { getAccessToken } = useAuth();
  const slug = defaultTreeSlug();

  const [tab, setTab] = useState("nominated");
  const [page, setPage] = useState(0);
  const [rows, setRows] = useState<ScholarshipEntryDto[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState<ScholarshipStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [bulkBusy, setBulkBusy] = useState(false);
  const [bulkNote, setBulkNote] = useState("");
  const [q, setQ] = useState("");
  const [level, setLevel] = useState("");
  const [year, setYear] = useState("");
  const [sort, setSort] = useState<"newest" | "level" | "name">("newest");
  const [awardAmount, setAwardAmount] = useState("2000000");

  const yearOptions = useMemo(() => {
    const now = new Date().getFullYear();
    return [now, now - 1, now - 2, now - 3];
  }, []);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    setSelected(new Set());
    try {
      const token = await getAccessToken();
      const yearNum = year ? Number(year) : undefined;
      const [list, st] = await Promise.all([
        listScholarshipAdmin(slug, token, page, PAGE_SIZE, {
          status: tab,
          level: level || undefined,
          year: yearNum != null && Number.isFinite(yearNum) ? yearNum : undefined,
          q: q.trim() || undefined,
        }),
        getScholarshipStats(slug, token),
      ]);
      let content = [...list.content];
      if (sort === "name") {
        content.sort((a, b) => (a.personName || "").localeCompare(b.personName || "", "vi"));
      } else if (sort === "level") {
        const rank: Record<string, number> = { phd: 0, master: 1, university: 2, highschool: 3 };
        content.sort(
          (a, b) => (rank[a.level || ""] ?? 9) - (rank[b.level || ""] ?? 9),
        );
      }
      setRows(content);
      setTotalElements(list.totalElements);
      setTotalPages(list.totalPages);
      setStats(st);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Không tải được đề cử khuyến học.");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [tab, page, getAccessToken, slug, level, year, q, sort]);

  useEffect(() => {
    void reload();
  }, [reload]);

  useEffect(() => {
    setPage(0);
  }, [tab, level, year, q, sort]);

  async function review(id: number, action: "approve" | "reject") {
    setError(null);
    setMsg(null);
    try {
      const token = await getAccessToken();
      await reviewScholarshipEntry(
        slug,
        id,
        action,
        {
          reviewNote: bulkNote.trim() || undefined,
          awardAmount:
            action === "approve" && awardAmount
              ? Number(awardAmount) || undefined
              : undefined,
        },
        token,
      );
      setMsg(action === "approve" ? "Đã đưa vào bảng vàng." : "Đã từ chối đề cử.");
      await reload();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Không duyệt được đề cử.");
    }
  }

  async function bulkReview(action: "approve" | "reject") {
    if (selected.size === 0) return;
    setBulkBusy(true);
    setError(null);
    setMsg(null);
    try {
      const token = await getAccessToken();
      const body = {
        reviewNote: bulkNote.trim() || undefined,
        awardAmount:
          action === "approve" && awardAmount ? Number(awardAmount) || undefined : undefined,
      };
      await Promise.all(
        [...selected].map((id) => reviewScholarshipEntry(slug, id, action, body, token)),
      );
      setSelected(new Set());
      setMsg(
        action === "approve"
          ? `Đã duyệt ${selected.size} đề cử vào bảng vàng.`
          : `Đã từ chối ${selected.size} đề cử.`,
      );
      await reload();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Duyệt hàng loạt thất bại.");
    } finally {
      setBulkBusy(false);
    }
  }

  async function runAwardRound() {
    const ids =
      selected.size > 0
        ? [...selected]
        : rows
            .filter((r) => (r.status ?? "").toLowerCase() === "nominated" && r.id != null)
            .map((r) => r.id!);
    if (ids.length === 0) {
      setError("Chọn đề cử chờ duyệt hoặc lọc tab Chờ duyệt trước khi trao học bổng.");
      return;
    }
    setBulkBusy(true);
    setError(null);
    setMsg(null);
    try {
      const token = await getAccessToken();
      const result = await awardScholarshipRound(
        slug,
        {
          entryIds: ids,
          defaultAwardAmount: awardAmount ? Number(awardAmount) || null : null,
          reviewNote: bulkNote.trim() || undefined,
          createHonorEvent: true,
          honorEventTitle: stats?.awardRoundLabel
            ? `Lễ vinh danh — ${stats.awardRoundLabel}`
            : undefined,
        },
        token,
      );
      setSelected(new Set());
      const eventHint = result.honorEventId
        ? ` Đã tạo sự kiện «${result.honorEventTitle ?? "Lễ vinh danh"}».`
        : "";
      setMsg(`Đã trao học bổng cho ${result.awardedCount} suất.${eventHint}`);
      await reload();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Không trao được học bổng đợt này.");
    } finally {
      setBulkBusy(false);
    }
  }

  function exportCsv() {
    const header = [
      "Họ tên",
      "Mã",
      "Thành tích",
      "Trình độ",
      "Năm",
      "Trường/ngành",
      "Huy chương",
      "Trạng thái",
      "Số tiền",
    ];
    const lines = rows.map((r) =>
      [
        r.personName,
        r.personCode ?? "",
        r.achievement,
        levelLabel[r.level || ""] ?? r.level ?? "",
        r.year ?? "",
        r.schoolOrField ?? "",
        r.medalNote ?? "",
        statusLabel((r.status ?? "").toLowerCase()),
        r.awardAmount ?? "",
      ]
        .map((c) => `"${String(c).replace(/"/g, '""')}"`)
        .join(","),
    );
    const blob = new Blob([[header.join(","), ...lines].join("\n")], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `khuyen-hoc-${tab}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function toggleSelect(id: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const pendingRows = rows.filter(
    (r) => (r.status ?? "").toLowerCase() === "nominated" && r.id != null,
  );
  const allSelected =
    pendingRows.length > 0 && pendingRows.every((r) => selected.has(r.id!));

  const pendingCount = stats?.pendingCount ?? 0;
  const approvedCount = stats?.approvedCount ?? 0;
  const rejectedCount = stats?.rejectedCount ?? 0;
  const awardedTotal = toNumber(stats?.awardedTotal);
  const fundRemaining = toNumber(stats?.fundRemaining);
  const advanced = stats?.advancedDegreeCount ?? 0;

  return (
    <div className="admin-stack">
      <AdminPageHeader
        title="Khuyến học & Bảng vàng"
        description="Duyệt đề cử thành tích học tập, trao học bổng từ quỹ tộc và lưu danh bảng vàng — đồng bộ cổng thông tin."
        actions={
          <>
            <Button type="button" variant="secondary" onClick={exportCsv} disabled={rows.length === 0}>
              <Download size={15} aria-hidden /> Xuất danh sách
            </Button>
            <Button type="button" onClick={() => void runAwardRound()} disabled={bulkBusy}>
              <Medal size={15} aria-hidden /> Trao học bổng
            </Button>
          </>
        }
      />

      {error ? (
        <Alert title="Cần xử lý" variant="error">
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
          <div className="stat-lbl">Chờ duyệt</div>
          <div className="stat-val stat-val-warn">{pendingCount.toLocaleString("vi-VN")}</div>
          <div className="stat-sub">Đề cử từ cổng thông tin</div>
        </div>
        <div className="stat">
          <div className="stat-lbl">Đã vào Bảng vàng</div>
          <div className="stat-val stat-val-ok">{approvedCount.toLocaleString("vi-VN")}</div>
          <div className="stat-sub">Công bố công khai</div>
        </div>
        <div className="stat">
          <div className="stat-lbl">Học bổng đã trao</div>
          <div className="stat-val stat-val-gold">{formatVndCompact(awardedTotal)}</div>
          <div className="stat-sub">Tổng suất đã ghi nhận</div>
        </div>
        <div className="stat">
          <div className="stat-lbl">Tiến sĩ · Thạc sĩ</div>
          <div className="stat-val">{advanced.toLocaleString("vi-VN")}</div>
          <div className="stat-sub">Trên bảng vàng</div>
        </div>
      </div>

      <div className="award-banner">
        <div className="award-banner-ico" aria-hidden>
          <Award size={28} />
        </div>
        <div className="award-banner-text">
          <h3>
            Trao học bổng tộc
            {stats?.awardRoundLabel ? ` — ${stats.awardRoundLabel}` : ""}
          </h3>
          <p>
            {stats?.fundTitle ? (
              <>
                Quỹ «{stats.fundTitle}» còn{" "}
                <strong>{formatVndCompact(fundRemaining)} đồng</strong>
                {approvedCount > 0 ? ` · Đã duyệt ${approvedCount} suất` : null}
              </>
            ) : (
              <>
                Chưa gắn quỹ khuyến học — tạo chiến dịch có tên chứa «khuyến học» hoặc «học bổng» tại{" "}
                <Link to="/donation">Công đức</Link> để theo dõi số dư.
              </>
            )}
          </p>
        </div>
        <div className="award-banner-acts">
          {stats?.fundCampaignId != null ? (
            <Link to="/donation">
              <Button type="button" variant="secondary">
                Xem quỹ
              </Button>
            </Link>
          ) : null}
          <Button type="button" onClick={() => void runAwardRound()} disabled={bulkBusy || pendingCount === 0}>
            Trao học bổng đợt này
          </Button>
        </div>
      </div>

      <div className="mod-tabs" role="tablist">
        {TABS.map((t) => {
          const count =
            t.key === "nominated"
              ? pendingCount
              : t.key === "approved"
                ? approvedCount
                : t.key === "rejected"
                  ? rejectedCount
                  : stats?.totalCount;
          return (
            <button
              key={t.key}
              role="tab"
              type="button"
              aria-selected={tab === t.key}
              className={`mod-tab${tab === t.key ? " mod-tab-on" : ""}`}
              onClick={() => setTab(t.key)}
            >
              {t.key === "nominated" ? (
                <Award size={14} aria-hidden />
              ) : t.key === "approved" ? (
                <GraduationCap size={14} aria-hidden />
              ) : null}
              {t.label}
              {count != null && count > 0 ? (
                <span className={`mod-tab-badge mod-tab-badge-${t.tone}`}>{count}</span>
              ) : null}
            </button>
          );
        })}
      </div>

      <div className="filter-bar sch-filter-bar">
        <label className="fi-search">
          <Search size={14} aria-hidden />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Tìm tên học sinh…"
            aria-label="Tìm tên học sinh"
          />
        </label>
        <select
          className="fi"
          value={level}
          onChange={(e) => setLevel(e.target.value)}
          aria-label="Lọc trình độ"
        >
          {LEVELS.map((l) => (
            <option key={l.value || "all"} value={l.value}>
              {l.label}
            </option>
          ))}
        </select>
        <select
          className="fi"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          aria-label="Lọc năm"
        >
          <option value="">Tất cả năm</option>
          {yearOptions.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
        <select
          className="fi"
          value={sort}
          onChange={(e) => setSort(e.target.value as typeof sort)}
          aria-label="Sắp xếp"
        >
          <option value="newest">Xếp theo: Mới nhất</option>
          <option value="level">Xếp theo: Trình độ cao nhất</option>
          <option value="name">Xếp theo: Tên A-Z</option>
        </select>
        <Input
          className="fi sch-award-input"
          value={awardAmount}
          onChange={(e) => setAwardAmount(e.target.value)}
          inputMode="numeric"
          aria-label="Số tiền học bổng mặc định (đồng)"
          placeholder="Số tiền suất (đồng)"
        />
      </div>

      {tab === "nominated" && rows.length > 0 ? (
        <div className="bulk-bar">
          <label className="bulk-chk">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={() => {
                const ids = pendingRows.map((r) => r.id!);
                if (allSelected) setSelected(new Set());
                else setSelected(new Set(ids));
              }}
            />
            {selected.size > 0
              ? `Đã chọn ${selected.size} trong ${pendingRows.length}`
              : "Chọn tất cả chờ duyệt"}
          </label>
          <Input
            className="bulk-note"
            value={bulkNote}
            onChange={(e) => setBulkNote(e.target.value)}
            placeholder="Ghi chú duyệt hàng loạt (tuỳ chọn)…"
            aria-label="Ghi chú duyệt hàng loạt"
          />
          {selected.size > 0 ? (
            <div className="bulk-acts">
              <Button type="button" disabled={bulkBusy} onClick={() => void bulkReview("approve")}>
                <CheckCheck size={15} aria-hidden /> Duyệt {selected.size}
              </Button>
              <Button
                type="button"
                variant="secondary"
                disabled={bulkBusy}
                onClick={() => void bulkReview("reject")}
              >
                Từ chối {selected.size}
              </Button>
            </div>
          ) : null}
        </div>
      ) : null}

      {loading ? (
        <p className="admin-loading">Đang tải…</p>
      ) : rows.length === 0 ? (
        <EmptyState
          title="Chưa có đề cử"
          description="Chưa có đề cử khuyến học khớp bộ lọc. Thành viên gửi đề cử từ trang Khuyến học trên cổng thông tin."
        />
      ) : (
        <>
          <div className="sch-grid">
            {rows.map((r) => {
              const status = (r.status ?? "").toLowerCase();
              const isPending = status === "nominated";
              const isSelected = r.id != null && selected.has(r.id);
              const personCode = r.personCode || r.person?.code;
              return (
                <article
                  key={r.id}
                  className={`sch-card${isSelected ? " sch-card-selected" : ""}${
                    status === "approved" ? " sch-card-done" : ""
                  }`}
                >
                  <div className="sch-top">
                    {isPending ? (
                      <input
                        type="checkbox"
                        className="sch-check"
                        checked={isSelected}
                        onChange={() => r.id != null && toggleSelect(r.id)}
                        aria-label={`Chọn ${r.personName}`}
                      />
                    ) : (
                      <span className="sch-check-spacer" />
                    )}
                    <div className={`sch-avatar ${avatarTone(r.level)}`} aria-hidden>
                      {initials(r.personName || "?")}
                    </div>
                    <div className="sch-info">
                      <div className="sch-name">
                        {r.personName ?? "—"}
                        {r.personCode ? <span className="sch-code">{r.personCode}</span> : null}
                      </div>
                      {r.lineageNote ? <div className="sch-meta">{r.lineageNote}</div> : null}
                    </div>
                    <Badge
                      tone={
                        status === "approved"
                          ? "success"
                          : status === "rejected"
                            ? "error"
                            : "warning"
                      }
                    >
                      {statusLabel(status)}
                    </Badge>
                  </div>
                  <div className="sch-body">
                    <div className="sch-achieve">{r.achievement ?? "—"}</div>
                    <div className="sch-tags">
                      {r.level ? (
                        <span className={`sch-tag ${levelTagClass[r.level] ?? ""}`}>
                          {levelLabel[r.level] ?? r.level}
                        </span>
                      ) : null}
                      {r.year != null ? <span className="sch-tag sch-tag-year">Năm {r.year}</span> : null}
                      {r.schoolOrField ? (
                        <span className="sch-tag sch-tag-school">{r.schoolOrField}</span>
                      ) : null}
                    </div>
                    {r.medalNote ? (
                      <div className="sch-medal">
                        <Medal size={14} aria-hidden />
                        <span>{r.medalNote}</span>
                      </div>
                    ) : null}
                    {r.awardAmount != null && toNumber(r.awardAmount) > 0 ? (
                      <div className="sch-medal">
                        <GraduationCap size={14} aria-hidden />
                        <span>Học bổng {formatVndCompact(toNumber(r.awardAmount))} đồng</span>
                      </div>
                    ) : null}
                    {r.reviewNote ? (
                      <div className="sch-review-note">Ghi chú: {r.reviewNote}</div>
                    ) : null}
                  </div>
                  <div className="sch-acts">
                    {isPending && r.id != null ? (
                      <>
                        <Button type="button" onClick={() => void review(r.id!, "approve")}>
                          Vào Bảng vàng
                        </Button>
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() => void review(r.id!, "reject")}
                        >
                          Từ chối
                        </Button>
                      </>
                    ) : null}
                    {personCode ? (
                      <Link to={`/persons/${encodeURIComponent(personCode)}`}>
                        <Button type="button" variant="secondary">
                          Xem hồ sơ
                        </Button>
                      </Link>
                    ) : null}
                  </div>
                </article>
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

import { useCallback, useEffect, useId, useMemo, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import {
  Award,
  CheckCheck,
  Download,
  GraduationCap,
  Medal,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { useAuth } from "@giapha/auth";
import {
  Alert,
  Badge,
  Button,
  Dialog,
  EmptyState,
  FormField,
  Input,
  Pagination,
  Textarea,
} from "@giapha/ui";
import {
  awardScholarshipRound,
  defaultTreeSlug,
  deleteScholarshipAdmin,
  getScholarshipStats,
  listScholarshipAdmin,
  reviewScholarshipEntry,
  upsertScholarshipAdmin,
  type ScholarshipEntryDto,
  type ScholarshipStats,
} from "../api/genealogyApi";
import { ApiError } from "../api/http";
import { AdminPageHeader } from "../components/AdminPageHeader";

const PAGE_SIZE = 20;

const TABS = [
  { key: "nominated", label: "Chờ duyệt", tone: "warning" as const },
  { key: "approved", label: "Bảng vàng", tone: "success" as const },
  { key: "awaiting_award", label: "Chờ trao tiền", tone: "warning" as const },
  { key: "rejected", label: "Từ chối", tone: "error" as const },
  { key: "all", label: "Tất cả", tone: "neutral" as const },
];

const LEVEL_OPTIONS = [
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

type EntryForm = {
  id?: number;
  personName: string;
  personCode: string;
  achievement: string;
  year: string;
  level: string;
  schoolOrField: string;
  medalNote: string;
  lineageNote: string;
  publishNow: boolean;
};

function emptyForm(): EntryForm {
  return {
    personName: "",
    personCode: "",
    achievement: "",
    year: String(new Date().getFullYear()),
    level: "university",
    schoolOrField: "",
    medalNote: "",
    lineageNote: "",
    publishNow: false,
  };
}

function formFromEntry(e: ScholarshipEntryDto): EntryForm {
  return {
    id: e.id,
    personName: e.personName ?? "",
    personCode: e.personCode ?? "",
    achievement: e.achievement ?? "",
    year: e.year != null ? String(e.year) : String(new Date().getFullYear()),
    level: e.level ?? "university",
    schoolOrField: e.schoolOrField ?? "",
    medalNote: e.medalNote ?? "",
    lineageNote: e.lineageNote ?? "",
    publishNow: (e.status ?? "").toLowerCase() === "approved",
  };
}

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

function formatVnd(amount: number): string {
  return `${amount.toLocaleString("vi-VN")} đồng`;
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
  if (status === "approved") return "Bảng vàng";
  if (status === "rejected") return "Từ chối";
  return status || "—";
}

function hasAward(r: ScholarshipEntryDto): boolean {
  return toNumber(r.awardAmount) > 0;
}

export function ScholarshipAdminPage() {
  const { getAccessToken } = useAuth();
  const slug = defaultTreeSlug();
  const formId = useId().replace(/:/g, "");

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

  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<EntryForm>(emptyForm);
  const [formBusy, setFormBusy] = useState(false);
  const [formErr, setFormErr] = useState<string | null>(null);

  const [awardOpen, setAwardOpen] = useState(false);
  const [awardAmount, setAwardAmount] = useState("2000000");
  const [awardNote, setAwardNote] = useState("");
  const [createEvent, setCreateEvent] = useState(true);

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
        content.sort((a, b) => (rank[a.level || ""] ?? 9) - (rank[b.level || ""] ?? 9));
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
        { reviewNote: bulkNote.trim() || undefined },
        token,
      );
      setMsg(
        action === "approve"
          ? "Đã công bố lên bảng vàng cổng thông tin. Trao tiền là bước riêng."
          : "Đã từ chối đề cử.",
      );
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
      const body = { reviewNote: bulkNote.trim() || undefined };
      await Promise.all(
        [...selected].map((id) => reviewScholarshipEntry(slug, id, action, body, token)),
      );
      setSelected(new Set());
      setMsg(
        action === "approve"
          ? `Đã đưa ${selected.size} hồ sơ vào bảng vàng.`
          : `Đã từ chối ${selected.size} đề cử.`,
      );
      await reload();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Duyệt hàng loạt thất bại.");
    } finally {
      setBulkBusy(false);
    }
  }

  function openCreate() {
    setForm(emptyForm());
    setFormErr(null);
    setFormOpen(true);
  }

  function openEdit(entry: ScholarshipEntryDto) {
    setForm(formFromEntry(entry));
    setFormErr(null);
    setFormOpen(true);
  }

  async function saveForm(e: FormEvent) {
    e.preventDefault();
    if (!form.personName.trim() || form.personName.trim().length < 2) {
      setFormErr("Nhập họ tên người được ghi danh.");
      return;
    }
    if (!form.achievement.trim() || form.achievement.trim().length < 4) {
      setFormErr("Mô tả thành tích rõ hơn.");
      return;
    }
    if (!form.level) {
      setFormErr("Chọn trình độ.");
      return;
    }
    const y = Number(form.year);
    if (!Number.isFinite(y) || y < 1950) {
      setFormErr("Năm không hợp lệ.");
      return;
    }
    setFormBusy(true);
    setFormErr(null);
    try {
      const token = await getAccessToken();
      await upsertScholarshipAdmin(
        slug,
        {
          id: form.id,
          personName: form.personName.trim(),
          achievement: form.achievement.trim(),
          year: y,
          personCode: form.personCode.trim() || null,
          level: form.level,
          schoolOrField: form.schoolOrField.trim() || null,
          medalNote: form.medalNote.trim() || null,
          lineageNote: form.lineageNote.trim() || null,
        },
        token,
        form.publishNow,
      );
      setFormOpen(false);
      setMsg(
        form.id
          ? "Đã cập nhật hồ sơ khuyến học."
          : form.publishNow
            ? "Đã thêm và công bố lên bảng vàng."
            : "Đã thêm hồ sơ — đang chờ duyệt.",
      );
      await reload();
    } catch (ex) {
      setFormErr(ex instanceof ApiError ? ex.message : "Không lưu được hồ sơ.");
    } finally {
      setFormBusy(false);
    }
  }

  async function removeEntry(id: number) {
    if (!window.confirm("Xóa hồ sơ này? Chỉ xóa được khi chưa trao học bổng.")) return;
    setError(null);
    try {
      const token = await getAccessToken();
      await deleteScholarshipAdmin(slug, id, token);
      setMsg("Đã xóa hồ sơ.");
      await reload();
    } catch (ex) {
      setError(ex instanceof ApiError ? ex.message : "Không xóa được hồ sơ.");
    }
  }

  function openAwardDialog() {
    const ids = awardCandidateIds();
    if (ids.length === 0) {
      setError(
        "Chưa có hồ sơ để trao tiền. Duyệt vào bảng vàng trước, rồi chọn tab «Chờ trao tiền» hoặc chọn các thẻ đã duyệt chưa có số tiền.",
      );
      return;
    }
    setAwardNote("");
    setAwardOpen(true);
  }

  function awardCandidateIds(): number[] {
    if (selected.size > 0) {
      return rows
        .filter(
          (r) =>
            r.id != null &&
            selected.has(r.id) &&
            (r.status ?? "").toLowerCase() === "approved" &&
            !hasAward(r),
        )
        .map((r) => r.id!);
    }
    return rows
      .filter((r) => r.id != null && (r.status ?? "").toLowerCase() === "approved" && !hasAward(r))
      .map((r) => r.id!);
  }

  async function confirmAward() {
    const ids = awardCandidateIds();
    const amount = Number(String(awardAmount).replace(/[^0-9]/g, ""));
    if (!Number.isFinite(amount) || amount <= 0) {
      setError("Nhập số tiền mỗi suất (đồng).");
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
          defaultAwardAmount: amount,
          reviewNote: awardNote.trim() || undefined,
          createHonorEvent: createEvent,
          honorEventTitle: stats?.awardRoundLabel
            ? `Lễ vinh danh — ${stats.awardRoundLabel}`
            : undefined,
        },
        token,
      );
      setSelected(new Set());
      setAwardOpen(false);
      const eventHint = result.honorEventId
        ? ` Đã tạo sự kiện «${result.honorEventTitle ?? "Lễ vinh danh"}» (mục Sự kiện).`
        : "";
      setMsg(
        `Đã ghi nhận ${result.awardedCount} suất × ${formatVnd(amount)} từ quỹ khuyến học vào hồ sơ bảng vàng.${eventHint}`,
      );
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

  const selectableRows = rows.filter((r) => {
    const st = (r.status ?? "").toLowerCase();
    if (tab === "nominated" || st === "nominated") return r.id != null && st === "nominated";
    if (tab === "awaiting_award") return r.id != null && st === "approved" && !hasAward(r);
    if (tab === "approved") return r.id != null && st === "approved" && !hasAward(r);
    return false;
  });
  const allSelected =
    selectableRows.length > 0 && selectableRows.every((r) => selected.has(r.id!));

  const pendingCount = stats?.pendingCount ?? 0;
  const approvedCount = stats?.approvedCount ?? 0;
  const rejectedCount = stats?.rejectedCount ?? 0;
  const awaitingAward = stats?.awaitingAwardCount ?? 0;
  const awardedTotal = toNumber(stats?.awardedTotal);
  const fundRemaining = toNumber(stats?.fundRemaining);
  const advanced = stats?.advancedDegreeCount ?? 0;
  const awardIdsPreview = awardCandidateIds();

  return (
    <div className="admin-stack">
      <AdminPageHeader
        title="Khuyến học & Bảng vàng"
        description="Nguồn: đề cử cổng thông tin hoặc thư ký thêm tay → duyệt vào bảng vàng → trao học bổng từ quỹ tộc."
        actions={
          <>
            <Button type="button" variant="secondary" onClick={exportCsv} disabled={rows.length === 0}>
              <Download size={15} aria-hidden /> Xuất danh sách
            </Button>
            <Button type="button" variant="secondary" onClick={openAwardDialog} disabled={bulkBusy}>
              <Medal size={15} aria-hidden /> Trao học bổng
            </Button>
            <Button type="button" onClick={openCreate}>
              <Plus size={15} aria-hidden /> Thêm hồ sơ
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

      <ol className="sch-flow" aria-label="Quy trình khuyến học">
        <li>
          <strong>1. Nguồn</strong>
          <span>Cổng đề cử hoặc Thêm hồ sơ</span>
        </li>
        <li>
          <strong>2. Duyệt</strong>
          <span>Vào bảng vàng (công bố công khai)</span>
        </li>
        <li>
          <strong>3. Trao tiền</strong>
          <span>Ghi suất từ quỹ khuyến học</span>
        </li>
        <li>
          <strong>4. Đích</strong>
          <span>Bảng vàng cổng + Sự kiện vinh danh</span>
        </li>
      </ol>

      <div className="stat-row">
        <div className="stat">
          <div className="stat-lbl">Chờ duyệt</div>
          <div className="stat-val stat-val-warn">{pendingCount.toLocaleString("vi-VN")}</div>
          <div className="stat-sub">Nguồn đề cử chưa xác minh</div>
        </div>
        <div className="stat">
          <div className="stat-lbl">Đã vào bảng vàng</div>
          <div className="stat-val stat-val-ok">{approvedCount.toLocaleString("vi-VN")}</div>
          <div className="stat-sub">Hiện trên cổng thông tin</div>
        </div>
        <div className="stat">
          <div className="stat-lbl">Học bổng đã trao</div>
          <div className="stat-val stat-val-gold">{formatVndCompact(awardedTotal)}</div>
          <div className="stat-sub">
            {awaitingAward > 0
              ? `${awaitingAward} suất chờ ghi tiền`
              : "Tổng đã ghi nhận trên hồ sơ"}
          </div>
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
            Quỹ & trao học bổng
            {stats?.awardRoundLabel ? ` — ${stats.awardRoundLabel}` : ""}
          </h3>
          <p>
            {stats?.fundTitle ? (
              <>
                Nguồn tiền: quỹ «{stats.fundTitle}» còn{" "}
                <strong>{formatVndCompact(fundRemaining)}</strong>
                {awaitingAward > 0 ? ` · ${awaitingAward} hồ sơ bảng vàng chưa ghi suất` : null}
              </>
            ) : (
              <>
                Chưa gắn quỹ — tại{" "}
                <Link to="/donation">Công đức</Link>, tạo hoặc sửa chiến dịch và chọn mục đích
                «Quỹ khuyến học».
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
          <Button
            type="button"
            onClick={openAwardDialog}
            disabled={bulkBusy || awaitingAward === 0}
          >
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
                : t.key === "awaiting_award"
                  ? awaitingAward
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
              ) : t.key === "approved" || t.key === "awaiting_award" ? (
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
          <input
            type="search"
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
          <option value="">Tất cả trình độ</option>
          {LEVEL_OPTIONS.map((l) => (
            <option key={l.value} value={l.value}>
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
      </div>

      {(tab === "nominated" || tab === "awaiting_award" || tab === "approved") &&
      selectableRows.length > 0 ? (
        <div className="bulk-bar">
          <label className="bulk-chk">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={() => {
                const ids = selectableRows.map((r) => r.id!);
                if (allSelected) setSelected(new Set());
                else setSelected(new Set(ids));
              }}
            />
            <span>
              {selected.size > 0
                ? `Đã chọn ${selected.size} / ${selectableRows.length}`
                : tab === "nominated"
                  ? "Chọn tất cả chờ duyệt"
                  : "Chọn hồ sơ chờ trao tiền"}
            </span>
          </label>
          {tab === "nominated" ? (
            <input
              className="bulk-note"
              value={bulkNote}
              onChange={(e) => setBulkNote(e.target.value)}
              placeholder="Ghi chú duyệt hàng loạt (tuỳ chọn)…"
              aria-label="Ghi chú duyệt hàng loạt"
            />
          ) : null}
          {selected.size > 0 && tab === "nominated" ? (
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
          {selected.size > 0 && tab !== "nominated" ? (
            <div className="bulk-acts">
              <Button type="button" disabled={bulkBusy} onClick={openAwardDialog}>
                <Medal size={15} aria-hidden /> Trao tiền {selected.size} suất
              </Button>
            </div>
          ) : null}
        </div>
      ) : null}

      {loading ? (
        <p className="admin-loading">Đang tải…</p>
      ) : rows.length === 0 ? (
        <EmptyState
          title="Chưa có hồ sơ"
          description="Thêm hồ sơ tại quản trị hoặc chờ đề cử từ trang Khuyến học trên cổng thông tin."
        />
      ) : (
        <>
          <div className="sch-grid">
            {rows.map((r) => {
              const status = (r.status ?? "").toLowerCase();
              const isPending = status === "nominated";
              const canSelect = selectableRows.some((x) => x.id === r.id);
              const isSelected = r.id != null && selected.has(r.id);
              const personCode = r.personCode || r.person?.code;
              const awarded = hasAward(r);
              return (
                <article
                  key={r.id}
                  className={`sch-card${isSelected ? " sch-card-selected" : ""}${
                    status === "approved" ? " sch-card-done" : ""
                  }`}
                >
                  <div className="sch-top">
                    {canSelect ? (
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
                      {status === "approved" && !awarded ? " · chờ tiền" : ""}
                    </Badge>
                  </div>
                  <div className="sch-body">
                    <div className="sch-achieve">{r.achievement ?? "—"}</div>
                    <div className="sch-tags">
                      {r.level ? (
                        <span className={`sch-tag ${levelTagClass[r.level] ?? ""}`}>
                          {levelLabel[r.level] ?? r.level}
                        </span>
                      ) : (
                        <span className="sch-tag sch-tag-year">Chưa ghi trình độ</span>
                      )}
                      {r.year != null ? (
                        <span className="sch-tag sch-tag-year">Năm {r.year}</span>
                      ) : null}
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
                    {awarded ? (
                      <div className="sch-medal">
                        <GraduationCap size={14} aria-hidden />
                        <span>Đã trao {formatVndCompact(toNumber(r.awardAmount))} đồng</span>
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
                          Vào bảng vàng
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
                    {status === "approved" && !awarded && r.id != null ? (
                      <Button
                        type="button"
                        onClick={() => {
                          setSelected(new Set([r.id!]));
                          setAwardOpen(true);
                        }}
                      >
                        Trao tiền
                      </Button>
                    ) : null}
                    <Button type="button" variant="secondary" onClick={() => openEdit(r)}>
                      <Pencil size={14} aria-hidden /> Sửa
                    </Button>
                    {r.id != null && !awarded ? (
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => void removeEntry(r.id!)}
                      >
                        <Trash2 size={14} aria-hidden />
                      </Button>
                    ) : null}
                    {personCode ? (
                      <Link to={`/persons/${encodeURIComponent(personCode)}`}>
                        <Button type="button" variant="secondary">
                          Hồ sơ
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

      <Dialog
        open={formOpen}
        title={form.id ? "Sửa hồ sơ khuyến học" : "Thêm hồ sơ khuyến học"}
        description="Thư ký có thể ghi danh trực tiếp. Chọn trình độ để lọc và thống kê Tiến sĩ · Thạc sĩ."
        onClose={() => !formBusy && setFormOpen(false)}
        size="md"
        footer={
          <div style={{ display: "flex", gap: "var(--spacing-sm)" }}>
            <Button type="submit" form={formId} disabled={formBusy}>
              {formBusy ? "Đang lưu…" : form.id ? "Cập nhật" : "Thêm hồ sơ"}
            </Button>
            <Button type="button" variant="secondary" onClick={() => setFormOpen(false)} disabled={formBusy}>
              Hủy
            </Button>
          </div>
        }
      >
        <form id={formId} className="admin-form" onSubmit={(e) => void saveForm(e)} noValidate>
          {formErr ? (
            <Alert title="Không lưu được" variant="error">
              {formErr}
            </Alert>
          ) : null}
          <FormField label="Họ tên" required htmlFor={`${formId}-name`}>
            <Input
              id={`${formId}-name`}
              value={form.personName}
              onChange={(e) => setForm((f) => ({ ...f, personName: e.target.value }))}
              autoFocus
            />
          </FormField>
          <div className="admin-form-grid">
            <FormField label="Mã trong phả" htmlFor={`${formId}-code`}>
              <Input
                id={`${formId}-code`}
                value={form.personCode}
                onChange={(e) => setForm((f) => ({ ...f, personCode: e.target.value }))}
                placeholder="A6a"
              />
            </FormField>
            <FormField label="Trình độ" required htmlFor={`${formId}-level`}>
              <select
                id={`${formId}-level`}
                className="fi"
                value={form.level}
                onChange={(e) => setForm((f) => ({ ...f, level: e.target.value }))}
              >
                {LEVEL_OPTIONS.map((l) => (
                  <option key={l.value} value={l.value}>
                    {l.label}
                  </option>
                ))}
              </select>
            </FormField>
          </div>
          <FormField label="Thành tích" required htmlFor={`${formId}-ach`}>
            <Textarea
              id={`${formId}-ach`}
              rows={3}
              value={form.achievement}
              onChange={(e) => setForm((f) => ({ ...f, achievement: e.target.value }))}
            />
          </FormField>
          <div className="admin-form-grid">
            <FormField label="Năm" required htmlFor={`${formId}-year`}>
              <Input
                id={`${formId}-year`}
                value={form.year}
                onChange={(e) => setForm((f) => ({ ...f, year: e.target.value }))}
                inputMode="numeric"
              />
            </FormField>
            <FormField label="Trường / ngành" htmlFor={`${formId}-school`}>
              <Input
                id={`${formId}-school`}
                value={form.schoolOrField}
                onChange={(e) => setForm((f) => ({ ...f, schoolOrField: e.target.value }))}
              />
            </FormField>
          </div>
          <FormField label="Giải thưởng / huy chương" htmlFor={`${formId}-medal`}>
            <Input
              id={`${formId}-medal`}
              value={form.medalNote}
              onChange={(e) => setForm((f) => ({ ...f, medalNote: e.target.value }))}
            />
          </FormField>
          <FormField label="Ghi chú quan hệ / đời" htmlFor={`${formId}-lineage`}>
            <Input
              id={`${formId}-lineage`}
              value={form.lineageNote}
              onChange={(e) => setForm((f) => ({ ...f, lineageNote: e.target.value }))}
              placeholder="Ví dụ: Đời 6 · Con Hoàng Quang Bình"
            />
          </FormField>
          <label className="sch-check-inline">
            <input
              type="checkbox"
              checked={form.publishNow}
              onChange={(e) => setForm((f) => ({ ...f, publishNow: e.target.checked }))}
            />
            <span>Công bố lên bảng vàng ngay (bỏ qua bước chờ duyệt)</span>
          </label>
        </form>
      </Dialog>

      <Dialog
        open={awardOpen}
        title="Trao học bổng từ quỹ tộc"
        description="Bước này chỉ ghi số tiền lên hồ sơ đã vào bảng vàng — không thay thế bước duyệt công bố."
        onClose={() => !bulkBusy && setAwardOpen(false)}
        size="md"
        footer={
          <div style={{ display: "flex", gap: "var(--spacing-sm)" }}>
            <Button type="button" disabled={bulkBusy || awardIdsPreview.length === 0} onClick={() => void confirmAward()}>
              {bulkBusy ? "Đang ghi…" : `Ghi nhận ${awardIdsPreview.length} suất`}
            </Button>
            <Button type="button" variant="secondary" onClick={() => setAwardOpen(false)} disabled={bulkBusy}>
              Hủy
            </Button>
          </div>
        }
      >
        <div className="admin-form">
          <p className="sch-award-explain">
            <strong>Nguồn:</strong> chiến dịch Công đức có mục đích «Quỹ khuyến học»
            {stats?.fundTitle ? ` — «${stats.fundTitle}»` : " (chưa chọn)"}.
            <br />
            <strong>Đích:</strong> cột học bổng trên hồ sơ bảng vàng + (tuỳ chọn) sự kiện lễ vinh danh.
          </p>
          <FormField label="Số tiền mỗi suất (đồng)" required htmlFor="award-amount">
            <Input
              id="award-amount"
              value={awardAmount}
              onChange={(e) => setAwardAmount(e.target.value)}
              inputMode="numeric"
              placeholder="2000000"
            />
          </FormField>
          <FormField label="Ghi chú đợt trao (tuỳ chọn)" htmlFor="award-note">
            <Textarea
              id="award-note"
              rows={2}
              value={awardNote}
              onChange={(e) => setAwardNote(e.target.value)}
              placeholder="Ví dụ: Đợt 2/2026 — trao tại nhà thờ họ"
            />
          </FormField>
          <label className="sch-check-inline">
            <input
              type="checkbox"
              checked={createEvent}
              onChange={(e) => setCreateEvent(e.target.checked)}
            />
            <span>Tạo sự kiện «Lễ vinh danh» trong mục Sự kiện</span>
          </label>
          <p className="sch-award-explain">
            Sẽ ghi nhận <strong>{awardIdsPreview.length}</strong> suất
            {awardAmount
              ? ` × ${formatVnd(Number(String(awardAmount).replace(/[^0-9]/g, "")) || 0)}`
              : null}
            .
          </p>
        </div>
      </Dialog>
    </div>
  );
}

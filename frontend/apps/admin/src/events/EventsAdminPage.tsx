import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarPlus, CheckCircle, Receipt, Users2, Wallet, XCircle } from "lucide-react";
import { useAuth } from "@giapha/auth";
import {
  Alert,
  Badge,
  Button,
  EmptyState,
  FormField,
  Input,
  Pagination,
  Select,
  Textarea,
} from "@giapha/ui";
import {
  assignEventRsvp,
  changeEventStatus,
  confirmEventExpense,
  createEventExpense,
  defaultTreeSlug,
  listClanEvents,
  listDonationCampaignsAdmin,
  listEventExpenses,
  listEventRsvps,
  rejectEventExpense,
  upsertClanEvent,
  type ClanEventExpenseDto,
  type ClanEventView,
  type DonationCampaignDto,
  type EventRsvpDto,
} from "../api/genealogyApi";
import { ApiError } from "../api/http";
import { AdminPageHeader } from "../components/AdminPageHeader";
import { fmtCurrency, fmtDateShort } from "../lib/formatters";

const PAGE_SIZE = 20;
const RSVP_PAGE = 50;
const ASSIGNMENTS = ["Ban tế", "Hậu cần", "Khánh tiết", "Tiếp tân"];

type BadgeTone = "success" | "warning" | "error" | "accent" | "default";

const EVENT_TYPE_OPTIONS = [
  { value: "ancestral_anniversary", label: "Giỗ tổ" },
  { value: "clan_meeting", label: "Họp họ" },
  { value: "scholarship_ceremony", label: "Lễ vinh danh" },
  { value: "grave_renovation", label: "Tôn tạo lăng mộ" },
  { value: "other", label: "Khác" },
];

const EVENT_TYPE_LABEL: Record<string, string> = Object.fromEntries(
  EVENT_TYPE_OPTIONS.map((o) => [o.value, o.label]),
);

const EVENT_STATUS_LABEL: Record<string, string> = {
  draft: "Nháp",
  published: "Đã công bố",
  completed: "Đã hoàn thành",
  cancelled: "Hủy",
};

const EVENT_STATUS_TONE: Record<string, BadgeTone> = {
  draft: "warning",
  published: "success",
  completed: "accent",
  cancelled: "error",
};

const EXPENSE_CATEGORY_OPTIONS = [
  { value: "catering", label: "Ẩm thực" },
  { value: "venue", label: "Địa điểm" },
  { value: "equipment", label: "Thiết bị" },
  { value: "printing", label: "In ấn" },
  { value: "transport", label: "Đi lại" },
  { value: "ritual_items", label: "Đồ lễ" },
  { value: "other", label: "Khác" },
];

const EXPENSE_CATEGORY_LABEL: Record<string, string> = Object.fromEntries(
  EXPENSE_CATEGORY_OPTIONS.map((o) => [o.value, o.label]),
);

const EXPENSE_STATUS_LABEL: Record<string, string> = {
  pending: "Chờ duyệt",
  confirmed: "Đã xác nhận",
  rejected: "Từ chối",
};

const EXPENSE_STATUS_TONE: Record<string, BadgeTone> = {
  pending: "warning",
  confirmed: "success",
  rejected: "error",
};

function num(v: number | string | null | undefined): number {
  if (v == null) return 0;
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
}

function fmtDateTime(iso?: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function parseLunarLabel(lunarJson?: string | null): string | null {
  if (!lunarJson) return null;
  try {
    const j = JSON.parse(lunarJson) as { day?: number; month?: number; leap?: boolean };
    if (j.day == null || j.month == null) return null;
    return `${String(j.day).padStart(2, "0")}/${j.month} ÂL${j.leap ? " (nhuận)" : ""}`;
  } catch {
    return null;
  }
}

function parseTasks(checklistJson?: string | null): string[] {
  if (!checklistJson) return [];
  try {
    const j = JSON.parse(checklistJson) as { tasks?: unknown };
    if (!Array.isArray(j.tasks)) return [];
    return j.tasks.map((t) => String(t)).filter(Boolean);
  } catch {
    return [];
  }
}

type EventForm = {
  id: number | null;
  title: string;
  type: string;
  status: string;
  startSolar: string;
  location: string;
  linkedCampaignId: string;
  estimatedBudget: string;
  description: string;
  tasks: string[];
};

function emptyEventForm(): EventForm {
  return {
    id: null,
    title: "",
    type: "clan_meeting",
    status: "draft",
    startSolar: "",
    location: "",
    linkedCampaignId: "",
    estimatedBudget: "",
    description: "",
    tasks: ["Ban tế", "Hậu cần", "Khánh tiết"],
  };
}

/* ── Form thêm chi phí sự kiện ── */
interface AddExpenseFormProps {
  eventId: number;
  slug: string;
  getToken: () => Promise<string | null>;
  onSaved: () => Promise<void>;
  onClose: () => void;
}

function AddExpenseForm({ eventId, slug, getToken, onSaved, onClose }: AddExpenseFormProps) {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("catering");
  const [expenseDate, setExpenseDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [paidByName, setPaidByName] = useState("");
  const [receiptRef, setReceiptRef] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!description.trim()) { setErr("Nhập mô tả khoản chi."); return; }
    const amountNum = Number(amount.replace(/[^0-9]/g, ""));
    if (!Number.isFinite(amountNum) || amountNum <= 0) { setErr("Nhập số tiền hợp lệ."); return; }
    if (!expenseDate) { setErr("Chọn ngày chi."); return; }
    if (!paidByName.trim()) { setErr("Nhập người chi."); return; }
    setBusy(true);
    setErr(null);
    try {
      const token = await getToken();
      await createEventExpense(
        slug,
        eventId,
        {
          description: description.trim(),
          amount: amountNum,
          category,
          expenseDate,
          paidByName: paidByName.trim(),
          receiptRef: receiptRef.trim() || null,
          note: note.trim() || null,
        },
        token,
      );
      setDescription(""); setAmount(""); setReceiptRef(""); setNote("");
      await onSaved();
    } catch (ex) {
      setErr(ex instanceof ApiError ? ex.message : "Ghi khoản chi thất bại.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fl-add-form">
      <div className="fl-add-form-title">Thêm khoản chi sự kiện</div>
      {err ? (
        <div className="fl-alert-gap">
          <Alert title="Lỗi" variant="error">{err}</Alert>
        </div>
      ) : null}
      <form onSubmit={handleSubmit}>
        <div className="fl-add-form-grid">
          <FormField label="Mô tả" required>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} autoFocus />
          </FormField>
          <FormField label="Số tiền (VND)" required>
            <Input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              inputMode="numeric"
              placeholder="VD: 5000000"
            />
          </FormField>
          <FormField label="Hạng mục" required>
            <Select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              options={EXPENSE_CATEGORY_OPTIONS}
            />
          </FormField>
          <FormField label="Ngày chi" required>
            <Input type="date" value={expenseDate} onChange={(e) => setExpenseDate(e.target.value)} />
          </FormField>
          <FormField label="Người chi" required>
            <Input value={paidByName} onChange={(e) => setPaidByName(e.target.value)} />
          </FormField>
          <FormField label="Số biên lai">
            <Input value={receiptRef} onChange={(e) => setReceiptRef(e.target.value)} />
          </FormField>
        </div>
        <FormField label="Ghi chú">
          <Input value={note} onChange={(e) => setNote(e.target.value)} />
        </FormField>
        <div className="fl-add-form-actions">
          <Button type="submit" disabled={busy}>
            {busy ? "Đang lưu…" : "Ghi khoản chi"}
          </Button>
          <Button type="button" variant="secondary" onClick={onClose}>Hủy</Button>
        </div>
      </form>
    </div>
  );
}

export function EventsAdminPage() {
  const { getAccessToken } = useAuth();
  const slug = defaultTreeSlug();

  const [tab, setTab] = useState("list");
  const [eventPage, setEventPage] = useState(0);
  const [events, setEvents] = useState<ClanEventView[]>([]);
  const [eventTotal, setEventTotal] = useState(0);
  const [eventTotalPages, setEventTotalPages] = useState(1);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const [campaigns, setCampaigns] = useState<DonationCampaignDto[]>([]);

  /* Chi phí đã xác nhận theo sự kiện — dùng cho card */
  const [confirmedByEvent, setConfirmedByEvent] = useState<Record<number, number>>({});

  const [rsvpPage, setRsvpPage] = useState(0);
  const [rsvps, setRsvps] = useState<EventRsvpDto[]>([]);
  const [rsvpTotal, setRsvpTotal] = useState(0);
  const [rsvpTotalPages, setRsvpTotalPages] = useState(1);
  const [rsvpQuery, setRsvpQuery] = useState("");
  const [rsvpFilter, setRsvpFilter] = useState<"all" | "unassigned">("all");

  const [expenseEventId, setExpenseEventId] = useState<number | null>(null);
  const [expenses, setExpenses] = useState<ClanEventExpenseDto[]>([]);
  const [expensePage, setExpensePage] = useState(0);
  const [expenseTotal, setExpenseTotal] = useState(0);
  const [expenseTotalPages, setExpenseTotalPages] = useState(1);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [expenseBusyId, setExpenseBusyId] = useState<number | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [form, setForm] = useState<EventForm>(emptyEventForm);
  const [taskDraft, setTaskDraft] = useState("");

  const reloadEvents = useCallback(async () => {
    setError(null);
    try {
      const token = await getAccessToken();
      const r = await listClanEvents(slug, token, eventPage, PAGE_SIZE);
      setEvents(r.content);
      setEventTotal(r.totalElements);
      setEventTotalPages(r.totalPages);
      const ids = r.content
        .map((ev) => ev.event?.id)
        .filter((id): id is number => id != null);
      const totals = await Promise.all(
        ids.map(async (id) => {
          try {
            const exp = await listEventExpenses(slug, id, token, 0, 200);
            const sum = exp.content
              .filter((x) => (x.status ?? "confirmed") === "confirmed")
              .reduce((s, x) => s + num(x.amount), 0);
            return [id, sum] as const;
          } catch {
            return [id, 0] as const;
          }
        }),
      );
      setConfirmedByEvent(Object.fromEntries(totals));
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Không tải được sự kiện.");
      setEvents([]);
    }
  }, [eventPage, getAccessToken, slug]);

  const reloadCampaigns = useCallback(async () => {
    try {
      const token = await getAccessToken();
      const r = await listDonationCampaignsAdmin(slug, token, 0, 100);
      setCampaigns(r.content.map((v) => v.campaign));
    } catch {
      setCampaigns([]);
    }
  }, [getAccessToken, slug]);

  const reloadRsvps = useCallback(async () => {
    if (selectedId == null) {
      setRsvps([]);
      return;
    }
    try {
      const token = await getAccessToken();
      const r = await listEventRsvps(slug, selectedId, token, rsvpPage, RSVP_PAGE);
      setRsvps(r.content);
      setRsvpTotal(r.totalElements);
      setRsvpTotalPages(r.totalPages);
    } catch {
      setRsvps([]);
    }
  }, [getAccessToken, rsvpPage, selectedId, slug]);

  const reloadExpenses = useCallback(async () => {
    if (expenseEventId == null) {
      setExpenses([]);
      setExpenseTotal(0);
      return;
    }
    try {
      const token = await getAccessToken();
      const r = await listEventExpenses(slug, expenseEventId, token, expensePage, 50);
      setExpenses(r.content);
      setExpenseTotal(r.totalElements);
      setExpenseTotalPages(r.totalPages);
    } catch {
      setExpenses([]);
    }
  }, [expenseEventId, expensePage, getAccessToken, slug]);

  useEffect(() => { void reloadEvents(); }, [reloadEvents]);
  useEffect(() => { void reloadCampaigns(); }, [reloadCampaigns]);
  useEffect(() => { void reloadRsvps(); }, [reloadRsvps]);
  useEffect(() => { void reloadExpenses(); }, [reloadExpenses]);
  useEffect(() => { setRsvpPage(0); }, [selectedId]);
  useEffect(() => { setExpensePage(0); setShowExpenseForm(false); }, [expenseEventId]);

  const eventCampaigns = useMemo(
    () => campaigns.filter((c) => (c.purpose ?? "").toLowerCase() === "event" && c.id != null),
    [campaigns],
  );

  const campaignTitle = useCallback(
    (id: number | null | undefined) =>
      id != null ? campaigns.find((c) => c.id === id)?.title ?? `#${id}` : null,
    [campaigns],
  );

  const kpis = useMemo(() => {
    const now = Date.now();
    const active = events.filter((e) => (e.event?.status ?? "draft") !== "cancelled");
    const upcoming = active.filter(
      (e) => e.event?.startSolar && new Date(e.event.startSolar).getTime() >= now,
    );
    const nearest = [...upcoming].sort(
      (a, b) => new Date(a.event!.startSolar!).getTime() - new Date(b.event!.startSolar!).getTime(),
    )[0];
    const draftCount = events.filter((e) => (e.event?.status ?? "draft") === "draft").length;
    const totalConfirmedExpense = Object.values(confirmedByEvent).reduce((s, v) => s + v, 0);
    return {
      upcoming: upcoming.length,
      draftCount,
      totalConfirmedExpense,
      nearestLabel: nearest?.event?.startSolar
        ? new Date(nearest.event.startSolar).toLocaleDateString("vi-VN")
        : "—",
    };
  }, [confirmedByEvent, events]);

  const filteredRsvps = useMemo(() => {
    const q = rsvpQuery.trim().toLowerCase();
    return rsvps.filter((r) => {
      if (rsvpFilter === "unassigned" && r.assignment) return false;
      if (q && !(r.householdName ?? "").toLowerCase().includes(q)) return false;
      return true;
    });
  }, [rsvpFilter, rsvpQuery, rsvps]);

  const unassignedCount = useMemo(() => rsvps.filter((r) => !r.assignment).length, [rsvps]);
  const pendingExpenseCount = useMemo(
    () => expenses.filter((x) => (x.status ?? "") === "pending").length,
    [expenses],
  );

  function resetForm() {
    setForm(emptyEventForm());
    setTaskDraft("");
  }

  function openCreate() {
    resetForm();
    setTab("new");
  }

  function openEdit(ev: ClanEventView) {
    const e = ev.event;
    let startLocal = "";
    if (e?.startSolar) {
      const d = new Date(e.startSolar);
      startLocal = new Date(d.getTime() - d.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
    }
    const parsed = parseTasks(e?.checklistJson);
    setForm({
      id: e?.id ?? null,
      title: e?.title ?? "",
      type: e?.type ?? "clan_meeting",
      status: e?.status ?? "draft",
      startSolar: startLocal,
      location: e?.location ?? "",
      linkedCampaignId: e?.linkedCampaignId != null ? String(e.linkedCampaignId) : "",
      estimatedBudget: e?.estimatedBudget != null ? String(num(e.estimatedBudget)) : "",
      description: e?.description ?? "",
      tasks: parsed.length ? parsed : ["Ban tế", "Hậu cần"],
    });
    setTaskDraft("");
    setTab("new");
  }

  async function saveEvent(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setMsg(null);
    try {
      const token = await getAccessToken();
      const budgetNum = Number(form.estimatedBudget.replace(/[^0-9]/g, ""));
      await upsertClanEvent(
        slug,
        {
          id: form.id ?? undefined,
          title: form.title.trim(),
          type: form.type,
          status: form.status,
          startSolar: form.startSolar.trim() ? new Date(form.startSolar).toISOString() : null,
          location: form.location.trim() || null,
          linkedCampaignId: form.linkedCampaignId ? Number(form.linkedCampaignId) : null,
          estimatedBudget: Number.isFinite(budgetNum) && budgetNum > 0 ? budgetNum : null,
          description: form.description.trim() || null,
          checklistJson: JSON.stringify({ tasks: form.tasks.filter((t) => t.trim()) }),
        },
        token,
      );
      setMsg(form.id ? "Đã cập nhật sự kiện." : "Đã tạo sự kiện.");
      resetForm();
      setTab("list");
      await reloadEvents();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Lưu thất bại.");
    } finally {
      setBusy(false);
    }
  }

  async function changeStatus(eventId: number, status: "published" | "completed" | "cancelled") {
    setError(null);
    setMsg(null);
    try {
      const token = await getAccessToken();
      await changeEventStatus(slug, eventId, status, token);
      setMsg(
        status === "published"
          ? "Đã công bố sự kiện."
          : status === "completed"
            ? "Đã đánh dấu hoàn thành."
            : "Đã hủy sự kiện.",
      );
      await reloadEvents();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Đổi trạng thái thất bại.");
    }
  }

  async function assign(rsvpId: number, assignment: string) {
    try {
      const token = await getAccessToken();
      await assignEventRsvp(slug, rsvpId, assignment, token);
      await reloadRsvps();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Phân công thất bại.");
    }
  }

  async function handleExpenseAction(expenseId: number, action: "confirm" | "reject") {
    if (expenseEventId == null) return;
    setExpenseBusyId(expenseId);
    setError(null);
    try {
      const token = await getAccessToken();
      if (action === "confirm") await confirmEventExpense(slug, expenseEventId, expenseId, token);
      else await rejectEventExpense(slug, expenseEventId, expenseId, token);
      setMsg(action === "confirm" ? "Đã xác nhận khoản chi." : "Đã từ chối khoản chi.");
      await Promise.all([reloadExpenses(), reloadEvents()]);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Thao tác thất bại.");
    } finally {
      setExpenseBusyId(null);
    }
  }

  const selectedEvent = selectedId != null ? events.find((e) => e.event?.id === selectedId) : null;
  const expenseEvent =
    expenseEventId != null ? events.find((e) => e.event?.id === expenseEventId) : null;
  const expenseConfirmedTotal = expenses
    .filter((x) => (x.status ?? "confirmed") === "confirmed")
    .reduce((s, x) => s + num(x.amount), 0);

  const eventOptions = [
    { value: "", label: "— Chọn sự kiện —" },
    ...events.map((ev) => ({
      value: String(ev.event?.id ?? ""),
      label: ev.event?.title ?? `#${ev.event?.id}`,
    })),
  ];

  return (
    <div className="admin-stack">
      <AdminPageHeader
        title="Sự kiện dòng họ"
        description="Tổ chức họp họ, giỗ tổ — theo dõi đăng ký tham dự, chi phí tổ chức và quỹ liên kết."
        actions={
          <Button type="button" onClick={openCreate}>
            <CalendarPlus size={16} /> Tạo sự kiện
          </Button>
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
          <div className="stat-lbl">Sắp tới</div>
          <div className="stat-val">{kpis.upcoming}</div>
          <div className="stat-sub">Gần nhất: {kpis.nearestLabel}</div>
        </div>
        <div className="stat">
          <div className="stat-lbl">Nháp chưa công bố</div>
          <div className="stat-val">{kpis.draftCount}</div>
          <div className="stat-sub">Trong trang này</div>
        </div>
        <div className="stat">
          <div className="stat-lbl">Chi phí đã xác nhận</div>
          <div className="stat-val">{fmtCurrency(kpis.totalConfirmedExpense)}</div>
          <div className="stat-sub">Các sự kiện trang này</div>
        </div>
        <div className="stat">
          <div className="stat-lbl">Chưa phân công</div>
          <div className="stat-val">{selectedId != null ? unassignedCount : "—"}</div>
          <div className="stat-sub">
            {selectedId != null ? "trong sự kiện đang chọn" : "Chọn sự kiện ở tab Đăng ký"}
          </div>
        </div>
      </div>

      <div className="mod-tabs" role="tablist">
        <button
          role="tab"
          type="button"
          aria-selected={tab === "list"}
          className={`mod-tab${tab === "list" ? " mod-tab-on" : ""}`}
          onClick={() => setTab("list")}
        >
          Danh sách sự kiện
        </button>
        <button
          role="tab"
          type="button"
          aria-selected={tab === "expenses"}
          className={`mod-tab${tab === "expenses" ? " mod-tab-on" : ""}`}
          onClick={() => setTab("expenses")}
        >
          <Receipt size={14} /> Chi phí
          {pendingExpenseCount > 0 ? (
            <span className="mod-tab-badge mod-tab-badge-warning">{pendingExpenseCount}</span>
          ) : null}
        </button>
        <button
          role="tab"
          type="button"
          aria-selected={tab === "rsvp"}
          className={`mod-tab${tab === "rsvp" ? " mod-tab-on" : ""}`}
          onClick={() => setTab("rsvp")}
        >
          <Users2 size={14} /> Đăng ký tham dự
          {rsvpTotal > 0 ? <span className="mod-tab-badge mod-tab-badge-warning">{rsvpTotal}</span> : null}
        </button>
        <button
          role="tab"
          type="button"
          aria-selected={tab === "new"}
          className={`mod-tab${tab === "new" ? " mod-tab-on" : ""}`}
          onClick={openCreate}
        >
          <CalendarPlus size={14} /> {form.id ? "Sửa sự kiện" : "Tạo sự kiện"}
        </button>
      </div>

      {tab === "list" ? (
        <>
          {events.length === 0 ? (
            <EmptyState title="Chưa có sự kiện" description="Tạo họp họ hoặc giỗ tổ ở tab Tạo sự kiện." />
          ) : (
            <>
              <div className="event-cards">
                {events.map((ev) => {
                  const e = ev.event;
                  const stats = ev.stats;
                  const st = (e?.status ?? "draft").toLowerCase();
                  const lunar = parseLunarLabel(e?.lunarJson);
                  const taskList = parseTasks(e?.checklistJson);
                  const confirmed = e?.id != null ? confirmedByEvent[e.id] ?? 0 : 0;
                  const budget = num(e?.estimatedBudget);
                  const linkedTitle = campaignTitle(e?.linkedCampaignId);
                  return (
                    <div
                      key={e?.id}
                      className={`event-card${selectedId === e?.id ? " event-card-selected" : ""}`}
                    >
                      <div className={`event-banner${st === "completed" || st === "cancelled" ? " event-banner-past" : ""}`} />
                      <div className="event-card-body">
                        <div className="event-card-head">
                          <h3>{e?.title ?? "—"}</h3>
                          <Badge tone={EVENT_STATUS_TONE[st] ?? "default"}>
                            {EVENT_STATUS_LABEL[st] ?? st}
                          </Badge>
                        </div>
                        <div className="event-card-meta">
                          <span>{EVENT_TYPE_LABEL[e?.type ?? ""] ?? "Khác"}</span>
                          <span>{fmtDateTime(e?.startSolar)}</span>
                          {lunar ? <span>{lunar}</span> : null}
                          {e?.location ? <span>{e.location}</span> : null}
                        </div>
                        <div className="fl-budget-line">
                          <Wallet size={13} aria-hidden />
                          <span>
                            Chi phí: <strong>{fmtCurrency(confirmed)}</strong>
                            {budget > 0 ? <> / dự toán {fmtCurrency(budget)}</> : null}
                          </span>
                          {e?.linkedCampaignId != null ? (
                            <Link
                              to={`/donation?campaign=${e.linkedCampaignId}`}
                              className="fl-link"
                              title={linkedTitle ?? undefined}
                            >
                              Xem quỹ →
                            </Link>
                          ) : null}
                        </div>
                        <div className="event-stats-grid">
                          <div>
                            <b>{stats?.households ?? 0}</b>
                            <small>hộ</small>
                          </div>
                          <div>
                            <b>{stats?.people ?? 0}</b>
                            <small>người</small>
                          </div>
                          <div>
                            <b>{stats?.vehicles ?? 0}</b>
                            <small>xe</small>
                          </div>
                        </div>
                        {taskList.length > 0 ? (
                          <div className="event-checklist">
                            {taskList.map((t) => (
                              <span key={t} className="event-task">
                                {t}
                              </span>
                            ))}
                          </div>
                        ) : null}
                        <div className="event-card-actions">
                          {st === "draft" && e?.id != null ? (
                            <Button type="button" onClick={() => void changeStatus(e.id!, "published")}>
                              Công bố
                            </Button>
                          ) : null}
                          {st === "published" && e?.id != null ? (
                            <Button type="button" onClick={() => void changeStatus(e.id!, "completed")}>
                              Hoàn thành
                            </Button>
                          ) : null}
                          {(st === "draft" || st === "published") && e?.id != null ? (
                            <Button
                              type="button"
                              variant="secondary"
                              onClick={() => void changeStatus(e.id!, "cancelled")}
                            >
                              Hủy
                            </Button>
                          ) : null}
                          <Button
                            type="button"
                            variant="secondary"
                            onClick={() => {
                              setExpenseEventId(e?.id ?? null);
                              setTab("expenses");
                            }}
                          >
                            <Receipt size={14} /> Chi phí
                          </Button>
                          <Button
                            type="button"
                            variant="secondary"
                            onClick={() => {
                              setSelectedId(e?.id ?? null);
                              setTab("rsvp");
                            }}
                          >
                            <Users2 size={14} /> Đăng ký
                          </Button>
                          <Button type="button" variant="secondary" onClick={() => openEdit(ev)}>
                            Sửa
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <Pagination
                page={eventPage + 1}
                totalPages={eventTotalPages}
                totalItems={eventTotal}
                pageSize={PAGE_SIZE}
                onPageChange={(p) => setEventPage(p - 1)}
              />
            </>
          )}
        </>
      ) : null}

      {tab === "expenses" ? (
        <>
          <div className="admin-filter-bar">
            <Select
              aria-label="Chọn sự kiện"
              value={expenseEventId != null ? String(expenseEventId) : ""}
              onChange={(e) => setExpenseEventId(e.target.value ? Number(e.target.value) : null)}
              options={eventOptions}
            />
            {expenseEventId != null ? (
              <div className="fl-filter-end">
                <Button
                  type="button"
                  variant={showExpenseForm ? "secondary" : "primary"}
                  onClick={() => setShowExpenseForm((v) => !v)}
                >
                  <Receipt size={13} /> {showExpenseForm ? "Ẩn form" : "Thêm chi phí"}
                </Button>
              </div>
            ) : null}
          </div>

          {expenseEventId == null ? (
            <p className="admin-help-text">Chọn sự kiện để xem sổ chi phí.</p>
          ) : (
            <>
              {expenseEvent ? (
                <div className="event-header-card">
                  <b>{expenseEvent.event?.title}</b>
                  <span>{fmtDateTime(expenseEvent.event?.startSolar)}</span>
                  <span className="event-stats-inline">
                    Đã xác nhận: {fmtCurrency(expenseConfirmedTotal)}
                    {num(expenseEvent.event?.estimatedBudget) > 0
                      ? ` / dự toán ${fmtCurrency(num(expenseEvent.event?.estimatedBudget))}`
                      : ""}
                  </span>
                </div>
              ) : null}

              {showExpenseForm ? (
                <AddExpenseForm
                  eventId={expenseEventId}
                  slug={slug}
                  getToken={getAccessToken}
                  onSaved={async () => {
                    setMsg("Đã ghi khoản chi — chờ xác nhận.");
                    setShowExpenseForm(false);
                    await Promise.all([reloadExpenses(), reloadEvents()]);
                  }}
                  onClose={() => setShowExpenseForm(false)}
                />
              ) : null}

              {expenses.length === 0 ? (
                <EmptyState
                  title="Chưa có khoản chi"
                  description="Thêm khoản chi đầu tiên bằng nút phía trên."
                />
              ) : (
                <>
                  <div className="fl-table">
                    <div className="fl-thead fl-thead-expense" aria-hidden>
                      <span>Mô tả</span>
                      <span>Số tiền</span>
                      <span>Hạng mục</span>
                      <span>Ngày</span>
                      <span>Người chi</span>
                      <span>Trạng thái</span>
                      <span>Thao tác</span>
                    </div>
                    {expenses.map((x) => {
                      const st = (x.status ?? "pending").toLowerCase();
                      return (
                        <div key={x.id} className="fl-row fl-row-expense">
                          <div>
                            <div className="fl-row-label">{x.description}</div>
                            {x.receiptRef ? (
                              <div className="fl-row-sub">Biên lai: {x.receiptRef}</div>
                            ) : null}
                            {x.note ? <div className="fl-row-sub">{x.note}</div> : null}
                          </div>
                          <div className="fl-amount fl-amount-debit">{fmtCurrency(x.amount)}</div>
                          <div className="fl-row-sub">
                            {EXPENSE_CATEGORY_LABEL[x.category] ?? x.category}
                          </div>
                          <div className="fl-row-sub">{fmtDateShort(x.expenseDate)}</div>
                          <div className="fl-row-sub">{x.paidByName}</div>
                          <div>
                            <Badge tone={EXPENSE_STATUS_TONE[st] ?? "default"}>
                              {EXPENSE_STATUS_LABEL[st] ?? st}
                            </Badge>
                          </div>
                          <div className="fl-row-acts">
                            {st === "pending" && x.id != null ? (
                              <>
                                <button
                                  type="button"
                                  className="fl-action-btn fl-action-btn-confirm"
                                  disabled={expenseBusyId === x.id}
                                  onClick={() => void handleExpenseAction(x.id!, "confirm")}
                                  title="Xác nhận khoản chi"
                                >
                                  <CheckCircle size={12} /> Xác nhận
                                </button>
                                <button
                                  type="button"
                                  className="fl-action-btn fl-action-btn-reject"
                                  disabled={expenseBusyId === x.id}
                                  onClick={() => void handleExpenseAction(x.id!, "reject")}
                                  title="Từ chối"
                                >
                                  <XCircle size={12} />
                                </button>
                              </>
                            ) : null}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {expenseTotalPages > 1 ? (
                    <Pagination
                      page={expensePage + 1}
                      totalPages={expenseTotalPages}
                      totalItems={expenseTotal}
                      pageSize={50}
                      onPageChange={(p) => setExpensePage(p - 1)}
                    />
                  ) : null}
                </>
              )}
            </>
          )}
        </>
      ) : null}

      {tab === "rsvp" ? (
        <>
          <div className="admin-filter-bar">
            <Select
              aria-label="Chọn sự kiện"
              value={selectedId != null ? String(selectedId) : ""}
              onChange={(e) => setSelectedId(e.target.value ? Number(e.target.value) : null)}
              options={eventOptions}
            />
            <Input
              value={rsvpQuery}
              onChange={(e) => setRsvpQuery(e.target.value)}
              placeholder="Tìm theo tên hộ…"
              style={{ maxWidth: 220 }}
            />
            <Select
              aria-label="Lọc phân công"
              value={rsvpFilter}
              onChange={(e) => setRsvpFilter(e.target.value as "all" | "unassigned")}
              options={[
                { value: "all", label: "Tất cả đăng ký" },
                { value: "unassigned", label: "Chưa phân công" },
              ]}
            />
          </div>

          {selectedId == null ? (
            <p className="admin-help-text">Chọn sự kiện để xem danh sách đăng ký.</p>
          ) : filteredRsvps.length === 0 ? (
            <EmptyState
              title="Không có đăng ký khớp"
              description={rsvps.length === 0 ? "Chưa có hộ nào đăng ký tham dự." : "Thử đổi bộ lọc."}
            />
          ) : (
            <>
              {selectedEvent ? (
                <div className="event-header-card">
                  <b>{selectedEvent.event?.title}</b>
                  <span>{fmtDateTime(selectedEvent.event?.startSolar)}</span>
                  <span className="event-stats-inline">
                    {selectedEvent.stats?.households ?? 0} hộ · {selectedEvent.stats?.people ?? 0} người ·{" "}
                    {selectedEvent.stats?.vehicles ?? 0} xe
                    {unassignedCount > 0 ? ` · ${unassignedCount} chưa phân công` : ""}
                  </span>
                </div>
              ) : null}
              <div className="rsvp-list">
                {filteredRsvps.map((r) => (
                  <div
                    key={r.id}
                    className={`rsvp-row${!r.assignment ? " rsvp-row-warn" : ""}`}
                  >
                    <div className="rsvp-name">{r.householdName}</div>
                    <div className="rsvp-meta">
                      {r.headcount ?? 0} người · {r.vehicles ?? 0} xe
                      {r.assignment ? <Badge tone="success">{r.assignment}</Badge> : (
                        <Badge tone="warning">Chưa phân công</Badge>
                      )}
                    </div>
                    <div className="rsvp-actions">
                      {ASSIGNMENTS.map((a) => (
                        <button
                          key={a}
                          type="button"
                          className={`rsvp-assign-btn${r.assignment === a ? " rsvp-assign-btn-on" : ""}`}
                          onClick={() => (r.id != null ? void assign(r.id, a) : undefined)}
                        >
                          {a}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <Pagination
                page={rsvpPage + 1}
                totalPages={rsvpTotalPages}
                totalItems={rsvpTotal}
                pageSize={RSVP_PAGE}
                onPageChange={(p) => setRsvpPage(p - 1)}
              />
            </>
          )}
        </>
      ) : null}

      {tab === "new" ? (
        <form onSubmit={saveEvent} className="admin-form">
          <h2 className="admin-form-title">{form.id ? "Sửa sự kiện" : "Tạo sự kiện mới"}</h2>
          <FormField label="Tên sự kiện" required>
            <Input
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            />
          </FormField>
          <div className="admin-form-grid">
            <FormField label="Loại sự kiện" required>
              <Select
                value={form.type}
                onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                options={EVENT_TYPE_OPTIONS}
              />
            </FormField>
            <FormField label="Trạng thái">
              <Select
                value={form.status}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                options={[
                  { value: "draft", label: "Nháp" },
                  { value: "published", label: "Đã công bố" },
                  { value: "completed", label: "Đã hoàn thành" },
                  { value: "cancelled", label: "Hủy" },
                ]}
              />
            </FormField>
          </div>
          <FormField
            label="Ngày giờ tổ chức (dương lịch)"
            hint="Hệ thống tự điền ngày âm tương ứng"
          >
            <Input
              type="datetime-local"
              value={form.startSolar}
              onChange={(e) => setForm((f) => ({ ...f, startSolar: e.target.value }))}
            />
          </FormField>
          <FormField label="Địa điểm">
            <Input
              value={form.location}
              onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
            />
          </FormField>
          <div className="admin-form-grid">
            <FormField label="Quỹ liên kết" hint="Chiến dịch mục đích «Sự kiện» tại Quỹ công đức">
              <Select
                value={form.linkedCampaignId}
                onChange={(e) => setForm((f) => ({ ...f, linkedCampaignId: e.target.value }))}
                options={[
                  { value: "", label: "— Không liên kết —" },
                  ...eventCampaigns.map((c) => ({ value: String(c.id), label: c.title })),
                ]}
              />
            </FormField>
            <FormField label="Dự toán chi phí (VND)">
              <Input
                value={form.estimatedBudget}
                onChange={(e) => setForm((f) => ({ ...f, estimatedBudget: e.target.value }))}
                inputMode="numeric"
                placeholder="VD: 30000000"
              />
            </FormField>
          </div>
          <FormField label="Mô tả">
            <Textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
          </FormField>
          <FormField label="Danh mục công việc / ban" hint="Thêm từng mục — dùng khi phân công đăng ký">
            <div className="checklist-builder">
              {form.tasks.map((t, i) => (
                <div key={`${t}-${i}`} className="checklist-item">
                  <Input
                    value={t}
                    onChange={(e) => {
                      const next = [...form.tasks];
                      next[i] = e.target.value;
                      setForm((f) => ({ ...f, tasks: next }));
                    }}
                  />
                  <button
                    type="button"
                    className="checklist-rm"
                    aria-label="Xóa mục"
                    onClick={() =>
                      setForm((f) => ({ ...f, tasks: f.tasks.filter((_, j) => j !== i) }))
                    }
                  >
                    ×
                  </button>
                </div>
              ))}
              <div className="checklist-add">
                <Input
                  value={taskDraft}
                  onChange={(e) => setTaskDraft(e.target.value)}
                  placeholder="Thêm mục…"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      if (taskDraft.trim()) {
                        setForm((f) => ({ ...f, tasks: [...f.tasks, taskDraft.trim()] }));
                        setTaskDraft("");
                      }
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    if (taskDraft.trim()) {
                      setForm((f) => ({ ...f, tasks: [...f.tasks, taskDraft.trim()] }));
                      setTaskDraft("");
                    }
                  }}
                >
                  Thêm
                </Button>
              </div>
            </div>
          </FormField>
          <div style={{ display: "flex", gap: "var(--spacing-sm)" }}>
            <Button type="submit" disabled={busy || !form.title.trim()}>
              {busy ? "Đang lưu…" : form.id ? "Lưu thay đổi" : "Tạo sự kiện"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                resetForm();
                setTab("list");
              }}
            >
              Hủy
            </Button>
          </div>
        </form>
      ) : null}
    </div>
  );
}

import { useCallback, useEffect, useMemo, useState } from "react";
import { CalendarPlus, Users2 } from "lucide-react";
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
} from "@giapha/ui";
import {
  assignEventRsvp,
  defaultTreeSlug,
  listClanEvents,
  listEventRsvps,
  upsertClanEvent,
  type ClanEventView,
  type EventRsvpDto,
} from "../api/genealogyApi";
import { ApiError } from "../api/http";
import { AdminPageHeader } from "../components/AdminPageHeader";

const PAGE_SIZE = 20;
const RSVP_PAGE = 50;
const ASSIGNMENTS = ["Ban tế", "Hậu cần", "Khánh tiết", "Tiếp tân"];

function fmtDate(iso?: string | null): string {
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

export function EventsAdminPage() {
  const { getAccessToken } = useAuth();
  const slug = defaultTreeSlug();

  const [tab, setTab] = useState("list");
  const [eventPage, setEventPage] = useState(0);
  const [events, setEvents] = useState<ClanEventView[]>([]);
  const [eventTotal, setEventTotal] = useState(0);
  const [eventTotalPages, setEventTotalPages] = useState(1);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const [rsvpPage, setRsvpPage] = useState(0);
  const [rsvps, setRsvps] = useState<EventRsvpDto[]>([]);
  const [rsvpTotal, setRsvpTotal] = useState(0);
  const [rsvpTotalPages, setRsvpTotalPages] = useState(1);
  const [rsvpQuery, setRsvpQuery] = useState("");
  const [rsvpFilter, setRsvpFilter] = useState<"all" | "unassigned">("all");

  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [editId, setEditId] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const [startSolar, setStartSolar] = useState("");
  const [location, setLocation] = useState("");
  const [tasks, setTasks] = useState<string[]>(["Ban tế", "Hậu cần", "Khánh tiết"]);
  const [taskDraft, setTaskDraft] = useState("");

  const reloadEvents = useCallback(async () => {
    setError(null);
    try {
      const token = await getAccessToken();
      const r = await listClanEvents(slug, token, eventPage, PAGE_SIZE);
      setEvents(r.content);
      setEventTotal(r.totalElements);
      setEventTotalPages(r.totalPages);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Không tải được sự kiện.");
      setEvents([]);
    }
  }, [eventPage, getAccessToken, slug]);

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

  useEffect(() => {
    void reloadEvents();
  }, [reloadEvents]);
  useEffect(() => {
    void reloadRsvps();
  }, [reloadRsvps]);
  useEffect(() => {
    setRsvpPage(0);
  }, [selectedId]);

  const kpis = useMemo(() => {
    const now = Date.now();
    const upcoming = events.filter((e) => e.event?.startSolar && new Date(e.event.startSolar).getTime() >= now);
    const past = events.filter((e) => e.event?.startSolar && new Date(e.event.startSolar).getTime() < now);
    const nearest = [...upcoming].sort(
      (a, b) => new Date(a.event!.startSolar!).getTime() - new Date(b.event!.startSolar!).getTime(),
    )[0];
    const focus = nearest ?? events[0];
    const households = focus?.stats?.households ?? 0;
    const people = focus?.stats?.people ?? 0;
    const vehicles = focus?.stats?.vehicles ?? 0;
    return {
      upcoming: upcoming.length,
      past: past.length,
      nearestLabel: nearest?.event?.startSolar
        ? new Date(nearest.event.startSolar).toLocaleDateString("vi-VN")
        : "—",
      households,
      people,
      vehicles,
      focusTitle: focus?.event?.title,
    };
  }, [events]);

  const filteredRsvps = useMemo(() => {
    const q = rsvpQuery.trim().toLowerCase();
    return rsvps.filter((r) => {
      if (rsvpFilter === "unassigned" && r.assignment) return false;
      if (q && !(r.householdName ?? "").toLowerCase().includes(q)) return false;
      return true;
    });
  }, [rsvpFilter, rsvpQuery, rsvps]);

  const unassignedCount = useMemo(() => rsvps.filter((r) => !r.assignment).length, [rsvps]);

  function resetForm() {
    setEditId(null);
    setTitle("");
    setStartSolar("");
    setLocation("");
    setTasks(["Ban tế", "Hậu cần", "Khánh tiết"]);
    setTaskDraft("");
  }

  function openCreate() {
    resetForm();
    setTab("new");
  }

  function openEdit(ev: ClanEventView) {
    const e = ev.event;
    setEditId(e?.id ?? null);
    setTitle(e?.title ?? "");
    if (e?.startSolar) {
      const d = new Date(e.startSolar);
      const local = new Date(d.getTime() - d.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
      setStartSolar(local);
    } else {
      setStartSolar("");
    }
    setLocation(e?.location ?? "");
    const parsed = parseTasks(e?.checklistJson);
    setTasks(parsed.length ? parsed : ["Ban tế", "Hậu cần"]);
    setTab("new");
  }

  async function saveEvent(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setMsg(null);
    try {
      const token = await getAccessToken();
      await upsertClanEvent(
        slug,
        {
          id: editId ?? undefined,
          title: title.trim(),
          startSolar: startSolar.trim() ? new Date(startSolar).toISOString() : null,
          location: location.trim() || null,
          checklistJson: JSON.stringify({ tasks: tasks.filter((t) => t.trim()) }),
        },
        token,
      );
      setMsg(editId ? "Đã cập nhật sự kiện." : "Đã tạo sự kiện.");
      resetForm();
      setTab("list");
      await reloadEvents();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Lưu thất bại.");
    } finally {
      setBusy(false);
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

  const selectedEvent = selectedId != null ? events.find((e) => e.event?.id === selectedId) : null;

  return (
    <div className="admin-stack">
      <AdminPageHeader
        title="Sự kiện dòng họ"
        description="Tổ chức họp họ, giỗ tổ — theo dõi đăng ký tham dự và phân công ban tổ chức."
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
          <div className="stat-lbl">Đăng ký (sự kiện tiêu biểu)</div>
          <div className="stat-val">{kpis.households} hộ</div>
          <div className="stat-sub">
            {kpis.people} người · {kpis.vehicles} xe
            {kpis.focusTitle ? ` · ${kpis.focusTitle}` : ""}
          </div>
        </div>
        <div className="stat">
          <div className="stat-lbl">Trong trang này</div>
          <div className="stat-val">{eventTotal}</div>
          <div className="stat-sub">{kpis.past} đã tổ chức / đã qua</div>
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
          <CalendarPlus size={14} /> {editId ? "Sửa sự kiện" : "Tạo sự kiện"}
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
                  const isPast = e?.startSolar ? new Date(e.startSolar) < new Date() : false;
                  const lunar = parseLunarLabel(e?.lunarJson);
                  const taskList = parseTasks(e?.checklistJson);
                  return (
                    <div
                      key={e?.id}
                      className={`event-card${selectedId === e?.id ? " event-card-selected" : ""}`}
                    >
                      <div className={`event-banner${isPast ? " event-banner-past" : ""}`} />
                      <div className="event-card-body">
                        <div className="event-card-head">
                          <h3>{e?.title ?? "—"}</h3>
                          <Badge tone={isPast ? "default" : "success"}>
                            {isPast ? "Đã qua" : "Sắp tới"}
                          </Badge>
                        </div>
                        <div className="event-card-meta">
                          <span>{fmtDate(e?.startSolar)}</span>
                          {lunar ? <span>{lunar}</span> : null}
                          {e?.location ? <span>{e.location}</span> : null}
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
                          <Button
                            type="button"
                            variant="secondary"
                            onClick={() => {
                              setSelectedId(e?.id ?? null);
                              setTab("rsvp");
                            }}
                          >
                            <Users2 size={14} /> Xem đăng ký
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

      {tab === "rsvp" ? (
        <>
          <div className="admin-filter-bar">
            <Select
              aria-label="Chọn sự kiện"
              value={selectedId != null ? String(selectedId) : ""}
              onChange={(e) => setSelectedId(e.target.value ? Number(e.target.value) : null)}
              options={[
                { value: "", label: "— Chọn sự kiện —" },
                ...events.map((ev) => ({
                  value: String(ev.event?.id ?? ""),
                  label: ev.event?.title ?? `#${ev.event?.id}`,
                })),
              ]}
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
                  <span>{fmtDate(selectedEvent.event?.startSolar)}</span>
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
          <h2 className="admin-form-title">{editId ? "Sửa sự kiện" : "Tạo sự kiện mới"}</h2>
          <FormField label="Tên sự kiện" required>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </FormField>
          <FormField
            label="Ngày giờ tổ chức (dương lịch)"
            hint="Hệ thống tự điền ngày âm tương ứng"
          >
            <Input
              type="datetime-local"
              value={startSolar}
              onChange={(e) => setStartSolar(e.target.value)}
            />
          </FormField>
          <FormField label="Địa điểm">
            <Input value={location} onChange={(e) => setLocation(e.target.value)} />
          </FormField>
          <FormField label="Danh mục công việc / ban" hint="Thêm từng mục — dùng khi phân công đăng ký">
            <div className="checklist-builder">
              {tasks.map((t, i) => (
                <div key={`${t}-${i}`} className="checklist-item">
                  <Input
                    value={t}
                    onChange={(e) => {
                      const next = [...tasks];
                      next[i] = e.target.value;
                      setTasks(next);
                    }}
                  />
                  <button
                    type="button"
                    className="checklist-rm"
                    aria-label="Xóa mục"
                    onClick={() => setTasks(tasks.filter((_, j) => j !== i))}
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
                        setTasks([...tasks, taskDraft.trim()]);
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
                      setTasks([...tasks, taskDraft.trim()]);
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
            <Button type="submit" disabled={busy || !title.trim()}>
              {busy ? "Đang lưu…" : editId ? "Lưu thay đổi" : "Tạo sự kiện"}
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

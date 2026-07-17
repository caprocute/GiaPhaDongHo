import { useCallback, useEffect, useState } from "react";
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
  Textarea,
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

const TABS = [
  { key: "list",  label: "Danh sách sự kiện" },
  { key: "rsvp",  label: "Đăng ký tham dự" },
  { key: "new",   label: "+ Tạo sự kiện" },
];

const ASSIGNMENTS = ["Ban tế", "Hậu cần", "Khánh tiết", "Tiếp tân"];

function fmtDate(iso?: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
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

  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // New event form
  const [title, setTitle] = useState("");
  const [startSolar, setStartSolar] = useState("");
  const [location, setLocation] = useState("");
  const [checklist, setChecklist] = useState('{"tasks":["Ban tế","Hậu cần","Khánh tiết"]}');

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
    if (selectedId == null) { setRsvps([]); return; }
    try {
      const token = await getAccessToken();
      const r = await listEventRsvps(slug, selectedId, token, rsvpPage, RSVP_PAGE);
      setRsvps(r.content);
      setRsvpTotal(r.totalElements);
      setRsvpTotalPages(r.totalPages);
    } catch { setRsvps([]); }
  }, [getAccessToken, rsvpPage, selectedId, slug]);

  useEffect(() => { void reloadEvents(); }, [reloadEvents]);
  useEffect(() => { void reloadRsvps(); }, [reloadRsvps]);
  useEffect(() => { setRsvpPage(0); }, [selectedId]);

  async function saveEvent(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setMsg(null);
    try {
      const token = await getAccessToken();
      await upsertClanEvent(slug, {
        title: title.trim(),
        startSolar: startSolar.trim() ? new Date(startSolar).toISOString() : null,
        location: location.trim() || null,
        checklistJson: checklist.trim() || null,
      }, token);
      setMsg("Đã lưu sự kiện.");
      setTitle(""); setLocation("");
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
            {t.key === "new" ? <CalendarPlus size={14} /> : t.key === "rsvp" ? <Users2 size={14} /> : null}
            {t.label}
            {t.key === "rsvp" && rsvpTotal > 0 ? (
              <span className="mod-tab-badge mod-tab-badge-neutral">{rsvpTotal}</span>
            ) : null}
          </button>
        ))}
      </div>

      {/* ── Tab: Danh sách sự kiện ── */}
      {tab === "list" ? (
        <>
          {events.length === 0 ? (
            <EmptyState
              title="Chưa có sự kiện"
              description="Tạo họp họ hoặc giỗ tổ ở tab Tạo sự kiện."
            />
          ) : (
            <>
              <div className="event-cards">
                {events.map((ev) => {
                  const e = ev.event;
                  const stats = ev.stats;
                  const isPast = e?.startSolar ? new Date(e.startSolar) < new Date() : false;
                  return (
                    <div
                      key={e?.id}
                      className={`event-card${selectedId === e?.id ? " event-card-selected" : ""}`}
                    >
                      <div className="event-card-head">
                        <h3>{e?.title ?? "—"}</h3>
                        <Badge tone={isPast ? "default" : "success"}>
                          {isPast ? "Đã qua" : "Sắp tới"}
                        </Badge>
                      </div>
                      <div className="event-card-meta">
                        📅 {fmtDate(e?.startSolar)}
                        {e?.location ? <> · 📍 {e.location}</> : null}
                      </div>
                      <div className="event-stats">
                        <span>{stats?.households ?? 0} hộ</span>
                        <span>{stats?.people ?? 0} người</span>
                        <span>{stats?.vehicles ?? 0} xe</span>
                      </div>
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => { setSelectedId(e?.id ?? null); setTab("rsvp"); }}
                      >
                        <Users2 size={14} /> Xem đăng ký
                      </Button>
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

      {/* ── Tab: Đăng ký tham dự ── */}
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
          </div>

          {selectedId == null ? (
            <p className="admin-help-text">Chọn sự kiện để xem danh sách đăng ký.</p>
          ) : rsvps.length === 0 ? (
            <EmptyState title="Chưa có đăng ký" description="Chưa có hộ nào đăng ký tham dự." />
          ) : (
            <>
              {selectedEvent ? (
                <div className="event-header-card">
                  <b>{selectedEvent.event?.title}</b>
                  <span>{fmtDate(selectedEvent.event?.startSolar)}</span>
                  <span className="event-stats-inline">
                    {selectedEvent.stats?.households ?? 0} hộ ·{" "}
                    {selectedEvent.stats?.people ?? 0} người ·{" "}
                    {selectedEvent.stats?.vehicles ?? 0} xe
                  </span>
                </div>
              ) : null}
              <div className="rsvp-list">
                {rsvps.map((r) => (
                  <div key={r.id} className="rsvp-row">
                    <div className="rsvp-name">{r.householdName}</div>
                    <div className="rsvp-meta">
                      {r.headcount ?? 0} người · {r.vehicles ?? 0} xe
                      {r.assignment ? <Badge tone="default">{r.assignment}</Badge> : null}
                    </div>
                    <div className="rsvp-actions">
                      {ASSIGNMENTS.map((a) => (
                        <button
                          key={a}
                          type="button"
                          className={`rsvp-assign-btn${r.assignment === a ? " rsvp-assign-btn-on" : ""}`}
                          onClick={() => r.id != null ? void assign(r.id, a) : undefined}
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

      {/* ── Tab: Tạo sự kiện ── */}
      {tab === "new" ? (
        <form onSubmit={saveEvent} className="admin-form">
          <FormField label="Tên sự kiện" required>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </FormField>
          <FormField
            label="Ngày giờ tổ chức (dương lịch)"
            hint="Hệ thống tự điền ngày âm tương ứng"
          >
            <Input type="datetime-local" value={startSolar} onChange={(e) => setStartSolar(e.target.value)} />
          </FormField>
          <FormField label="Địa điểm">
            <Input value={location} onChange={(e) => setLocation(e.target.value)} />
          </FormField>
          <FormField
            label="Danh mục công việc (JSON)"
            hint='Ví dụ: {"tasks":["Ban tế","Hậu cần"]}'
          >
            <Textarea rows={3} value={checklist} onChange={(e) => setChecklist(e.target.value)} />
          </FormField>
          <div style={{ display: "flex", gap: "var(--spacing-sm)" }}>
            <Button type="submit" disabled={busy || !title.trim()}>
              {busy ? "Đang lưu…" : "Tạo sự kiện"}
            </Button>
            <Button type="button" variant="secondary" onClick={() => setTab("list")}>
              Hủy
            </Button>
          </div>
        </form>
      ) : null}
    </div>
  );
}

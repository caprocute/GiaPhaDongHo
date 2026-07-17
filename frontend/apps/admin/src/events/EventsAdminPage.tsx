import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@giapha/auth";
import {
  Alert,
  Button,
  DataTable,
  EmptyState,
  FormField,
  Input,
  Pagination,
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

type Row = ClanEventView & Record<string, unknown>;
const EVENT_PAGE_SIZE = 20;
const RSVP_PAGE_SIZE = 50;

export function EventsAdminPage() {
  const { getAccessToken } = useAuth();
  const slug = defaultTreeSlug();
  const [eventPage, setEventPage] = useState(0);
  const [rows, setRows] = useState<ClanEventView[]>([]);
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

  const [title, setTitle] = useState("");
  const [startSolar, setStartSolar] = useState("");
  const [location, setLocation] = useState("");
  const [checklist, setChecklist] = useState('{"albumId":null,"tasks":["Ban tế","Hậu cần","Khánh tiết"]}');

  const reloadEvents = useCallback(async () => {
    setError(null);
    try {
      const token = await getAccessToken();
      const result = await listClanEvents(slug, token, eventPage, EVENT_PAGE_SIZE);
      setRows(result.content);
      setEventTotal(result.totalElements);
      setEventTotalPages(result.totalPages);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Không tải được sự kiện.");
      setRows([]);
    }
  }, [eventPage, getAccessToken, slug]);

  useEffect(() => {
    void reloadEvents();
  }, [reloadEvents]);

  useEffect(() => {
    setRsvpPage(0);
  }, [selectedId]);

  const reloadRsvps = useCallback(async () => {
    if (selectedId == null) {
      setRsvps([]);
      setRsvpTotal(0);
      setRsvpTotalPages(1);
      return;
    }
    try {
      const token = await getAccessToken();
      const result = await listEventRsvps(slug, selectedId, token, rsvpPage, RSVP_PAGE_SIZE);
      setRsvps(result.content);
      setRsvpTotal(result.totalElements);
      setRsvpTotalPages(result.totalPages);
    } catch {
      setRsvps([]);
    }
  }, [getAccessToken, rsvpPage, selectedId, slug]);

  useEffect(() => {
    void reloadRsvps();
  }, [reloadRsvps]);

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
          title: title.trim(),
          startSolar: startSolar.trim() ? new Date(startSolar).toISOString() : null,
          location: location.trim() || null,
          checklistJson: checklist.trim() || null,
        },
        token,
      );
      setMsg("Đã lưu sự kiện.");
      setTitle("");
      setLocation("");
      await reloadEvents();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Lưu thất bại.");
    } finally {
      setBusy(false);
    }
  }

  async function setAssignment(rsvpId: number, assignment: string) {
    try {
      const token = await getAccessToken();
      await assignEventRsvp(slug, rsvpId, assignment, token);
      await reloadRsvps();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Phân công thất bại.");
    }
  }

  const columns = [
    {
      key: "id",
      header: "ID",
      render: (row: Row) => row.event?.id ?? "—",
    },
    {
      key: "title",
      header: "Sự kiện",
      render: (row: Row) => (
        <button
          type="button"
          onClick={() => setSelectedId(row.event?.id ?? null)}
          style={{
            background: "none",
            border: "none",
            padding: 0,
            color: "var(--color-action-primary-bg)",
            cursor: "pointer",
            fontFamily: "var(--font-body)",
          }}
        >
          {row.event?.title}
        </button>
      ),
    },
    {
      key: "when",
      header: "Thời gian",
      render: (row: Row) => row.event?.startSolar ?? "—",
    },
    {
      key: "stats",
      header: "Điểm danh",
      render: (row: Row) =>
        `${row.stats?.households ?? 0} hộ / ${row.stats?.people ?? 0} người / ${row.stats?.vehicles ?? 0} xe`,
    },
  ];

  return (
    <div className="admin-stack">
      <AdminPageHeader
        title="Sự kiện dòng họ"
        description="Tổ chức họp họ, giỗ tổ — theo dõi đăng ký tham dự và phân công ban tổ chức."
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

      <form
        onSubmit={saveEvent}
        style={{
          display: "grid",
          gap: "var(--spacing-md)",
          maxWidth: 640,
          padding: "var(--spacing-md)",
          border: "1px solid var(--color-border-subtle)",
        }}
      >
        <strong style={{ fontFamily: "var(--font-display)" }}>Tạo sự kiện</strong>
        <FormField label="Tiêu đề" required>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} />
        </FormField>
        <FormField label="Bắt đầu (dương lịch)" hint="Thời gian địa phương — hệ thống tự điền âm lịch">
          <Input type="datetime-local" value={startSolar} onChange={(e) => setStartSolar(e.target.value)} />
        </FormField>
        <FormField label="Địa điểm">
          <Input value={location} onChange={(e) => setLocation(e.target.value)} />
        </FormField>
        <FormField label="Danh mục công việc (JSON)" hint='{"albumId":1,"tasks":[...]}'>
          <Textarea rows={3} value={checklist} onChange={(e) => setChecklist(e.target.value)} />
        </FormField>
        <Button type="submit" disabled={busy || !title.trim()}>
          Lưu sự kiện
        </Button>
      </form>

      {rows.length === 0 ? (
        <EmptyState title="Chưa có sự kiện" description="Tạo họp họ / giỗ tổ ở form trên." />
      ) : (
        <>
          <div className="admin-table-wrap">
            <DataTable columns={columns} rows={rows as Row[]} />
          </div>
          <div className="admin-table-footer">
            <Pagination
              page={eventPage + 1}
              totalPages={eventTotalPages}
              totalItems={eventTotal}
              onPageChange={(p) => setEventPage(p - 1)}
            />
          </div>
        </>
      )}

      {selectedId != null ? (
        <div style={{ display: "grid", gap: "var(--spacing-sm)" }}>
          <strong style={{ fontFamily: "var(--font-display)" }}>
            Đăng ký tham dự — sự kiện #{selectedId}
          </strong>
          {rsvps.length === 0 ? (
            <p style={{ color: "var(--color-text-muted)", fontFamily: "var(--font-body)" }}>
              Chưa có hộ đăng ký.
            </p>
          ) : (
            <>
              <ul style={{ margin: 0, paddingLeft: "1.2rem", fontFamily: "var(--font-body)" }}>
                {rsvps.map((r) => (
                  <li key={r.id} style={{ marginBottom: "var(--spacing-xs)" }}>
                    <strong>{r.householdName}</strong> — {r.headcount ?? 0} người, {r.vehicles ?? 0} xe
                    {r.assignment ? ` · ${r.assignment}` : ""}{" "}
                    <button
                      type="button"
                      onClick={() => void setAssignment(r.id!, "Ban tế")}
                      style={{
                        marginLeft: "var(--spacing-xs)",
                        fontFamily: "var(--font-body)",
                        cursor: "pointer",
                      }}
                    >
                      → Ban tế
                    </button>
                    <button
                      type="button"
                      onClick={() => void setAssignment(r.id!, "Hậu cần")}
                      style={{
                        marginLeft: "var(--spacing-xs)",
                        fontFamily: "var(--font-body)",
                        cursor: "pointer",
                      }}
                    >
                      → Hậu cần
                    </button>
                  </li>
                ))}
              </ul>
              <Pagination
                page={rsvpPage + 1}
                totalPages={rsvpTotalPages}
                totalItems={rsvpTotal}
                onPageChange={(p) => setRsvpPage(p - 1)}
              />
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}

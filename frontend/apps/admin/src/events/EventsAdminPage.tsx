import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@giapha/auth";
import { Alert, Button, DataTable, EmptyState, FormField, Input, Textarea } from "@giapha/ui";
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

type Row = ClanEventView & Record<string, unknown>;

export function EventsAdminPage() {
  const { getAccessToken } = useAuth();
  const slug = defaultTreeSlug();
  const [rows, setRows] = useState<ClanEventView[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [rsvps, setRsvps] = useState<EventRsvpDto[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [title, setTitle] = useState("");
  const [startSolar, setStartSolar] = useState("");
  const [location, setLocation] = useState("");
  const [checklist, setChecklist] = useState('{"albumId":null,"tasks":["Ban tế","Hậu cần","Khánh tiết"]}');

  const reload = useCallback(async () => {
    setError(null);
    try {
      const token = await getAccessToken();
      setRows(await listClanEvents(slug, token));
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Không tải được sự kiện.");
      setRows([]);
    }
  }, [getAccessToken, slug]);

  useEffect(() => {
    void reload();
  }, [reload]);

  useEffect(() => {
    if (selectedId == null) {
      setRsvps([]);
      return;
    }
    void (async () => {
      try {
        const token = await getAccessToken();
        setRsvps(await listEventRsvps(slug, selectedId, token));
      } catch {
        setRsvps([]);
      }
    })();
  }, [getAccessToken, selectedId, slug]);

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
      await reload();
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
      setRsvps(await listEventRsvps(slug, selectedId!, token));
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
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-lg)" }}>
      <div>
        <h1 style={{ fontFamily: "var(--font-display)", margin: 0 }}>Sự kiện dòng họ</h1>
        <p style={{ margin: 0, color: "var(--color-text-muted)", fontFamily: "var(--font-body)" }}>
          Họp họ / giỗ tổ · RSVP · phân công — F6 / R2.3 · <code>{slug}</code>
        </p>
      </div>

      {error ? (
        <Alert title="Lỗi" variant="error">
          {error}
        </Alert>
      ) : null}
      {msg ? (
        <Alert title="OK" variant="success">
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
        <FormField label="Bắt đầu (dương lịch)" hint="Browser local → ISO; BE tự điền lunarJson">
          <Input type="datetime-local" value={startSolar} onChange={(e) => setStartSolar(e.target.value)} />
        </FormField>
        <FormField label="Địa điểm">
          <Input value={location} onChange={(e) => setLocation(e.target.value)} />
        </FormField>
        <FormField label="Checklist / album JSON" hint='{"albumId":1,"tasks":[...]}'>
          <Textarea rows={3} value={checklist} onChange={(e) => setChecklist(e.target.value)} />
        </FormField>
        <Button type="submit" disabled={busy || !title.trim()}>
          Lưu sự kiện
        </Button>
      </form>

      {rows.length === 0 ? (
        <EmptyState title="Chưa có sự kiện" description="Tạo họp họ / giỗ tổ ở form trên." />
      ) : (
        <DataTable columns={columns} rows={rows as Row[]} />
      )}

      {selectedId != null ? (
        <div style={{ display: "grid", gap: "var(--spacing-sm)" }}>
          <strong style={{ fontFamily: "var(--font-display)" }}>RSVP — sự kiện #{selectedId}</strong>
          {rsvps.length === 0 ? (
            <p style={{ color: "var(--color-text-muted)", fontFamily: "var(--font-body)" }}>
              Chưa có hộ đăng ký.
            </p>
          ) : (
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
          )}
        </div>
      ) : null}
    </div>
  );
}

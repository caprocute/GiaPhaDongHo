"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "@giapha/auth";
import { Alert, Button, EmptyState, FormField, Input } from "@giapha/ui";
import { PageShell } from "../../src/chrome/PageShell";
import { API_BASE, TREE_SLUG } from "../../src/lib/config";

type EventDto = {
  id?: number;
  title?: string;
  startSolar?: string | null;
  lunarJson?: string | null;
  location?: string | null;
};

type EventView = {
  event: EventDto;
  albumId?: number | null;
  stats?: { households?: number; people?: number; vehicles?: number };
};

export function SuKienClient() {
  const { user, loading: authLoading, getAccessToken, login } = useAuth();
  const [events, setEvents] = useState<EventView[]>([]);
  const [active, setActive] = useState<EventView | null>(null);
  const [household, setHousehold] = useState("");
  const [headcount, setHeadcount] = useState("2");
  const [vehicles, setVehicles] = useState("0");
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!API_BASE) {
      setErr("Chưa cấu hình NEXT_PUBLIC_API_BASE_URL.");
      return;
    }
    void (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/v1/trees/${encodeURIComponent(TREE_SLUG)}/events`);
        if (res.ok) setEvents((await res.json()) as EventView[]);
      } catch (e) {
        setErr(e instanceof Error ? e.message : "Không tải được sự kiện.");
      }
    })();
  }, []);

  async function onRsvp(e: FormEvent) {
    e.preventDefault();
    if (!active?.event?.id || !API_BASE) return;
    setBusy(true);
    setErr(null);
    setMsg(null);
    try {
      const token = await getAccessToken();
      const res = await fetch(
        `${API_BASE}/api/v1/trees/${encodeURIComponent(TREE_SLUG)}/events/${active.event.id}/rsvps`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            householdName: household.trim(),
            headcount: Number(headcount) || 1,
            vehicles: Number(vehicles) || 0,
          }),
        },
      );
      if (!res.ok) {
        setErr((await res.text()).slice(0, 280) || `HTTP ${res.status}`);
        return;
      }
      setMsg("Đã đăng ký tham dự theo hộ.");
      const list = await fetch(`${API_BASE}/api/v1/trees/${encodeURIComponent(TREE_SLUG)}/events`);
      if (list.ok) {
        const all = (await list.json()) as EventView[];
        setEvents(all);
        setActive(all.find((x) => x.event.id === active.event.id) ?? null);
      }
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : "Đăng ký thất bại.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <PageShell title="Sự kiện dòng họ" lead="Họp họ · giỗ tổ · đăng ký theo hộ (F6).">
      {err ? (
        <Alert title="Lỗi" variant="error">
          {err}
        </Alert>
      ) : null}
      {msg ? (
        <Alert title="Thành công" variant="success">
          {msg}
        </Alert>
      ) : null}

      {events.length === 0 && !err ? (
        <EmptyState title="Chưa có sự kiện" description="Tộc trưởng sẽ đăng họp họ / giỗ tổ tại đây." />
      ) : (
        <div style={{ display: "grid", gap: "var(--spacing-lg)" }}>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: "var(--spacing-sm)" }}>
            {events.map((ev) => (
              <li key={ev.event.id}>
                <button
                  type="button"
                  onClick={() => setActive(ev)}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    padding: "var(--spacing-md)",
                    border: "1px solid var(--color-border-subtle)",
                    background:
                      active?.event?.id === ev.event.id
                        ? "var(--color-surface-muted, var(--color-surface-card))"
                        : "var(--color-surface-card)",
                    cursor: "pointer",
                    fontFamily: "var(--font-body)",
                  }}
                >
                  <strong style={{ fontFamily: "var(--font-display)" }}>{ev.event.title}</strong>
                  <div style={{ color: "var(--color-text-muted)", marginTop: "var(--spacing-xs)" }}>
                    {ev.event.startSolar ? new Date(ev.event.startSolar).toLocaleString("vi-VN") : "Chưa đặt giờ"}
                    {ev.event.location ? ` · ${ev.event.location}` : ""}
                  </div>
                  <div style={{ color: "var(--color-text-muted)", marginTop: "var(--spacing-xs)" }}>
                    Đã đăng ký: {ev.stats?.households ?? 0} hộ · {ev.stats?.people ?? 0} người ·{" "}
                    {ev.stats?.vehicles ?? 0} xe
                    {ev.albumId != null ? (
                      <>
                        {" · "}
                        <a href="/album" onClick={(e) => e.stopPropagation()}>
                          Gallery album #{ev.albumId}
                        </a>
                      </>
                    ) : null}
                  </div>
                  {ev.event.lunarJson ? (
                    <code style={{ fontSize: "var(--font-size-sm)" }}>{ev.event.lunarJson}</code>
                  ) : null}
                </button>
              </li>
            ))}
          </ul>

          {active ? (
            <section style={{ maxWidth: 480, display: "grid", gap: "var(--spacing-md)" }}>
              <h2 style={{ fontFamily: "var(--font-display)", margin: 0 }}>Đăng ký theo hộ</h2>
              {authLoading ? (
                <p style={{ color: "var(--color-text-muted)", fontFamily: "var(--font-body)" }}>Đang tải…</p>
              ) : !user ? (
                <>
                  <Alert title="Cần đăng nhập" variant="info">
                    Đăng nhập để gửi RSVP.
                  </Alert>
                  <Button type="button" onClick={() => void login()}>
                    Đăng nhập
                  </Button>
                </>
              ) : (
                <form onSubmit={onRsvp} style={{ display: "grid", gap: "var(--spacing-md)" }}>
                  <FormField label="Tên hộ" required>
                    <Input value={household} onChange={(e) => setHousehold(e.target.value)} />
                  </FormField>
                  <FormField label="Số người">
                    <Input value={headcount} onChange={(e) => setHeadcount(e.target.value)} inputMode="numeric" />
                  </FormField>
                  <FormField label="Số xe">
                    <Input value={vehicles} onChange={(e) => setVehicles(e.target.value)} inputMode="numeric" />
                  </FormField>
                  <Button type="submit" disabled={busy || !household.trim()}>
                    {busy ? "Đang gửi…" : "Gửi đăng ký"}
                  </Button>
                </form>
              )}
            </section>
          ) : null}
        </div>
      )}
    </PageShell>
  );
}

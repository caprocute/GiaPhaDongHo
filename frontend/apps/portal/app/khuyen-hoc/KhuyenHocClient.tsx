"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "@giapha/auth";
import { Alert, Button, EmptyState, FormField, Input, Textarea } from "@giapha/ui";
import { PageShell } from "../../src/chrome/PageShell";
import { API_BASE, TREE_SLUG } from "../../src/lib/config";

type Entry = {
  id?: number;
  personName?: string;
  achievement?: string;
  year?: number | null;
  status?: string | null;
};

export function KhuyenHocClient() {
  const { user, getAccessToken, login, loading } = useAuth();
  const [board, setBoard] = useState<Entry[]>([]);
  const [personName, setPersonName] = useState("");
  const [achievement, setAchievement] = useState("");
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!API_BASE) return;
    void fetch(`${API_BASE}/api/v1/trees/${encodeURIComponent(TREE_SLUG)}/scholarship-board`)
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => setBoard(d as Entry[]))
      .catch(() => setBoard([]));
  }, []);

  async function nominate(e: FormEvent) {
    e.preventDefault();
    if (!API_BASE) return;
    setErr(null);
    setMsg(null);
    const token = await getAccessToken();
    const res = await fetch(
      `${API_BASE}/api/v1/trees/${encodeURIComponent(TREE_SLUG)}/scholarship-entries`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          personName: personName.trim(),
          achievement: achievement.trim(),
          year: Number(year) || null,
        }),
      },
    );
    if (!res.ok) {
      setErr((await res.text()).slice(0, 280));
      return;
    }
    setMsg("Đã gửi đề cử — chờ duyệt.");
    setPersonName("");
    setAchievement("");
  }

  return (
    <PageShell title="Khuyến học" lead="Bảng vàng thành tích · đề cử → duyệt (F8).">
      {err ? (
        <Alert title="Lỗi" variant="error">
          {err}
        </Alert>
      ) : null}
      {msg ? (
        <Alert title="OK" variant="success">
          {msg}
        </Alert>
      ) : null}

      <section>
        <h2 style={{ fontFamily: "var(--font-display)" }}>Bảng vàng</h2>
        {board.length === 0 ? (
          <EmptyState title="Chưa có thành tích công bố" description="Đề cử sẽ hiện sau khi được duyệt." />
        ) : (
          <ol style={{ fontFamily: "var(--font-body)" }}>
            {board.map((b) => (
              <li key={b.id}>
                <strong>{b.personName}</strong>
                {b.year ? ` (${b.year})` : ""} — {b.achievement}
              </li>
            ))}
          </ol>
        )}
      </section>

      <section style={{ marginTop: "var(--spacing-lg)", maxWidth: 520 }}>
        <h2 style={{ fontFamily: "var(--font-display)" }}>Đề cử</h2>
        {loading ? null : !user ? (
          <Button type="button" onClick={() => void login()}>
            Đăng nhập để đề cử
          </Button>
        ) : (
          <form onSubmit={nominate} style={{ display: "grid", gap: "var(--spacing-md)" }}>
            <FormField label="Họ tên" required>
              <Input value={personName} onChange={(e) => setPersonName(e.target.value)} />
            </FormField>
            <FormField label="Thành tích" required>
              <Textarea rows={3} value={achievement} onChange={(e) => setAchievement(e.target.value)} />
            </FormField>
            <FormField label="Năm">
              <Input value={year} onChange={(e) => setYear(e.target.value)} inputMode="numeric" />
            </FormField>
            <Button type="submit" disabled={!personName.trim() || !achievement.trim()}>
              Gửi đề cử
            </Button>
          </form>
        )}
      </section>
    </PageShell>
  );
}

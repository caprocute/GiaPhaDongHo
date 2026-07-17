"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "@giapha/auth";
import { Alert, Button, EmptyState, FormField, Input, Select } from "@giapha/ui";
import { PageShell } from "../../src/chrome/PageShell";
import { useSiteSettings } from "../../src/chrome/SiteSettingsProvider";
import { API_BASE, TREE_SLUG } from "../../src/lib/config";
import { fetchPerson } from "../../src/lib/api";

type Sub = {
  id?: number;
  daysBefore?: number | null;
  channels?: string | null;
  person?: { id?: number; code?: string; fullName?: string } | null;
};

export function NhacGioClient() {
  const settings = useSiteSettings();
  const defaultDays = String(settings.notify?.remindDaysBefore ?? 7);
  const allowEmail = settings.notify?.channelEmail !== false;
  const allowZalo = settings.notify?.channelZalo === true;
  const { user, loading: authLoading, getAccessToken, login } = useAuth();
  const [subs, setSubs] = useState<Sub[]>([]);
  const [code, setCode] = useState("");
  const [personId, setPersonId] = useState<number | null>(null);
  const [personName, setPersonName] = useState("");
  const [daysBefore, setDaysBefore] = useState(defaultDays);
  const [channels, setChannels] = useState(allowEmail ? "email" : allowZalo ? "zalo" : "email");
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setDaysBefore(defaultDays);
  }, [defaultDays]);

  useEffect(() => {
    if (allowEmail) setChannels("email");
    else if (allowZalo) setChannels("zalo");
  }, [allowEmail, allowZalo]);

  const channelOptions = [
    ...(allowEmail ? [{ value: "email", label: "Email" }] : []),
    ...(allowZalo ? [{ value: "zalo", label: "Zalo" }] : []),
    ...(allowEmail && allowZalo ? [{ value: "email,zalo", label: "Email + Zalo" }] : []),
  ];

  const icsPublic = API_BASE
    ? `${API_BASE}/api/v1/trees/${encodeURIComponent(TREE_SLUG)}/anniversaries.ics`
    : "";

  async function loadSubs(token: string | null) {
    if (!API_BASE || !token) return;
    const res = await fetch(
      `${API_BASE}/api/v1/trees/${encodeURIComponent(TREE_SLUG)}/anniversary-subscriptions`,
      { headers: { Accept: "application/json", Authorization: `Bearer ${token}` } },
    );
    if (res.ok) setSubs((await res.json()) as Sub[]);
  }

  useEffect(() => {
    if (!user) return;
    void (async () => {
      const token = await getAccessToken();
      await loadSubs(token);
    })();
  }, [user, getAccessToken]);

  useEffect(() => {
    if (!code.trim()) {
      setPersonId(null);
      setPersonName("");
      return;
    }
    const t = window.setTimeout(() => {
      void fetchPerson(code.trim()).then((p) => {
        if (p) {
          setPersonId(typeof p.id === "number" ? p.id : Number(p.id) || null);
          setPersonName(p.fullName ?? "");
        } else {
          setPersonId(null);
          setPersonName("");
        }
      });
    }, 300);
    return () => window.clearTimeout(t);
  }, [code]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!API_BASE || !personId) {
      setErr("Nhập mã hiệu người có ngày giỗ trong cây.");
      return;
    }
    setBusy(true);
    setErr(null);
    setMsg(null);
    try {
      const token = await getAccessToken();
      const res = await fetch(
        `${API_BASE}/api/v1/trees/${encodeURIComponent(TREE_SLUG)}/anniversary-subscriptions`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            person: { id: personId },
            daysBefore: Number(daysBefore) || 3,
            channels,
          }),
        },
      );
      if (!res.ok) {
        setErr((await res.text()).slice(0, 280) || `HTTP ${res.status}`);
        return;
      }
      setMsg("Đã đăng ký nhắc giỗ.");
      await loadSubs(token);
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : "Đăng ký thất bại.");
    } finally {
      setBusy(false);
    }
  }

  async function removeSub(id: number) {
    if (!API_BASE) return;
    const token = await getAccessToken();
    const res = await fetch(
      `${API_BASE}/api/v1/trees/${encodeURIComponent(TREE_SLUG)}/anniversary-subscriptions/${id}`,
      {
        method: "DELETE",
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      },
    );
    if (res.ok) await loadSubs(token);
  }

  async function downloadMyIcal() {
    if (!API_BASE) return;
    const token = await getAccessToken();
    const res = await fetch(
      `${API_BASE}/api/v1/trees/${encodeURIComponent(TREE_SLUG)}/my-reminders.ics`,
      { headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) } },
    );
    if (!res.ok) {
      setErr((await res.text()).slice(0, 200));
      return;
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "nhac-gio.ics";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <PageShell title="Nhắc ngày giỗ" lead="Đăng ký nhận thông báo trước ngày giỗ · đồng bộ lịch cá nhân.">
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

      <p style={{ fontFamily: "var(--font-body)", color: "var(--color-text-muted)" }}>
        Lịch giỗ cả dòng họ:{" "}
        {icsPublic ? (
          <a href={icsPublic} target="_blank" rel="noreferrer">
            Tải lịch (.ics)
          </a>
        ) : (
          "chưa kết nối máy chủ"
        )}
      </p>

      {authLoading ? (
        <p style={{ color: "var(--color-text-muted)", fontFamily: "var(--font-body)" }}>Đang tải…</p>
      ) : !user ? (
        <div style={{ display: "grid", gap: "var(--spacing-md)", maxWidth: 420 }}>
          <Alert title="Cần đăng nhập" variant="info">
            Đăng nhập để đăng ký nhắc giỗ theo người.
          </Alert>
          <Button type="button" onClick={() => void login()}>
            Đăng nhập
          </Button>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "var(--spacing-lg)", maxWidth: 560 }}>
          <form onSubmit={onSubmit} style={{ display: "grid", gap: "var(--spacing-md)" }}>
            <FormField label="Mã hiệu người" required hint={personName || "VD: A7"}>
              <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="A7" />
            </FormField>
            <FormField label="Nhắc trước (ngày)">
              <Input value={daysBefore} onChange={(e) => setDaysBefore(e.target.value)} inputMode="numeric" />
            </FormField>
            <FormField label="Kênh">
              {channelOptions.length === 0 ? (
                <Alert title="Chưa bật kênh" variant="info">
                  Ban quản trị chưa bật kênh nhắc giỗ. Vào Cấu hình hệ thống để bật Email hoặc Zalo.
                </Alert>
              ) : (
                <Select
                  value={channels}
                  onChange={(e) => setChannels(e.target.value)}
                  options={channelOptions}
                />
              )}
            </FormField>
            <Button type="submit" disabled={busy || !personId || channelOptions.length === 0}>
              {busy ? "Đang lưu…" : "Đăng ký nhắc"}
            </Button>
          </form>

          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "var(--spacing-md)",
              }}
            >
              <h2 style={{ fontFamily: "var(--font-display)", margin: 0 }}>Đăng ký của tôi</h2>
              <Button type="button" variant="secondary" onClick={() => void downloadMyIcal()}>
                Tải iCal của tôi
              </Button>
            </div>
            {subs.length === 0 ? (
              <EmptyState title="Chưa đăng ký" description="Chọn người có ngày giỗ để nhận nhắc." />
            ) : (
              <ul style={{ fontFamily: "var(--font-body)", paddingLeft: "1.2rem" }}>
                {subs.map((s) => (
                  <li key={s.id}>
                    {s.person?.fullName ?? s.person?.code} — trước {s.daysBefore ?? 3} ngày ·{" "}
                    {s.channels}{" "}
                    {s.id != null ? (
                      <button
                        type="button"
                        onClick={() => void removeSub(s.id!)}
                        style={{
                          marginLeft: "var(--spacing-xs)",
                          cursor: "pointer",
                          fontFamily: "var(--font-body)",
                        }}
                      >
                        Huỷ
                      </button>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </PageShell>
  );
}

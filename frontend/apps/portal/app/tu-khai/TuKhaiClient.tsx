"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "@giapha/auth";
import { Alert, Button, FormField, Input, Select, Textarea } from "@giapha/ui";
import { PageShell } from "../../src/chrome/PageShell";
import { useSiteSettings } from "../../src/chrome/SiteSettingsProvider";
import { API_BASE, TREE_SLUG } from "../../src/lib/config";
import { fetchPerson } from "../../src/lib/api";

export function TuKhaiClient() {
  const settings = useSiteSettings();
  const allowSelfDeclare = settings.tree?.allowSelfDeclare !== false;
  const { user, loading: authLoading, getAccessToken, login } = useAuth();
  const [code, setCode] = useState("");
  const [fullName, setFullName] = useState("");
  const [notes, setNotes] = useState("");
  const [lifeStatus, setLifeStatus] = useState("alive");
  const [summary, setSummary] = useState("");
  const [personId, setPersonId] = useState<number | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!code.trim()) {
      setPersonId(null);
      return;
    }
    const t = window.setTimeout(() => {
      void (async () => {
        const p = await fetchPerson(code.trim());
        if (p) {
          setPersonId(typeof p.id === "number" ? p.id : Number(p.id) || null);
          setFullName(p.fullName ?? "");
          setLifeStatus(p.lifeStatus === "deceased" ? "deceased" : "alive");
        }
      })();
    }, 300);
    return () => window.clearTimeout(t);
  }, [code]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErr(null);
    setMsg(null);
    if (!API_BASE) {
      setErr("Không kết nối được máy chủ. Thử lại sau.");
      return;
    }
    if (!allowSelfDeclare) {
      setErr("Dòng họ đang tạm khóa chức năng tự khai hồ sơ.");
      return;
    }
    if (!personId) {
      setErr("Nhập mã hiệu người hợp lệ trong cây.");
      return;
    }
    setBusy(true);
    try {
      const token = await getAccessToken();
      const body = {
        entityType: "person",
        summary: summary.trim() || `Sửa hồ sơ ${code.trim()}`,
        person: { id: personId },
        diffJson: JSON.stringify({
          action: "update",
          fields: {
            fullName: fullName.trim(),
            notes: notes.trim() || null,
            lifeStatus,
          },
        }),
      };
      const res = await fetch(
        `${API_BASE}/api/v1/trees/${encodeURIComponent(TREE_SLUG)}/change-requests`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(body),
        },
      );
      if (!res.ok) {
        setErr((await res.text()).slice(0, 280) || `HTTP ${res.status}`);
        return;
      }
      const created = (await res.json()) as { id?: number };
      setMsg(`Đã gửi yêu cầu #${created.id ?? "?"} — chờ duyệt.`);
      setSummary("");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Gửi thất bại.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <PageShell title="Tự khai hồ sơ" lead="Gửi đề xuất sửa nhánh — chờ tộc trưởng duyệt.">
      {!allowSelfDeclare ? (
        <Alert title="Tạm khóa" variant="info">
          Ban quản trị đang tạm khóa tự khai. Liên hệ thư ký dòng họ nếu cần sửa hồ sơ.
        </Alert>
      ) : authLoading ? (
        <p style={{ fontFamily: "var(--font-body)", color: "var(--color-text-muted)" }}>Đang tải…</p>
      ) : !user ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-md)", maxWidth: 480 }}>
          <Alert title="Cần đăng nhập" variant="info">
            Đăng nhập để gửi yêu cầu tự khai (chờ tộc trưởng duyệt).
          </Alert>
          <Button type="button" onClick={() => void login()}>
            Đăng nhập
          </Button>
        </div>
      ) : (
        <form
          onSubmit={onSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-md)", maxWidth: 560 }}
        >
          <p style={{ fontFamily: "var(--font-body)", color: "var(--color-text-muted)", margin: 0 }}>
            Thay đổi chỉ áp dụng sau khi thư ký hoặc tộc trưởng duyệt.
          </p>
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
          <FormField label="Mã hiệu người" required hint="VD: A7">
            <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="A7" />
          </FormField>
          <FormField label="Họ tên đề xuất" required>
            <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </FormField>
          <FormField label="Trạng thái sống">
            <Select
              value={lifeStatus}
              onChange={(e) => setLifeStatus(e.target.value)}
              options={[
                { value: "alive", label: "Còn sống" },
                { value: "deceased", label: "Đã mất" },
              ]}
            />
          </FormField>
          <FormField label="Ghi chú đề xuất">
            <Textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </FormField>
          <FormField label="Tóm tắt yêu cầu">
            <Input
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Sửa ngày / tên / ghi chú…"
            />
          </FormField>
          <Button type="submit" disabled={busy || !fullName.trim()}>
            {busy ? "Đang gửi…" : "Gửi tự khai"}
          </Button>
        </form>
      )}
    </PageShell>
  );
}

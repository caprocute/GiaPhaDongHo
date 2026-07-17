import { useEffect, useState } from "react";
import { useAuth } from "@giapha/auth";
import { Alert, Button } from "@giapha/ui";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { defaultTreeSlug } from "../api/genealogyApi";
import { apiBase, ApiError, apiFetch } from "../api/http";

type Stats = {
  persons?: number;
  donationCampaigns?: number;
  events?: number;
  scholarshipApproved?: number;
  modulesEnabled?: number;
};

export function DashboardPage() {
  const { getAccessToken } = useAuth();
  const slug = defaultTreeSlug();
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [exportMsg, setExportMsg] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const token = await getAccessToken();
        setStats(
          await apiFetch<Stats>(`/api/v1/system/dashboard?tree=${encodeURIComponent(slug)}`, {
            token,
          }),
        );
      } catch (e) {
        setError(e instanceof ApiError ? e.message : "Không tải dashboard.");
      }
    })();
  }, [getAccessToken, slug]);

  async function exportBook() {
    setExportMsg(null);
    try {
      const token = await getAccessToken();
      const r = await apiFetch<{ downloadUrl?: string; bytes?: number; engine?: string }>(
        `/api/v1/trees/${encodeURIComponent(slug)}/book/export`,
        { method: "POST", body: {}, token },
      );
      setExportMsg(`PDF ${r.bytes ?? 0} bytes (${r.engine})`);
      if (r.downloadUrl) window.open(r.downloadUrl, "_blank", "noopener,noreferrer");
    } catch (e) {
      setExportMsg(e instanceof ApiError ? e.message : "Xuất PDF thất bại.");
    }
  }

  const chartData = [
    { name: "Thành viên", value: stats?.persons ?? 0 },
    { name: "Chiến dịch", value: stats?.donationCampaigns ?? 0 },
    { name: "Sự kiện", value: stats?.events ?? 0 },
    { name: "Khuyến học", value: stats?.scholarshipApproved ?? 0 },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-lg)" }}>
      <div>
        <h1 style={{ fontFamily: "var(--font-display)", margin: 0 }}>Bảng điều khiển</h1>
        <p style={{ margin: 0, color: "var(--color-text-muted)", fontFamily: "var(--font-body)" }}>
          Thống kê cây <code>{slug}</code> · R2.8 · API base {apiBase() || "(chưa cấu hình)"}
        </p>
      </div>

      {error ? (
        <Alert title="Lỗi" variant="error">
          {error}
        </Alert>
      ) : null}
      {exportMsg ? (
        <Alert title="Xuất sách" variant="info">
          {exportMsg}
        </Alert>
      ) : null}

      <div style={{ height: 280, width: "100%", maxWidth: 640 }}>
        <ResponsiveContainer>
          <BarChart data={chartData}>
            <CartesianGrid stroke="var(--color-border-subtle)" strokeDasharray="3 3" />
            <XAxis dataKey="name" stroke="var(--color-text-muted)" />
            <YAxis allowDecimals={false} stroke="var(--color-text-muted)" />
            <Tooltip />
            <Bar dataKey="value" fill="var(--color-action-primary-bg)" radius={4} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <p style={{ fontFamily: "var(--font-body)", color: "var(--color-text-muted)" }}>
        Module đang bật: {stats?.modulesEnabled ?? "—"}
      </p>

      <Button type="button" onClick={() => void exportBook()}>
        Xuất sách gia phả PDF (R2.7)
      </Button>
    </div>
  );
}

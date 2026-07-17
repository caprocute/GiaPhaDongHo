import { useEffect, useState } from "react";
import { useAuth } from "@giapha/auth";
import { Alert, Button, KPICard } from "@giapha/ui";
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
import { ApiError, apiFetch } from "../api/http";

type Stats = {
  persons?: number;
  donationCampaigns?: number;
  events?: number;
  scholarshipApproved?: number;
  modulesEnabled?: number;
};

const kpiGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: "var(--spacing-md)",
};

const section: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "var(--spacing-sm)",
};

const sectionHead: React.CSSProperties = {
  fontSize: 10.5,
  fontWeight: 700,
  letterSpacing: "0.22em",
  textTransform: "uppercase",
  color: "var(--color-heritage-deep)",
  fontFamily: "var(--font-body)",
  marginBottom: 4,
};

export function DashboardPage() {
  const { getAccessToken, user } = useAuth();
  const slug = defaultTreeSlug();
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [exportMsg, setExportMsg] = useState<string | null>(null);

  const name = user?.profile?.preferred_username ?? user?.profile?.name ?? "quản trị viên";

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
        setError(e instanceof ApiError ? e.message : "Không tải được số liệu.");
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
      setExportMsg(`PDF sẵn sàng${r.bytes ? ` (${Math.round(r.bytes / 1024)} KB)` : ""}`);
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
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-xl)" }}>
      <div>
        <div style={sectionHead}>Quản trị tộc sự</div>
        <h1 style={{ fontFamily: "var(--font-display)", margin: 0, fontSize: "clamp(1.4rem, 2.5vw, 2rem)", fontWeight: 700 }}>
          Xin chào, {name}
        </h1>
      </div>

      {error ? (
        <Alert title="Lỗi tải số liệu" variant="error">{error}</Alert>
      ) : null}
      {exportMsg ? (
        <Alert title="Xuất sách gia phả" variant="info">{exportMsg}</Alert>
      ) : null}

      <div style={section}>
        <div style={sectionHead}>Tổng quan</div>
        <div style={kpiGrid}>
          <KPICard
            label="Thành viên trong phả"
            value={(stats?.persons ?? "—").toLocaleString("vi-VN")}
            delta={stats ? undefined : "Đang tải…"}
          />
          <KPICard
            label="Chiến dịch công đức"
            value={stats?.donationCampaigns ?? "—"}
          />
          <KPICard
            label="Sự kiện"
            value={stats?.events ?? "—"}
          />
          <KPICard
            label="Khuyến học được duyệt"
            value={stats?.scholarshipApproved ?? "—"}
          />
        </div>
      </div>

      <div style={section}>
        <div style={sectionHead}>Biểu đồ hoạt động</div>
        <div style={{ height: 260, width: "100%", maxWidth: 600 }}>
          <ResponsiveContainer>
            <BarChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
              <CartesianGrid stroke="var(--color-border-subtle)" strokeDasharray="3 3" />
              <XAxis dataKey="name" stroke="var(--color-text-muted)" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} stroke="var(--color-text-muted)" tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="value" fill="var(--color-action-primary-bg)" radius={3} name="Số lượng" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={section}>
        <div style={sectionHead}>Thao tác nhanh</div>
        <div style={{ display: "flex", gap: "var(--spacing-sm)", flexWrap: "wrap" }}>
          <Button type="button" onClick={() => void exportBook()}>
            Xuất sách PDF
          </Button>
        </div>
        {stats?.modulesEnabled != null ? (
          <p style={{ fontFamily: "var(--font-body)", color: "var(--color-text-muted)", fontSize: 13, margin: 0 }}>
            {stats.modulesEnabled} module đang bật
          </p>
        ) : null}
      </div>
    </div>
  );
}

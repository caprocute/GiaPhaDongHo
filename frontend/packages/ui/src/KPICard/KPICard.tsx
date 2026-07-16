import type { CSSProperties, ReactNode } from "react";

export type KPITrend = "up" | "down" | "neutral";

export interface KPICardProps {
  label: string;
  value: ReactNode;
  delta?: string;
  trend?: KPITrend;
}

export function KPICard({ label, value, delta, trend = "neutral" }: KPICardProps) {
  const card: CSSProperties = {
    background: "var(--color-surface-card)",
    border: "1px solid var(--color-border-strong)",
    padding: "17px 19px",
    boxShadow: "var(--shadow-sm)",
    position: "relative",
  };
  const accent: CSSProperties = {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 2.5,
    background: "var(--color-heritage-line)",
  };
  const lbl: CSSProperties = {
    fontSize: 10.5,
    color: "var(--color-text-muted)",
    fontWeight: 700,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
  };
  const val: CSSProperties = {
    fontFamily: "var(--font-heading)",
    fontSize: 30,
    marginTop: "var(--spacing-xs)",
    fontVariantNumeric: "tabular-nums",
    fontWeight: 700,
  };
  const trendColors: Record<KPITrend, string> = {
    up: "var(--color-status-success)",
    down: "var(--color-status-danger)",
    neutral: "var(--color-status-warning)",
  };
  const deltaStyle: CSSProperties = {
    fontSize: 11.5,
    marginTop: 4,
    fontWeight: 600,
    color: trendColors[trend],
  };

  return (
    <div style={card}>
      <div style={accent} />
      <div style={lbl}>{label}</div>
      <div style={val}>{value}</div>
      {delta && <div style={deltaStyle}>{delta}</div>}
    </div>
  );
}

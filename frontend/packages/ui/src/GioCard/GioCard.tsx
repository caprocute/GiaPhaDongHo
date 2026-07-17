import type { CSSProperties } from "react";

export interface GioCardProps {
  day: string;
  month: string;
  name: string;
  tag?: string;
}

export function GioCard({ day, month, name, tag }: GioCardProps) {
  const card: CSSProperties = {
    flex: "none",
    width: 154,
    background: "var(--color-surface-card)",
    border: "1px solid var(--color-border-strong)",
    padding: "14px 15px 13px",
    position: "relative",
    boxShadow: "var(--shadow-sm)",
  };
  const topAccent: CSSProperties = {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    background: "var(--gradient-foil)",
  };
  const dayStyle: CSSProperties = {
    fontFamily: "var(--font-display)",
    fontSize: 28,
    color: "var(--color-action-primary-bg)",
    lineHeight: 1,
    fontWeight: 700,
    marginTop: 4,
    fontVariantNumeric: "tabular-nums",
  };
  const monthStyle: CSSProperties = {
    fontSize: 10,
    color: "var(--color-heritage-deep)",
    letterSpacing: "0.18em",
    textTransform: "uppercase",
    margin: "3px 0 9px",
    fontWeight: 700,
  };
  const nameStyle: CSSProperties = {
    fontSize: 13.5,
    fontWeight: 600,
    lineHeight: 1.4,
    fontFamily: "var(--font-display)",
  };
  const tagStyle: CSSProperties = {
    display: "inline-block",
    marginTop: 9,
    fontSize: 10,
    padding: "2px 9px",
    background: "var(--color-heritage-soft)",
    color: "var(--color-action-primary-bg)",
    fontWeight: 700,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
  };

  return (
    <div style={card}>
      <div style={topAccent} />
      <div style={dayStyle}>{day}</div>
      <div style={monthStyle}>{month}</div>
      <div style={nameStyle}>{name}</div>
      {tag && <span style={tagStyle}>{tag}</span>}
    </div>
  );
}

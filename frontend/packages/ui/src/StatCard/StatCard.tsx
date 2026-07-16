import type { CSSProperties, ReactNode } from "react";

export interface StatCardProps {
  value: ReactNode;
  label: string;
}

export function StatCard({ value, label }: StatCardProps) {
  const card: CSSProperties = {
    background: "var(--color-surface-card)",
    border: "1px solid var(--color-border-strong)",
    padding: "var(--spacing-lg) var(--spacing-md) var(--spacing-md)",
    textAlign: "center",
    position: "relative",
  };
  const accent: CSSProperties = {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    background: "var(--color-heritage-line)",
  };
  const val: CSSProperties = {
    fontFamily: "var(--font-display)",
    fontSize: "var(--font-size-display)",
    color: "var(--color-action-primary-bg)",
    fontVariantNumeric: "tabular-nums",
    fontWeight: 700,
  };
  const lbl: CSSProperties = {
    fontSize: "var(--font-size-xs)",
    letterSpacing: "0.22em",
    textTransform: "uppercase",
    color: "var(--color-text-muted)",
    marginTop: "var(--spacing-xs)",
    fontWeight: 600,
  };
  const foilAccent: CSSProperties = {
    ...accent,
    background: "var(--gradient-foil)",
  };
  const inner: CSSProperties = {
    position: "absolute",
    inset: 4,
    border: "1px solid color-mix(in srgb, var(--color-heritage-line) 45%, transparent)",
    pointerEvents: "none",
  };

  return (
    <div style={card}>
      <div style={foilAccent} />
      <div style={inner} aria-hidden />
      <div style={val}>{value}</div>
      <div style={lbl}>{label}</div>
    </div>
  );
}

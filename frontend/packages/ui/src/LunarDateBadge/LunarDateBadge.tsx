import type { CSSProperties } from "react";
import { convertSolarToLunar, getCanChi } from "@giapha/lunar";
import { Badge } from "../Badge/Badge";

export interface LunarDateBadgeProps {
  day: number;
  month: number;
  year: number;
}

export function LunarDateBadge({ day, month, year }: LunarDateBadgeProps) {
  const lunar = convertSolarToLunar(day, month, year);
  const canChi = getCanChi(day, month, year, "day");
  const leap = lunar.leap ? " (nhuận)" : "";

  const style: CSSProperties = {
    display: "inline-flex",
    flexDirection: "column",
    gap: "var(--spacing-xs)",
    padding: "var(--spacing-sm)",
    border: "1px solid var(--color-heritage-frame)",
    borderRadius: "var(--radius-md)",
    background: "var(--color-surface-page)",
    color: "var(--color-text-primary)",
    fontFamily: "var(--font-display)",
  };

  return (
    <div style={style}>
      <Badge tone="accent">
        {lunar.day}/{lunar.month}/{lunar.year}
        {leap}
      </Badge>
      <span style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)" }}>{canChi.label}</span>
    </div>
  );
}

import type { CSSProperties, ReactNode } from "react";

export type BadgeTone = "default" | "accent" | "success" | "warning" | "error";

export interface BadgeProps {
  children: ReactNode;
  tone?: BadgeTone;
}

const tones: Record<BadgeTone, CSSProperties> = {
  default: {
    background: "var(--color-surface-page)",
    color: "var(--color-text-primary)",
  },
  accent: {
    background: "var(--color-heritage-accent)",
    color: "var(--color-text-primary)",
  },
  success: {
    background: "var(--color-status-success-bg)",
    color: "var(--color-status-success-fg)",
  },
  warning: {
    background: "var(--color-status-warning-bg)",
    color: "var(--color-status-warning-fg)",
  },
  error: {
    background: "var(--color-status-error-bg)",
    color: "var(--color-status-error-fg)",
  },
};

export function Badge({ children, tone = "default" }: BadgeProps) {
  const style: CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    padding: "2px var(--spacing-sm)",
    borderRadius: "var(--radius-sm)",
    fontFamily: "var(--font-body)",
    fontSize: "var(--font-size-sm)",
    ...tones[tone],
  };

  return <span style={style}>{children}</span>;
}

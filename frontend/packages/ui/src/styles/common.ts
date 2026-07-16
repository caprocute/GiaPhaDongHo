import type { CSSProperties } from "react";

export const focusRing: CSSProperties = {
  outline: "2px solid var(--color-focus-ring)",
  outlineOffset: "2px",
};

export const cardSurface: CSSProperties = {
  background: "var(--color-surface-card)",
  border: "1px solid var(--color-border-subtle)",
  borderRadius: "var(--radius-md)",
  boxShadow: "var(--shadow-sm)",
};

export const bodyText: CSSProperties = {
  color: "var(--color-text-primary)",
  fontFamily: "var(--font-body)",
  fontSize: "var(--font-size-md)",
};

export const mutedText: CSSProperties = {
  color: "var(--color-text-muted)",
  fontFamily: "var(--font-body)",
  fontSize: "var(--font-size-sm)",
};

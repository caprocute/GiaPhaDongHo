import type { CSSProperties, ReactNode } from "react";
import { Button } from "../Button/Button";

export interface DialogProps {
  open: boolean;
  title: string;
  children?: ReactNode;
  onClose: () => void;
}

export function Dialog({ open, title, children, onClose }: DialogProps) {
  if (!open) return null;

  const overlay: CSSProperties = {
    position: "fixed",
    inset: 0,
    background: "color-mix(in srgb, var(--color-ink-900) 40%, transparent)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  };

  const panel: CSSProperties = {
    width: "min(480px, 92vw)",
    padding: "var(--spacing-lg)",
    background: "var(--color-surface-card)",
    borderRadius: "var(--radius-lg)",
    boxShadow: "var(--shadow-md)",
    color: "var(--color-text-primary)",
    fontFamily: "var(--font-body)",
  };

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="dialog-title" style={overlay}>
      <div style={panel}>
        <h2 id="dialog-title" style={{ fontFamily: "var(--font-display)", marginBottom: "var(--spacing-md)" }}>
          {title}
        </h2>
        <div style={{ marginBottom: "var(--spacing-md)" }}>{children}</div>
        <Button variant="secondary" onClick={onClose}>
          Đóng
        </Button>
      </div>
    </div>
  );
}

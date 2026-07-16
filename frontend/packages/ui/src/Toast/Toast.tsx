import type { CSSProperties } from "react";

export interface ToastProps {
  message: string;
  visible?: boolean;
}

export function Toast({ message, visible = true }: ToastProps) {
  if (!visible) return null;

  const style: CSSProperties = {
    position: "fixed",
    bottom: "var(--spacing-lg)",
    right: "var(--spacing-lg)",
    padding: "var(--spacing-md)",
    background: "var(--color-surface-card)",
    color: "var(--color-text-primary)",
    border: "1px solid var(--color-border-subtle)",
    borderRadius: "var(--radius-md)",
    boxShadow: "var(--shadow-md)",
    fontFamily: "var(--font-body)",
    zIndex: 1000,
  };

  return (
    <div role="status" aria-live="polite" style={style}>
      {message}
    </div>
  );
}

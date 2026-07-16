import type { CSSProperties, ReactNode } from "react";

export type AlertVariant = "info" | "success" | "error";

export interface AlertProps {
  title: string;
  children?: ReactNode;
  variant?: AlertVariant;
}

const variants: Record<AlertVariant, CSSProperties> = {
  info: {
    background: "var(--color-status-info-bg)",
    color: "var(--color-status-info-fg)",
    borderColor: "var(--color-border-subtle)",
  },
  success: {
    background: "var(--color-status-success-bg)",
    color: "var(--color-status-success-fg)",
    borderColor: "var(--color-border-subtle)",
  },
  error: {
    background: "var(--color-status-error-bg)",
    color: "var(--color-status-error-fg)",
    borderColor: "var(--color-status-error-fg)",
  },
};

export function Alert({ title, children, variant = "info" }: AlertProps) {
  const style: CSSProperties = {
    padding: "var(--spacing-md)",
    borderRadius: "var(--radius-md)",
    border: "1px solid",
    fontFamily: "var(--font-body)",
    ...variants[variant],
  };

  return (
    <div role="alert" style={style}>
      <strong style={{ display: "block", marginBottom: "var(--spacing-xs)" }}>{title}</strong>
      {children}
    </div>
  );
}
